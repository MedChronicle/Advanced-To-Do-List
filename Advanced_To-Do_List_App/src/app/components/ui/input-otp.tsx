"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp@1.4.2";
import { MinusIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

/* -------------------------------------------------------------------------- */
/*  Shared style context (size / status / mask)                               */
/* -------------------------------------------------------------------------- */

type OTPSize = "sm" | "md" | "lg";
type OTPStatus = "idle" | "error" | "success";

interface OTPStyleContextValue {
  size: OTPSize;
  status: OTPStatus;
  mask: boolean;
}

const OTPStyleContext = React.createContext<OTPStyleContextValue>({
  size: "md",
  status: "idle",
  mask: false,
});

const sizeClasses: Record<OTPSize, string> = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
};

const statusClasses: Record<OTPStatus, string> = {
  idle: "",
  error: "border-destructive text-destructive",
  success: "border-green-500 text-green-600 dark:text-green-400",
};

/* -------------------------------------------------------------------------- */
/*  Primitives                                                                */
/* -------------------------------------------------------------------------- */

type InputOTPProps = React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
  /** Visual size of every slot. */
  size?: OTPSize;
  /** Validation state – colours the slots and sets aria-invalid. */
  status?: OTPStatus;
  /** Hide entered characters (shows a dot instead). */
  mask?: boolean;
};

