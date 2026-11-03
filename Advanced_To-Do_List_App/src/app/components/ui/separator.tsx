"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const separatorVariants = cva("shrink-0", {
  variants: {
    orientation: {
      horizontal: "h-px w-full",
      vertical: "h-full w-px",
    },
    variant: {
      solid: "bg-border",
      dashed: "bg-transparent border-border border-dashed",
      dotted: "bg-transparent border-border border-dotted",
      gradient: "",
      fade: "",
    },
    thickness: {
      thin: "",
      medium: "",
      thick: "",
    },
    tone: {
      default: "",
      muted: "opacity-60",
      strong: "opacity-100 brightness-90",
      primary: "",
    },
  },
  compoundVariants: [
    { orientation: "horizontal", thickness: "medium", class: "h-0.5" },
    { orientation: "horizontal", thickness: "thick", class: "h-1" },
    { orientation: "vertical", thickness: "medium", class: "w-0.5" },
    { orientation: "vertical", thickness: "thick", class: "w-1" },
    {
      orientation: "horizontal",
      variant: ["dashed", "dotted"],
      class: "h-0 border-t",
    },
    {
      orientation: "vertical",
      variant: ["dashed", "dotted"],
      class: "w-0 border-l",
    },
    {
      orientation: "horizontal",
      variant: "gradient",
      class: "bg-gradient-to-r from-transparent via-border to-transparent",
    },
    {
      orientation: "vertical",
      variant: "gradient",
      class: "bg-gradient-to-b from-transparent via-border to-transparent",
    },
    {
      orientation: "horizontal",
      variant: "fade",
      class: "bg-gradient-to-r from-border to-transparent",
    },
    {
      orientation: "vertical",
      variant: "fade",
      class: "bg-gradient-to-b from-border to-transparent",
    },
    { variant: "solid", tone: "primary", class: "bg-primary" },
    { variant: ["dashed", "dotted"], tone: "primary", class: "border-primary" },
  ],
  defaultVariants: {
    orientation: "horizontal",
    variant: "solid",
    thickness: "thin",
    tone: "default",
  },
});

const spacingVariants = cva("", {
  variants: {
    spacing: {
      none: "",
      sm: "",
      md: "",
      lg: "",
    },
    orientation: {
      horizontal: "",
      vertical: "",
    },
  },
  compoundVariants: [
    { orientation: "horizontal", spacing: "sm", class: "my-2" },
    { orientation: "horizontal", spacing: "md", class: "my-4" },
    { orientation: "horizontal", spacing: "lg", class: "my-8" },
    { orientation: "vertical", spacing: "sm", class: "mx-2" },
    { orientation: "vertical", spacing: "md", class: "mx-4" },
    { orientation: "vertical", spacing: "lg", class: "mx-8" },
  ],
  defaultVariants: { spacing: "none", orientation: "horizontal" },
});

type LabelAlign = "start" | "center" | "end";

interface SeparatorProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>,
      "orientation"
    >,
    Omit<VariantProps<typeof separatorVariants>, "orientation">,
    Omit<VariantProps<typeof spacingVariants>, "orientation"> {
  orientation?: "horizontal" | "vertical";
  label?: React.ReactNode;
  labelAlign?: LabelAlign;
  labelClassName?: string;
  lineClassName?: string;
  inset?: boolean;
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    {
      className,
      orientation = "horizontal",
      decorative = true,
      variant,
      thickness,
      tone,
      spacing,
      label,
      labelAlign = "center",
      labelClassName,
      lineClassName,
      inset = false,
      ...props
    },
    ref,
  ) => {
    const isHorizontal = orientation === "horizontal";

    const line = (extra?: string) => (
      <SeparatorPrimitive.Root
        decorative
        orientation={orientation}
        data-slot="separator-line"
        className={cn(
          separatorVariants({ orientation, variant, thickness, tone }),
          extra,
          lineClassName,
        )}
      />
    );

    if (label !== undefined && label !== null && label !== false) {
      const showStart = labelAlign !== "start";
      const showEnd = labelAlign !== "end";

      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          role={decorative ? "presentation" : "separator"}
          aria-orientation={decorative ? undefined : orientation}
          data-slot="separator-root"
          data-orientation={orientation}
          data-variant={variant ?? "solid"}
          className={cn(
            "flex items-center gap-3",
            isHorizontal ? "w-full flex-row" : "h-full flex-col",
            spacingVariants({ spacing, orientation }),
            inset && (isHorizontal ? "mx-4 w-auto" : "my-4 h-auto"),
            className,
          )}
          {...(props as React.HTMLAttributes<HTMLDivElement>)}
        >
          {showStart && line("flex-1")}
          <span
            data-slot="separator-label"
            className={cn(
              "text-muted-foreground text-xs font-medium tracking-wide whitespace-nowrap uppercase select-none",
              !isHorizontal && "[writing-mode:vertical-rl]",
              labelClassName,
            )}
          >
            {label}
          </span>
          {showEnd && line("flex-1")}
        </div>
      );
    }

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        data-slot="separator-root"
        data-variant={variant ?? "solid"}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          separatorVariants({ orientation, variant, thickness, tone }),
          spacingVariants({ spacing, orientation }),
          inset && (isHorizontal ? "mx-4 w-auto" : "my-4 h-auto"),
          className,
        )}
        {...props}
      />
    );
  },
);
Separator.displayName = "Separator";

export { Separator, separatorVariants };
export type { SeparatorProps };
