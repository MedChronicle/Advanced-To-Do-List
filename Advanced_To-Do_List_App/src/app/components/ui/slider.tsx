"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "./utils";

interface SliderMark {
  value: number;
  label?: React.ReactNode;
}

interface SliderProps
  extends React.ComponentProps<typeof SliderPrimitive.Root> {
  /** Track thickness. "default" keeps the original chunky look. */
  size?: "sm" | "default";
  /** Show the current value in a small bubble above the thumb on hover/drag/focus. */
  showValue?: boolean;
  /** Format the bubble text (e.g. v => `${v}%`). */
  formatValue?: (value: number) => React.ReactNode;
  /** Tick marks with optional labels under a horizontal slider. */
  marks?: SliderMark[];
  /**
   * Accessible names for each thumb. Defaults to "Minimum"/"Maximum" for a
   * two-thumb range, and to the slider's own aria-label for a single thumb.
   */
  thumbLabels?: string[];
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  size = "default",
  showValue = false,
  formatValue,
  marks,
  thumbLabels,
  onValueChange,
  orientation = "horizontal",
  ...props
}: SliderProps) {
  // Mirror the value locally so the bubble works for uncontrolled sliders too.
  const [internal, setInternal] = React.useState<number[]>(() =>
    Array.isArray(value)
      ? value
      : Array.isArray(defaultValue)
        ? defaultValue
        : [min],
  );
  const values = Array.isArray(value) ? value : internal;

  const handleValueChange = (next: number[]) => {
    setInternal(next);
    onValueChange?.(next);
  };

  const pct = (v: number) => ((v - min) / (max - min || 1)) * 100;
  const horizontal = orientation === "horizontal";
  const ariaLabel = (props as { "aria-label"?: string })["aria-label"];

  const labelFor = (index: number) => {
    if (thumbLabels?.[index]) return thumbLabels[index];
    if (values.length === 2) return index === 0 ? "Minimum" : "Maximum";
    return ariaLabel;
  };

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      orientation={orientation}
      onValueChange={handleValueChange}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        marks?.length && horizontal && "mb-6",
        showValue && horizontal && "mt-6",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full",
          size === "sm"
            ? "data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:w-1.5"
            : "data-[orientation=horizontal]:h-4 data-[orientation=vertical]:w-1.5",
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
        />
      </SliderPrimitive.Track>

      {values.map((v, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          aria-label={labelFor(index)}
          className="group border-primary bg-background ring-ring/50 relative block size-4 shrink-0 cursor-grab rounded-full border shadow-sm transition-[color,box-shadow] outline-hidden hover:ring-4 focus-visible:ring-4 active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
        >
          {showValue && horizontal && (
            <span
              aria-hidden
              className="bg-primary text-primary-foreground pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded px-1.5 py-0.5 text-[10px] font-medium tabular-nums opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100 motion-reduce:transition-none"
            >
              {formatValue ? formatValue(v) : v}
            </span>
          )}
        </SliderPrimitive.Thumb>
      ))}

      {horizontal &&
        marks?.map((m) => (
          <span
            key={m.value}
            aria-hidden
            style={{ left: `${pct(m.value)}%` }}
            className="text-muted-foreground pointer-events-none absolute top-full mt-1.5 -translate-x-1/2 text-xs tabular-nums"
          >
            {m.label ?? m.value}
          </span>
        ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
export type { SliderProps, SliderMark };
