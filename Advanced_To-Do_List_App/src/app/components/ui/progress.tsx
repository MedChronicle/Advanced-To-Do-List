"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress@1.1.2";
import { cva } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

type ProgressIntent = "default" | "success" | "warning" | "destructive" | "info";
type ProgressSize = "xs" | "sm" | "md" | "lg" | "xl";

const trackVariants = cva("relative w-full overflow-hidden rounded-full", {
  variants: {
    intent: {
      default: "bg-primary/20",
      success: "bg-emerald-500/20",
      warning: "bg-amber-500/20",
      destructive: "bg-destructive/20",
      info: "bg-sky-500/20",
    },
    size: {
      xs: "h-1",
      sm: "h-1.5",
      md: "h-2",
      lg: "h-3",
      xl: "h-4",
    },
  },
  defaultVariants: { intent: "default", size: "md" },
});

const indicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-300 ease-out motion-reduce:transition-none",
  {
    variants: {
      intent: {
        default: "bg-primary",
        success: "bg-emerald-500",
        warning: "bg-amber-500",
        destructive: "bg-destructive",
        info: "bg-sky-500",
      },
    },
    defaultVariants: { intent: "default" },
  },
);

const bufferVariants = cva("absolute inset-y-0 left-0 transition-all duration-300", {
  variants: {
    intent: {
      default: "bg-primary/30",
      success: "bg-emerald-500/30",
      warning: "bg-amber-500/30",
      destructive: "bg-destructive/30",
      info: "bg-sky-500/30",
    },
  },
  defaultVariants: { intent: "default" },
});

const circleColor: Record<ProgressIntent, string> = {
  default: "text-primary",
  success: "text-emerald-500",
  warning: "text-amber-500",
  destructive: "text-destructive",
  info: "text-sky-500",
};

const circleTrackColor: Record<ProgressIntent, string> = {
  default: "text-primary/20",
  success: "text-emerald-500/20",
  warning: "text-amber-500/20",
  destructive: "text-destructive/20",
  info: "text-sky-500/20",
};

const stripeImage =
  "linear-gradient(45deg, rgba(255,255,255,.3) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.3) 50%, rgba(255,255,255,.3) 75%, transparent 75%, transparent)";

function ProgressStyles() {
  return (
    <style>{`
@keyframes ui-progress-indeterminate{0%{transform:translateX(-100%) scaleX(.4)}50%{transform:translateX(30%) scaleX(.6)}100%{transform:translateX(250%) scaleX(.4)}}
@keyframes ui-progress-stripes{from{background-position:1rem 0}to{background-position:0 0}}
@keyframes ui-progress-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.ui-progress-anim{animation:none!important}}
`}</style>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toPercent(value: number | null | undefined, max: number) {
  if (value === null || value === undefined || max <= 0) return 0;
  return clamp((value / max) * 100, 0, 100);
}

interface ProgressProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    "value"
  > {
  value?: number | null;
  intent?: ProgressIntent;
  size?: ProgressSize;
  indeterminate?: boolean;
  striped?: boolean;
  animated?: boolean;
  buffer?: number;
  label?: React.ReactNode;
  showValue?: boolean;
  valueFormat?: (value: number, percent: number) => React.ReactNode;
  wrapperClassName?: string;
  indicatorClassName?: string;
  onComplete?: () => void;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      wrapperClassName,
      indicatorClassName,
      value,
      max = 100,
      intent = "default",
      size = "md",
      indeterminate = false,
      striped = false,
      animated = false,
      buffer,
      label,
      showValue = false,
      valueFormat,
      onComplete,
      ...props
    },
    ref,
  ) => {
    const percent = toPercent(value, max);
    const completedRef = React.useRef(false);

    React.useEffect(() => {
      if (indeterminate) return;
      if (percent >= 100 && !completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
      if (percent < 100) completedRef.current = false;
    }, [percent, indeterminate, onComplete]);

    const indicatorStyle: React.CSSProperties = indeterminate
      ? {
          width: "40%",
          transform: "translateX(-100%)",
          animation: "ui-progress-indeterminate 1.4s ease-in-out infinite",
          transition: "none",
        }
      : {
          transform: `translateX(-${100 - percent}%)`,
        };

    if (striped && !indeterminate) {
      indicatorStyle.backgroundImage = stripeImage;
      indicatorStyle.backgroundSize = "1rem 1rem";
      if (animated) {
        indicatorStyle.animation = "ui-progress-stripes 1s linear infinite";
      }
    }

    const bar = (
      <ProgressPrimitive.Root
        ref={ref}
        data-slot="progress"
        data-intent={intent}
        value={indeterminate ? null : (value ?? 0)}
        max={max}
        className={cn(trackVariants({ intent, size }), className)}
        {...props}
      >
        {buffer !== undefined && !indeterminate && (
          <div
            aria-hidden
            data-slot="progress-buffer"
            className={bufferVariants({ intent })}
            style={{ width: `${toPercent(buffer, max)}%` }}
          />
        )}
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={cn(
            indicatorVariants({ intent }),
            "relative ui-progress-anim",
            indeterminate && "w-[40%] flex-none",
            indicatorClassName,
          )}
          style={indicatorStyle}
        />
      </ProgressPrimitive.Root>
    );

    const hasHeader = Boolean(label) || showValue;
    const formatted =
      valueFormat?.(value ?? 0, percent) ?? `${Math.round(percent)}%`;

    return (
      <>
        <ProgressStyles />
        {hasHeader ? (
          <div
            data-slot="progress-field"
            className={cn("grid w-full gap-1.5", wrapperClassName)}
          >
            <div className="flex items-center justify-between gap-2 text-sm">
              {label ? (
                <span className="font-medium">{label}</span>
              ) : (
                <span />
              )}
              {showValue && !indeterminate && (
                <span className="text-muted-foreground tabular-nums">
                  {formatted}
                </span>
              )}
            </div>
            {bar}
          </div>
        ) : (
          bar
        )}
      </>
    );
  },
);
Progress.displayName = "Progress";

interface ProgressCircleProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  value?: number | null;
  max?: number;
  size?: number;
  strokeWidth?: number;
  intent?: ProgressIntent;
  indeterminate?: boolean;
  showValue?: boolean;
  valueFormat?: (value: number, percent: number) => React.ReactNode;
  children?: React.ReactNode;
  label?: string;
}

