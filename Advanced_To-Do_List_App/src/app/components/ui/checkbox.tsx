"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox@1.1.4";
import { CheckIcon, MinusIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

/* -------------------------------------------------------------------------- */
/*  Checkbox primitive                                                        */
/* -------------------------------------------------------------------------- */

type CheckboxSize = "sm" | "md" | "lg";

const boxSizes: Record<CheckboxSize, string> = {
  sm: "size-3.5 rounded-[3px]",
  md: "size-4 rounded-[4px]",
  lg: "size-5 rounded-[5px]",
};

const iconSizes: Record<CheckboxSize, string> = {
  sm: "size-3",
  md: "size-3.5",
  lg: "size-4",
};

type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  size?: CheckboxSize;
  /** Marks the checkbox invalid (red border + aria-invalid). */
  invalid?: boolean;
};

function Checkbox({
  className,
  size = "md",
  invalid,
  ...props
}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      aria-invalid={invalid || props["aria-invalid"] || undefined}
      className={cn(
        "peer border bg-input-background dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground data-[state=indeterminate]:border-primary dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shrink-0 border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        boxSizes[size],
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        {props.checked === "indeterminate" ? (
          <MinusIcon className={iconSizes[size]} />
        ) : (
          <CheckIcon className={iconSizes[size]} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

/* -------------------------------------------------------------------------- */
/*  CheckboxField – checkbox + label + description + error                    */
/* -------------------------------------------------------------------------- */

type CheckboxFieldProps = Omit<CheckboxProps, "children"> & {
  label: React.ReactNode;
  description?: React.ReactNode;
  /** Error message – also puts the checkbox in the invalid state. */
  error?: React.ReactNode;
  /** Show a "required" asterisk next to the label. */
  showRequired?: boolean;
  /** Extra classes for the outer wrapper. */
  wrapperClassName?: string;
};

function CheckboxField({
  id,
  label,
  description,
  error,
  showRequired,
  wrapperClassName,
  disabled,
  size = "md",
  ...props
}: CheckboxFieldProps) {
  const autoId = React.useId();
  const fieldId = id ?? autoId;
  const descId = description ? `${fieldId}-desc` : undefined;
  const errId = error ? `${fieldId}-err` : undefined;
  const describedBy = [descId, errId].filter(Boolean).join(" ") || undefined;

  return (
    <div
      data-slot="checkbox-field"
      className={cn("flex items-start gap-3", wrapperClassName)}
    >
      <Checkbox
        id={fieldId}
        size={size}
        disabled={disabled}
        invalid={!!error}
        aria-describedby={describedBy}
        required={showRequired || props.required}
        className={cn("mt-0.5", props.className)}
        {...props}
      />
      <div className="grid gap-1">
        <label
          htmlFor={fieldId}
          className={cn(
            "text-sm leading-none font-medium select-none",
            disabled && "cursor-not-allowed opacity-50",
            !disabled && "cursor-pointer",
          )}
        >
          {label}
          {showRequired && (
            <span aria-hidden className="text-destructive ml-0.5">
              *
            </span>
          )}
        </label>
        {description && (
          <p id={descId} className="text-muted-foreground text-sm">
            {description}
          </p>
        )}
        {error && (
          <p id={errId} role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  CheckboxGroup – multi-select with optional "select all"                   */
/* -------------------------------------------------------------------------- */

interface CheckboxGroupItem {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

interface CheckboxGroupProps {
  items: CheckboxGroupItem[];
  /** Controlled selection. */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Group heading. */
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  /** Adds a parent checkbox that toggles everything (with indeterminate state). */
  selectAll?: boolean | string;
  /** Minimum / maximum number of selections allowed. */
  min?: number;
  max?: number;
  orientation?: "vertical" | "horizontal";
  size?: CheckboxSize;
  disabled?: boolean;
  className?: string;
}

function CheckboxGroup({
  items,
  value: controlled,
  defaultValue = [],
  onValueChange,
  label,
  description,
  error,
  selectAll,
  min,
  max,
  orientation = "vertical",
  size = "md",
  disabled,
  className,
}: CheckboxGroupProps) {
  const groupId = React.useId();
  const [internal, setInternal] = React.useState<string[]>(defaultValue);
  const value = controlled ?? internal;

  const update = React.useCallback(
    (next: string[]) => {
      setInternal(next);
      onValueChange?.(next);
    },
    [onValueChange],
  );

  const enabledItems = items.filter((i) => !i.disabled);
  const enabledValues = enabledItems.map((i) => i.value);
  const selectedEnabled = enabledValues.filter((v) => value.includes(v));

  const allState: boolean | "indeterminate" =
    selectedEnabled.length === 0
      ? false
      : selectedEnabled.length === enabledValues.length
        ? true
        : "indeterminate";

  const toggleItem = (itemValue: string, checked: boolean) => {
    if (checked) {
      if (max !== undefined && value.length >= max) return;
      update([...value, itemValue]);
    } else {
      if (min !== undefined && value.length <= min) return;
      update(value.filter((v) => v !== itemValue));
    }
  };

  const toggleAll = (checked: boolean) => {
    // Keep selections from disabled items untouched.
    const locked = value.filter((v) => !enabledValues.includes(v));
    const next = checked ? [...locked, ...enabledValues] : locked;
    update(max !== undefined ? next.slice(0, max) : next);
  };

  const errId = error ? `${groupId}-err` : undefined;
  const descId = description ? `${groupId}-desc` : undefined;

  return (
    <div
      data-slot="checkbox-group"
      role="group"
      aria-labelledby={label ? `${groupId}-label` : undefined}
      aria-describedby={[descId, errId].filter(Boolean).join(" ") || undefined}
      className={cn("grid gap-3", className)}
    >
      {label && (
        <div className="grid gap-1">
          <span id={`${groupId}-label`} className="text-sm leading-none font-medium">
            {label}
          </span>
          {description && (
            <p id={descId} className="text-muted-foreground text-sm">
              {description}
            </p>
          )}
        </div>
      )}

      {selectAll && (
        <CheckboxField
          size={size}
          disabled={disabled || enabledItems.length === 0}
          checked={allState}
          onCheckedChange={(c) => toggleAll(c === true)}
          label={typeof selectAll === "string" ? selectAll : "Select all"}
          wrapperClassName="border-b pb-3"
        />
      )}

      <div
        className={cn(
          "flex gap-3",
          orientation === "vertical" ? "flex-col" : "flex-row flex-wrap gap-x-6",
        )}
      >
        {items.map((item) => {
          const checked = value.includes(item.value);
          const atMax = max !== undefined && value.length >= max && !checked;
          const atMin = min !== undefined && value.length <= min && checked;
          return (
            <CheckboxField
              key={item.value}
              size={size}
              checked={checked}
              disabled={disabled || item.disabled || atMax || atMin}
              onCheckedChange={(c) => toggleItem(item.value, c === true)}
              label={item.label}
              description={item.description}
            />
          );
        })}
      </div>

      {error && (
        <p id={errId} role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}

export { Checkbox, CheckboxField, CheckboxGroup };
export type {
  CheckboxProps,
  CheckboxFieldProps,
  CheckboxGroupProps,
  CheckboxGroupItem,
  CheckboxSize,
};
