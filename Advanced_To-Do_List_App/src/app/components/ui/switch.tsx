"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "./utils";

const switchVariants = cva(
  [
    "peer inline-flex shrink-0 items-center rounded-full border border-transparent outline-none",
    "transition-[background-color,box-shadow] duration-200 motion-reduce:transition-none",
    "data-[state=checked]:bg-primary data-[state=unchecked]:bg-switch-background dark:data-[state=unchecked]:bg-input/80",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-4 w-7",
        default: "h-[1.15rem] w-8",
        lg: "h-6 w-11",
      },
    },
    defaultVariants: { size: "default" },
  },
);

// Thumb size and travel distance (track inner width minus thumb width).
const thumbVariants = cva(
  [
    "bg-card dark:data-[state=unchecked]:bg-card-foreground dark:data-[state=checked]:bg-primary-foreground",
    "pointer-events-none flex items-center justify-center rounded-full ring-0 shadow-sm",
    "transition-transform duration-200 motion-reduce:transition-none",
    "data-[state=unchecked]:translate-x-0",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "size-3 data-[state=checked]:translate-x-3",
        default: "size-4 data-[state=checked]:translate-x-[14px]",
        lg: "size-5 data-[state=checked]:translate-x-5",
      },
    },
    defaultVariants: { size: "default" },
  },
);

interface SwitchProps
  extends React.ComponentProps<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {
  /**
   * Show a spinner inside the thumb and block changes while an async update
   * is in flight (e.g. saving a setting to a server).
   */
  loading?: boolean;
}

function Switch({
  className,
  size,
  loading = false,
  disabled,
  ...props
}: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size ?? "default"}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(switchVariants({ size }), loading && "cursor-progress", className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={thumbVariants({ size })}
      >
        {loading && (
          <Loader2
            aria-hidden
            className="text-muted-foreground size-[70%] animate-spin"
          />
        )}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}

export { Switch, switchVariants };
export type { SwitchProps };
