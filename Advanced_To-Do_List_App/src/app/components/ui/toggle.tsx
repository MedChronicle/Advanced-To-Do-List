"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "./utils";

const toggleVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap select-none",
    "transition-[color,background-color,box-shadow,transform] duration-150 outline-none",
    "hover:bg-muted hover:text-muted-foreground",
    "active:scale-[0.97] motion-reduce:active:scale-100 motion-reduce:transition-none",
    "disabled:pointer-events-none disabled:opacity-50",
    "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        /** Solid fill when pressed: good for filters and toolbar buttons. */
        solid:
          "bg-muted/60 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-muted",
      },
      size: {
        xs: "h-7 px-1.5 min-w-7 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 px-1.5 min-w-8",
        default: "h-9 px-2 min-w-9",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ToggleProps
  extends React.ComponentProps<typeof TogglePrimitive.Root>,
    VariantProps<typeof toggleVariants> {
  /** Show a spinner and disable interaction while an async change is pending. */
  loading?: boolean;
}

function Toggle({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  ...props
}: ToggleProps) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    >
      {loading && <Loader2 aria-hidden className="animate-spin" />}
      {children}
    </TogglePrimitive.Root>
  );
}

export { Toggle, toggleVariants };
export type { ToggleProps };
