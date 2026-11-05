"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog@1.1.6";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonAlertIcon,
  TriangleAlertIcon,
} from "lucide-react@0.487.0";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";
import { buttonVariants } from "./button";

type Intent = "default" | "destructive" | "warning" | "success" | "info";
type Size = "sm" | "md" | "lg";

interface AlertDialogContextValue {
  intent: Intent;
  size: Size;
  pending: boolean;
  setPending: (value: boolean) => void;
  confirmed: boolean;
  setConfirmed: (value: boolean) => void;
  close: () => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue>({
  intent: "default",
  size: "md",
  pending: false,
  setPending: () => {},
  confirmed: true,
  setConfirmed: () => {},
  close: () => {},
});

const useAlertDialogContext = () => React.useContext(AlertDialogContext);

const contentVariants = cva(
  "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border p-6 shadow-xl duration-200 outline-none motion-reduce:animate-none",
  {
    variants: {
      size: {
        sm: "sm:max-w-sm",
        md: "sm:max-w-lg",
        lg: "sm:max-w-2xl",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const overlayVariants = cva(
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 motion-reduce:animate-none",
  {
    variants: {
      blur: {
        none: "",
        sm: "backdrop-blur-sm",
        md: "backdrop-blur-md",
      },
    },
    defaultVariants: { blur: "none" },
  },
);

const iconWrapVariants = cva(
  "mx-auto flex size-12 shrink-0 items-center justify-center rounded-full sm:mx-0 [&_svg]:size-6",
  {
    variants: {
      intent: {
        default: "bg-primary/10 text-primary",
        destructive: "bg-destructive/10 text-destructive",
        warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
        success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        info: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
      },
    },
    defaultVariants: { intent: "default" },
  },
);

const intentIcons: Record<Intent, React.ComponentType<{ className?: string }>> = {
  default: InfoIcon,
  destructive: OctagonAlertIcon,
  warning: TriangleAlertIcon,
  success: CircleCheckIcon,
  info: InfoIcon,
};

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  );
}

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay> &
    VariantProps<typeof overlayVariants>
>(({ className, blur, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    data-slot="alert-dialog-overlay"
    className={cn(overlayVariants({ blur }), className)}
    {...props}
  />
));
AlertDialogOverlay.displayName = "AlertDialogOverlay";

interface AlertDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> {
  intent?: Intent;
  size?: Size;
  overlayBlur?: "none" | "sm" | "md";
  overlayClassName?: string;
  lockWhilePending?: boolean;
}

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  AlertDialogContentProps
>(
  (
    {
      className,
      intent = "default",
      size = "md",
      overlayBlur = "none",
      overlayClassName,
      lockWhilePending = true,
      onEscapeKeyDown,
      ...props
    },
    ref,
  ) => {
    const [pending, setPending] = React.useState(false);
    const [confirmed, setConfirmed] = React.useState(true);
    const closeRef = React.useRef<HTMLButtonElement>(null);

    const close = React.useCallback(() => {
      closeRef.current?.click();
    }, []);

    const value = React.useMemo<AlertDialogContextValue>(
      () => ({ intent, size, pending, setPending, confirmed, setConfirmed, close }),
      [intent, size, pending, confirmed, close],
    );

    return (
      <AlertDialogContext.Provider value={value}>
        <AlertDialogPortal>
          <AlertDialogOverlay blur={overlayBlur} className={overlayClassName} />
          <AlertDialogPrimitive.Content
            ref={ref}
            data-slot="alert-dialog-content"
            data-intent={intent}
            aria-busy={pending || undefined}
            className={cn(contentVariants({ size }), className)}
            onEscapeKeyDown={(event) => {
              if (lockWhilePending && pending) event.preventDefault();
              onEscapeKeyDown?.(event);
            }}
            {...props}
          >
            {props.children}
            <AlertDialogPrimitive.Action
              ref={closeRef}
              tabIndex={-1}
              aria-hidden
              className="sr-only"
            />
          </AlertDialogPrimitive.Content>
        </AlertDialogPortal>
      </AlertDialogContext.Provider>
    );
  },
);
AlertDialogContent.displayName = "AlertDialogContent";

function AlertDialogIcon({
  className,
  children,
  intent,
  ...props
}: React.ComponentProps<"div"> & { intent?: Intent }) {
  const ctx = useAlertDialogContext();
  const resolved = intent ?? ctx.intent;
  const Icon = intentIcons[resolved];
  return (
    <div
      data-slot="alert-dialog-icon"
      aria-hidden
      className={cn(iconWrapVariants({ intent: resolved }), className)}
      {...props}
    >
      {children ?? <Icon />}
    </div>
  );
}

function AlertDialogHeader({
  className,
  icon = false,
  children,
  ...props
}: React.ComponentProps<"div"> & { icon?: boolean | React.ReactNode }) {
  if (icon) {
    return (
      <div
        data-slot="alert-dialog-header"
        className={cn(
          "flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left",
          className,
        )}
        {...props}
      >
        <AlertDialogIcon>{icon === true ? undefined : icon}</AlertDialogIcon>
        <div className="flex flex-1 flex-col gap-2">{children}</div>
      </div>
    );
  }
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    data-slot="alert-dialog-title"
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    data-slot="alert-dialog-description"
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

interface AlertDialogActionProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>,
    "onClick"
  > {
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void | Promise<unknown>;
  onError?: (error: unknown) => void;
  loading?: boolean;
  loadingText?: React.ReactNode;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  requireConfirmation?: boolean;
}

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  AlertDialogActionProps
>(
  (
    {
      className,
      children,
      onClick,
      onError,
      loading,
      loadingText,
      variant,
      disabled,
      requireConfirmation = true,
      ...props
    },
    ref,
  ) => {
    const ctx = useAlertDialogContext();
    const isLoading = loading ?? ctx.pending;
    const resolvedVariant =
      variant ?? (ctx.intent === "destructive" ? "destructive" : "default");
    const blocked = requireConfirmation && !ctx.confirmed;

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading || blocked) {
        event.preventDefault();
        return;
      }
      let result: void | Promise<unknown>;
      try {
        result = onClick?.(event);
      } catch (error) {
        event.preventDefault();
        onError?.(error);
        return;
      }
      if (result && typeof (result as Promise<unknown>).then === "function") {
        event.preventDefault();
        ctx.setPending(true);
        try {
          await result;
          ctx.setPending(false);
          ctx.close();
        } catch (error) {
          ctx.setPending(false);
          onError?.(error);
        }
      }
    };

    return (
      <AlertDialogPrimitive.Action
        ref={ref}
        data-slot="alert-dialog-action"
        aria-disabled={disabled || blocked || isLoading || undefined}
        disabled={disabled || blocked}
        className={cn(
          buttonVariants({ variant: resolvedVariant }),
          isLoading && "pointer-events-none",
          className,
        )}
        onClick={handleClick}
        {...props}
      >
        {isLoading && <Loader2Icon className="size-4 animate-spin" />}
        {isLoading && loadingText ? loadingText : children}
      </AlertDialogPrimitive.Action>
    );
  },
);
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, disabled, ...props }, ref) => {
  const ctx = useAlertDialogContext();
  return (
    <AlertDialogPrimitive.Cancel
      ref={ref}
      data-slot="alert-dialog-cancel"
      disabled={disabled || ctx.pending}
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  );
});
AlertDialogCancel.displayName = "AlertDialogCancel";

