"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";

import { cn } from "./utils";
import { toggleVariants } from "./toggle";

interface ToggleGroupContextValue extends VariantProps<typeof toggleVariants> {
  /** Items are joined into one segmented control (true) or spaced apart (false). */
  attached: boolean;
  orientation: "horizontal" | "vertical";
  fullWidth: boolean;
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  size: "default",
  variant: "default",
  attached: true,
  orientation: "horizontal",
  fullWidth: false,
});

type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    /**
     * true  (default): buttons are joined into a single segmented control.
     * false: buttons are separate with a small gap and keep their own corners.
     */
    attached?: boolean;
    /** Stretch the group to its container and share the width equally. */
    fullWidth?: boolean;
  };

function ToggleGroup({
  className,
  variant,
  size,
  attached = true,
  fullWidth = false,
  orientation = "horizontal",
  children,
  ...props
}: ToggleGroupProps) {
  const value = React.useMemo<ToggleGroupContextValue>(
    () => ({ variant, size, attached, orientation, fullWidth }),
    [variant, size, attached, orientation, fullWidth],
  );

  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-attached={attached}
      orientation={orientation}
      className={cn(
        "group/toggle-group flex items-center rounded-md",
        orientation === "vertical" ? "flex-col items-stretch" : "flex-row",
        fullWidth ? "w-full" : "w-fit",
        !attached && "gap-1",
        attached && "data-[variant=outline]:shadow-xs",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={value}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const ctx = React.useContext(ToggleGroupContext);

  // An explicit prop on the item wins; otherwise inherit from the group.
  // (The previous `context || prop` order made item-level overrides impossible.)
  const resolvedVariant = variant ?? ctx.variant;
  const resolvedSize = size ?? ctx.size;
  const vertical = ctx.orientation === "vertical";

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      className={cn(
        toggleVariants({ variant: resolvedVariant, size: resolvedSize }),
        "min-w-0 shrink-0 focus:z-10 focus-visible:z-10",
        ctx.fullWidth && "flex-1",
        ctx.attached &&
          cn(
            "rounded-none shadow-none",
            vertical
              ? "first:rounded-t-md last:rounded-b-md data-[variant=outline]:border-t-0 data-[variant=outline]:first:border-t"
              : "first:rounded-l-md last:rounded-r-md data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l",
          ),
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };
export type { ToggleGroupProps };
