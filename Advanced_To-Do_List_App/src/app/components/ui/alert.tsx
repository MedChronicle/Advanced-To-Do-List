"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";
import {
  CircleCheckIcon,
  InfoIcon,
  OctagonAlertIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react@0.487.0";

import { cn } from "./utils";

type AlertIntent = "default" | "destructive" | "warning" | "success" | "info";

const alertVariants = cva(
  "relative w-full rounded-lg border grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current transition-opacity",
  {
    variants: {
      variant: {
        default: "[--alert:var(--foreground)]",
        destructive:
          "[--alert:var(--destructive)] *:data-[slot=alert-description]:text-[color-mix(in_oklab,var(--alert)_90%,transparent)]",
        warning:
          "[--alert:oklch(0.72_0.17_70)] *:data-[slot=alert-description]:text-[color-mix(in_oklab,var(--alert)_90%,transparent)]",
        success:
          "[--alert:oklch(0.65_0.17_155)] *:data-[slot=alert-description]:text-[color-mix(in_oklab,var(--alert)_90%,transparent)]",
        info: "[--alert:oklch(0.64_0.16_240)] *:data-[slot=alert-description]:text-[color-mix(in_oklab,var(--alert)_90%,transparent)]",
      },
      appearance: {
        card: "bg-card text-[var(--alert)]",
        soft: "border-[color-mix(in_oklab,var(--alert)_30%,transparent)] bg-[color-mix(in_oklab,var(--alert)_10%,transparent)] text-[var(--alert)]",
        outline: "border-[var(--alert)] bg-transparent text-[var(--alert)]",
        solid:
          "border-transparent bg-[var(--alert)] text-white *:data-[slot=alert-description]:text-white/90",
        accent:
          "border-l-4 border-l-[var(--alert)] bg-card text-card-foreground [&>svg]:text-[var(--alert)]",
      },
      size: {
        sm: "px-3 py-2 text-xs",
        md: "px-4 py-3 text-sm",
        lg: "px-5 py-4 text-base",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        appearance: "card",
        class:
          "text-card-foreground *:data-[slot=alert-description]:text-muted-foreground",
      },
      {
        variant: "default",
        appearance: ["soft", "outline", "accent"],
        class: "*:data-[slot=alert-description]:text-muted-foreground",
      },
      {
        variant: "default",
        appearance: "solid",
        class:
          "text-background *:data-[slot=alert-description]:text-background/80",
      },
      {
        variant: "warning",
        appearance: "solid",
        class: "text-black *:data-[slot=alert-description]:text-black/80",
      },
      {
        variant: ["destructive", "warning", "success", "info"],
        appearance: "accent",
        class: "*:data-[slot=alert-description]:text-muted-foreground",
      },
    ],
    defaultVariants: {
      variant: "default",
      appearance: "card",
      size: "md",
    },
  },
);

const intentIcons: Record<
  AlertIntent,
  React.ComponentType<{ className?: string }>
> = {
  default: InfoIcon,
  destructive: OctagonAlertIcon,
  warning: TriangleAlertIcon,
  success: CircleCheckIcon,
  info: InfoIcon,
};

interface AlertProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "title">,
    VariantProps<typeof alertVariants> {
  icon?: boolean | React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  dismissLabel?: string;
  open?: boolean;
  defaultOpen?: boolean;
  autoDismiss?: number;
  pauseOnHover?: boolean;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = "default",
      appearance,
      size,
      icon,
      dismissible = false,
      onDismiss,
      dismissLabel = "Dismiss",
      open,
      defaultOpen = true,
      autoDismiss,
      pauseOnHover = true,
      role,
      children,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const [hovered, setHovered] = React.useState(false);
    const isControlled = open !== undefined;
    const visible = isControlled ? open : internalOpen;
    const resolvedVariant: AlertIntent = variant ?? "default";

    const dismiss = React.useCallback(() => {
      if (!isControlled) setInternalOpen(false);
      onDismiss?.();
    }, [isControlled, onDismiss]);

    React.useEffect(() => {
      if (!autoDismiss || !visible || (pauseOnHover && hovered)) return;
      const timer = window.setTimeout(dismiss, autoDismiss);
      return () => window.clearTimeout(timer);
    }, [autoDismiss, visible, hovered, pauseOnHover, dismiss]);

    if (!visible) return null;

    const showIcon =
      icon === undefined
        ? resolvedVariant === "warning" ||
          resolvedVariant === "success" ||
          resolvedVariant === "info"
        : icon !== false;

    const Icon = intentIcons[resolvedVariant];
    const iconNode =
      showIcon && (icon === true || icon === undefined) ? (
        <Icon aria-hidden />
      ) : showIcon ? (
        icon
      ) : null;

    const resolvedRole =
      role ??
      (resolvedVariant === "destructive" || resolvedVariant === "warning"
        ? "alert"
        : "status");

    return (
      <div
        ref={ref}
        data-slot="alert"
        data-variant={resolvedVariant}
        role={resolvedRole}
        className={cn(
          alertVariants({ variant, appearance, size }),
          dismissible && "pr-10",
          className,
        )}
        onMouseEnter={(event) => {
          setHovered(true);
          onMouseEnter?.(event);
        }}
        onMouseLeave={(event) => {
          setHovered(false);
          onMouseLeave?.(event);
        }}
        {...props}
      >
        {iconNode}
        {children}
        {dismissible && (
          <button
            type="button"
            data-slot="alert-dismiss"
            aria-label={dismissLabel}
            onClick={dismiss}
            className="focus-visible:ring-ring/50 absolute top-2.5 right-2.5 inline-flex size-6 items-center justify-center rounded-md opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:ring-[3px]"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>
    );
  },
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="alert-title"
    className={cn(
      "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
      className,
    )}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="alert-description"
    className={cn(
      "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
      className,
    )}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

const AlertActions = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="alert-actions"
    className={cn("col-start-2 mt-2 flex flex-wrap items-center gap-2", className)}
    {...props}
  />
));
AlertActions.displayName = "AlertActions";

export {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertActions,
  alertVariants,
};
export type { AlertProps, AlertIntent };