interface AlertDialogConfirmInputProps
  extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  expected: string;
  caseSensitive?: boolean;
  label?: React.ReactNode;
  labelClassName?: string;
}

function AlertDialogConfirmInput({
  expected,
  caseSensitive = true,
  label,
  labelClassName,
  className,
  id,
  ...props
}: AlertDialogConfirmInputProps) {
  const { setConfirmed, pending } = useAlertDialogContext();
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    setConfirmed(false);
    return () => setConfirmed(true);
  }, [setConfirmed]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setValue(next);
    const a = caseSensitive ? next.trim() : next.trim().toLowerCase();
    const b = caseSensitive ? expected : expected.toLowerCase();
    setConfirmed(a === b);
  };

  return (
    <div data-slot="alert-dialog-confirm" className="grid gap-2">
      <label
        htmlFor={inputId}
        className={cn("text-sm font-medium", labelClassName)}
      >
        {label ?? (
          <>
            Type <span className="font-mono font-semibold">{expected}</span> to
            confirm
          </>
        )}
      </label>
      <input
        id={inputId}
        value={value}
        onChange={handleChange}
        disabled={pending}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className={cn(
          "border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px] disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

interface ConfirmOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  intent?: Intent;
  size?: Size;
  requireText?: string;
  showIcon?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<ConfirmFn | null>(null);

function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null);
  const resolverRef = React.useRef<((value: boolean) => void) | null>(null);

  const settle = React.useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
  }, []);

  const confirm = React.useCallback<ConfirmFn>(
    (next) =>
      new Promise<boolean>((resolve) => {
        resolverRef.current?.(false);
        resolverRef.current = resolve;
        setOptions(next);
        setOpen(true);
      }),
    [],
  );

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) settle(false);
        }}
      >
        {options && (
          <AlertDialogContent intent={options.intent} size={options.size}>
            <AlertDialogHeader icon={options.showIcon ?? true}>
              <AlertDialogTitle>{options.title}</AlertDialogTitle>
              {options.description && (
                <AlertDialogDescription>
                  {options.description}
                </AlertDialogDescription>
              )}
            </AlertDialogHeader>
            {options.requireText && (
              <AlertDialogConfirmInput expected={options.requireText} />
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>
                {options.cancelLabel ?? "Cancel"}
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => settle(true)}>
                {options.confirmLabel ?? "Continue"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

function useConfirm(): ConfirmFn {
  const confirm = React.useContext(ConfirmContext);
  if (!confirm) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return confirm;
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogIcon,
  AlertDialogConfirmInput,
  ConfirmProvider,
  useConfirm,
  useAlertDialogContext,
};
export type {
  AlertDialogContentProps,
  AlertDialogActionProps,
  AlertDialogConfirmInputProps,
  ConfirmOptions,
};