const ProgressCircle = React.forwardRef<HTMLDivElement, ProgressCircleProps>(
  (
    {
      className,
      value,
      max = 100,
      size = 64,
      strokeWidth = 6,
      intent = "default",
      indeterminate = false,
      showValue = false,
      valueFormat,
      children,
      label = "Progress",
      style,
      ...props
    },
    ref,
  ) => {
    const percent = toPercent(value, max);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = indeterminate
      ? circumference * 0.75
      : circumference * (1 - percent / 100);
    const formatted =
      valueFormat?.(value ?? 0, percent) ?? `${Math.round(percent)}%`;

    return (
      <div
        ref={ref}
        data-slot="progress-circle"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : (value ?? 0)}
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: size, height: size, ...style }}
        {...props}
      >
        <ProgressStyles />
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className={cn(
            "-rotate-90",
            indeterminate && "ui-progress-anim",
          )}
          style={
            indeterminate
              ? { animation: "ui-progress-spin 1s linear infinite" }
              : undefined
          }
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className={circleTrackColor[intent]}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(
              circleColor[intent],
              "transition-[stroke-dashoffset] duration-300 ease-out motion-reduce:transition-none",
            )}
          />
        </svg>
        {(children || (showValue && !indeterminate)) && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium tabular-nums">
            {children ?? formatted}
          </span>
        )}
      </div>
    );
  },
);
ProgressCircle.displayName = "ProgressCircle";

interface ProgressStepsProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  steps: number;
  current: number;
  intent?: ProgressIntent;
  size?: ProgressSize;
  gap?: number;
  label?: string;
}

const ProgressSteps = React.forwardRef<HTMLDivElement, ProgressStepsProps>(
  (
    {
      className,
      steps,
      current,
      intent = "default",
      size = "md",
      gap = 4,
      label = "Progress",
      ...props
    },
    ref,
  ) => {
    const safeSteps = Math.max(1, Math.floor(steps));
    const safeCurrent = clamp(current, 0, safeSteps);

    return (
      <div
        ref={ref}
        data-slot="progress-steps"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeSteps}
        aria-valuenow={safeCurrent}
        aria-valuetext={`Step ${safeCurrent} of ${safeSteps}`}
        className={cn("flex w-full items-center", className)}
        style={{ gap }}
        {...props}
      >
        {Array.from({ length: safeSteps }, (_, index) => {
          const fill = clamp(safeCurrent - index, 0, 1);
          return (
            <div
              key={index}
              data-state={fill >= 1 ? "complete" : fill > 0 ? "active" : "pending"}
              className={cn(trackVariants({ intent, size }), "flex-1")}
            >
              <div
                className={cn(
                  indicatorVariants({ intent }),
                  "origin-left",
                )}
                style={{ transform: `scaleX(${fill})` }}
              />
            </div>
          );
        })}
      </div>
    );
  },
);
ProgressSteps.displayName = "ProgressSteps";

export {
  Progress,
  ProgressCircle,
  ProgressSteps,
  trackVariants as progressTrackVariants,
  indicatorVariants as progressIndicatorVariants,
};
export type {
  ProgressProps,
  ProgressCircleProps,
  ProgressStepsProps,
  ProgressIntent,
  ProgressSize,
};