function InputOTP({
  className,
  containerClassName,
  size = "md",
  status = "idle",
  mask = false,
  inputMode = "numeric",
  autoComplete = "one-time-code",
  ...props
}: InputOTPProps) {
  const ctx = React.useMemo(() => ({ size, status, mask }), [size, status, mask]);

  return (
    <OTPStyleContext.Provider value={ctx}>
      <OTPInput
        data-slot="input-otp"
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-invalid={status === "error" || undefined}
        containerClassName={cn(
          "flex items-center gap-2 has-disabled:opacity-50",
          containerClassName,
        )}
        className={cn("disabled:cursor-not-allowed", className)}
        {...props}
      />
    </OTPStyleContext.Provider>
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & { index: number }) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { size, status, mask } = React.useContext(OTPStyleContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      data-filled={!!char}
      aria-invalid={status === "error" || undefined}
      className={cn(
        "data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex items-center justify-center border-y border-r bg-input-background font-medium tabular-nums transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]",
        sizeClasses[size],
        statusClasses[status],
        className,
      )}
      {...props}
    >
      {char ? (mask ? <span aria-hidden className="size-2 rounded-full bg-current" /> : char) : null}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hooks                                                                     */
/* -------------------------------------------------------------------------- */

/** Simple countdown used for the "resend code" cooldown. */
function useCountdown(initialSeconds = 30) {
  const [seconds, setSeconds] = React.useState(initialSeconds);

  React.useEffect(() => {
    if (seconds <= 0) return;
    const id = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [seconds]);

  const reset = React.useCallback(
    (next = initialSeconds) => setSeconds(next),
    [initialSeconds],
  );

  return { seconds, isRunning: seconds > 0, reset };
}

/**
 * Auto-fills the code from an incoming SMS using the WebOTP API
 * (Chrome on Android). Silently no-ops everywhere else.
 */
function useWebOTP(onCode: (code: string) => void, enabled = true) {
  const onCodeRef = React.useRef(onCode);
  onCodeRef.current = onCode;

  React.useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (!("OTPCredential" in window)) return;

    const controller = new AbortController();
    (navigator.credentials as any)
      .get({ otp: { transport: ["sms"] }, signal: controller.signal })
      .then((cred: { code?: string } | null) => {
        if (cred?.code) onCodeRef.current(cred.code);
      })
      .catch(() => {
        /* user dismissed or unsupported – ignore */
      });

    return () => controller.abort();
  }, [enabled]);
}

/* -------------------------------------------------------------------------- */
/*  Advanced, batteries-included field                                        */
/* -------------------------------------------------------------------------- */

interface OTPFieldProps {
  /** Number of digits/characters. Default 6. */
  length?: number;
  /** Insert a separator after these slot counts, e.g. [3] -> 123-456. */
  separatorAfter?: number[];
  size?: OTPSize;
  mask?: boolean;
  /** Allow letters as well as digits. */
  alphanumeric?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Controlled value. */
  value?: string;
  onValueChange?: (value: string) => void;
  /**
   * Called once when all slots are filled. May be async:
   * throw / reject (or return false) to show the error state.
   */
  onComplete?: (code: string) => void | boolean | Promise<void | boolean>;
  /** Called when the user asks for a new code. */
  onResend?: () => void | Promise<void>;
  resendCooldown?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Externally supplied error message (overrides internal state). */
  error?: string;
  className?: string;
}

function OTPField({
  length = 6,
  separatorAfter,
  size = "md",
  mask = false,
  alphanumeric = false,
  label,
  description,
  value: controlledValue,
  onValueChange,
  onComplete,
  onResend,
  resendCooldown = 30,
  disabled,
  autoFocus = true,
  error,
  className,
}: OTPFieldProps) {
  const id = React.useId();
  const [internalValue, setInternalValue] = React.useState("");
  const [status, setStatus] = React.useState<OTPStatus>("idle");
  const [internalError, setInternalError] = React.useState<string>();
  const [verifying, setVerifying] = React.useState(false);
  const { seconds, isRunning, reset } = useCountdown(resendCooldown);

  const value = controlledValue ?? internalValue;
  const errorMessage = error ?? internalError;
  const effectiveStatus: OTPStatus = error ? "error" : status;

  const setValue = React.useCallback(
    (next: string) => {
      setInternalValue(next);
      onValueChange?.(next);
    },
    [onValueChange],
  );

  const handleChange = (next: string) => {
    // Clear any previous error as soon as the user edits.
    if (status !== "idle") setStatus("idle");
    if (internalError) setInternalError(undefined);
    setValue(next);
  };

  const handleComplete = async (code: string) => {
    if (!onComplete) return;
    setVerifying(true);
    try {
      const result = await onComplete(code);
      if (result === false) throw new Error("Invalid code");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setInternalError(
        err instanceof Error && err.message ? err.message : "Invalid code",
      );
    } finally {
      setVerifying(false);
    }
  };

  useWebOTP((code) => {
    const clean = code.slice(0, length);
    setValue(clean);
    if (clean.length === length) void handleComplete(clean);
  }, !disabled);

  const handleResend = async () => {
    if (isRunning) return;
    setValue("");
    setStatus("idle");
    setInternalError(undefined);
    reset(resendCooldown);
    await onResend?.();
  };

  const pattern = alphanumeric ? "^[a-zA-Z0-9]*$" : "^[0-9]*$";

  // Build groups of slots, split at the requested separator positions.
  const groups = React.useMemo(() => {
    const breaks = [...(separatorAfter ?? []), length]
      .filter((n) => n > 0 && n <= length)
      .sort((a, b) => a - b);
    const result: number[][] = [];
    let start = 0;
    for (const end of breaks) {
      if (end > start) {
        result.push(Array.from({ length: end - start }, (_, i) => start + i));
        start = end;
      }
    }
    return result;
  }, [length, separatorAfter]);

  const describedBy = [
    description ? `${id}-desc` : null,
    errorMessage ? `${id}-err` : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium leading-none">
          {label}
        </label>
      )}

      <InputOTP
        id={id}
        maxLength={length}
        value={value}
        onChange={handleChange}
        onComplete={handleComplete}
        pattern={pattern}
        inputMode={alphanumeric ? "text" : "numeric"}
        size={size}
        mask={mask}
        status={effectiveStatus}
        disabled={disabled || verifying}
        autoFocus={autoFocus}
        aria-describedby={describedBy}
      >
        {groups.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && <InputOTPSeparator />}
            <InputOTPGroup>
              {group.map((index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
            </InputOTPGroup>
          </React.Fragment>
        ))}
      </InputOTP>

      {description && !errorMessage && (
        <p id={`${id}-desc`} className="text-muted-foreground text-sm">
          {description}
        </p>
      )}

      <p
        id={`${id}-err`}
        role="alert"
        aria-live="polite"
        className={cn(
          "text-destructive text-sm",
          !errorMessage && "sr-only",
        )}
      >
        {errorMessage}
      </p>

      {effectiveStatus === "success" && (
        <p role="status" className="text-sm text-green-600 dark:text-green-400">
          Code verified
        </p>
      )}

      {onResend && (
        <div className="text-muted-foreground flex items-center gap-1 text-sm">
          <span>Didn&apos;t get a code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={isRunning || disabled}
            className="text-foreground font-medium underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
          >
            {isRunning ? `Resend in ${seconds}s` : "Resend"}
          </button>
        </div>
      )}
    </div>
  );
}

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  OTPField,
  useCountdown,
  useWebOTP,
};
export type { InputOTPProps, OTPFieldProps, OTPSize, OTPStatus };
