import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";
import { Loader2Icon, XIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center border font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none gap-1 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow,background-color] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        success:
          "border-transparent bg-emerald-600 text-white [a&]:hover:bg-emerald-600/90 focus-visible:ring-emerald-500/30 dark:bg-emerald-600/70",
        warning:
          "border-transparent bg-amber-500 text-black [a&]:hover:bg-amber-500/90 focus-visible:ring-amber-500/30",
        info: "border-transparent bg-sky-600 text-white [a&]:hover:bg-sky-600/90 focus-visible:ring-sky-500/30 dark:bg-sky-600/70",
        muted:
          "border-transparent bg-muted text-muted-foreground [a&]:hover:bg-muted/70",
        "soft-destructive":
          "border-destructive/20 bg-destructive/10 text-destructive [a&]:hover:bg-destructive/15",
        "soft-success":
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 [a&]:hover:bg-emerald-500/15",
        "soft-warning":
          "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300 [a&]:hover:bg-amber-500/15",
        "soft-info":
          "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300 [a&]:hover:bg-sky-500/15",
      },
      size: {
        sm: "px-1.5 py-0 text-[10px] [&>svg]:size-2.5",
        md: "px-2 py-0.5 text-xs [&>svg]:size-3",
        lg: "px-2.5 py-1 text-sm [&>svg]:size-3.5",
      },
      shape: {
        rounded: "rounded-md",
        pill: "rounded-full",
        square: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      shape: "rounded",
    },
  },
);

interface BadgeProps
  extends React.ComponentPropsWithoutRef<"span">,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
  dot?: boolean;
  dotClassName?: string;
  pulse?: boolean;
  loading?: boolean;
  removable?: boolean;
  onRemove?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  removeLabel?: string;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      shape,
      asChild = false,
      icon,
      dot = false,
      dotClassName,
      pulse = false,
      loading = false,
      removable = false,
      onRemove,
      removeLabel = "Remove",
      children,
      ...props
    },
    ref,
  ) => {
    const classes = cn(badgeVariants({ variant, size, shape }), className);

    if (asChild) {
      return (
        <Slot ref={ref} data-slot="badge" className={classes} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <span
        ref={ref}
        data-slot="badge"
        data-variant={variant ?? "default"}
        aria-busy={loading || undefined}
        className={classes}
        {...props}
      >
        {dot && (
          <span
            aria-hidden
            data-slot="badge-dot"
            className={cn("relative flex size-1.5 shrink-0", dotClassName)}
          >
            {pulse && (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60 motion-reduce:animate-none" />
            )}
            <span className="relative inline-flex size-1.5 rounded-full bg-current" />
          </span>
        )}
        {loading ? <Loader2Icon className="animate-spin" /> : icon}
        {children}
        {removable && (
          <button
            type="button"
            data-slot="badge-remove"
            aria-label={removeLabel}
            onClick={(event) => {
              event.stopPropagation();
              onRemove?.(event);
            }}
            className="-mr-0.5 inline-flex shrink-0 items-center justify-center rounded-full opacity-70 transition-opacity outline-none hover:bg-black/10 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-current dark:hover:bg-white/15"
          >
            <XIcon aria-hidden />
          </button>
        )}
      </span>
    );
  },
);
Badge.displayName = "Badge";

interface BadgeCountProps extends Omit<BadgeProps, "children" | "asChild"> {
  count: number;
  max?: number;
  showZero?: boolean;
}

const BadgeCount = React.forwardRef<HTMLSpanElement, BadgeCountProps>(
  (
    {
      count,
      max = 99,
      showZero = false,
      variant = "destructive",
      size = "sm",
      shape = "pill",
      className,
      ...props
    },
    ref,
  ) => {
    if (count <= 0 && !showZero) return null;
    const label = count > max ? `${max}+` : String(count);

    return (
      <Badge
        ref={ref}
        variant={variant}
        size={size}
        shape={shape}
        aria-label={`${count}`}
        className={cn("min-w-5 px-1 tabular-nums", className)}
        {...props}
      >
        {label}
      </Badge>
    );
  },
);
BadgeCount.displayName = "BadgeCount";

interface BadgeGroupProps extends React.ComponentPropsWithoutRef<"div"> {
  max?: number;
  overflowVariant?: BadgeProps["variant"];
  overflowSize?: BadgeProps["size"];
  overflowShape?: BadgeProps["shape"];
}

const BadgeGroup = React.forwardRef<HTMLDivElement, BadgeGroupProps>(
  (
    {
      className,
      children,
      max,
      overflowVariant = "muted",
      overflowSize,
      overflowShape,
      ...props
    },
    ref,
  ) => {
    const items = React.Children.toArray(children);
    const limit = max !== undefined && max > 0 ? max : items.length;
    const visible = items.slice(0, limit);
    const hidden = items.length - visible.length;

    return (
      <div
        ref={ref}
        data-slot="badge-group"
        className={cn("flex flex-wrap items-center gap-1.5", className)}
        {...props}
      >
        {visible}
        {hidden > 0 && (
          <Badge
            variant={overflowVariant}
            size={overflowSize}
            shape={overflowShape}
            aria-label={`${hidden} more`}
          >
            +{hidden}
          </Badge>
        )}
      </div>
    );
  },
);
BadgeGroup.displayName = "BadgeGroup";

export { Badge, BadgeCount, BadgeGroup, badgeVariants };
export type { BadgeProps, BadgeCountProps, BadgeGroupProps };
