"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group@1.2.3";
import { CircleIcon } from "lucide-react@0.487.0";
import { cva } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

type RadioSize = "sm" | "md" | "lg";
type RadioVariant = "default" | "card" | "segmented";
type RadioOrientation = "vertical" | "horizontal";

interface RadioGroupContextValue {
  size: RadioSize;
  variant: RadioVariant;
  orientation: RadioOrientation;
  invalid: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({
  size: "md",
  variant: "default",
  orientation: "vertical",
  invalid: false,
});

const useRadioGroupContext = () => React.useContext(RadioGroupContext);

const groupVariants = cva("", {
  variants: {
    variant: {
      default: "",
      card: "",
      segmented:
        "bg-muted inline-flex w-fit items-center gap-1 rounded-lg p-1",
    },
    orientation: {
      vertical: "grid gap-3",
      horizontal: "flex flex-wrap gap-x-6 gap-y-3",
    },
  },
  compoundVariants: [
    { variant: "segmented", orientation: "vertical", class: "flex flex-col gap-1" },
    { variant: "segmented", orientation: "horizontal", class: "flex-row flex-nowrap gap-1" },
    { variant: "card", orientation: "horizontal", class: "grid grid-flow-col auto-cols-fr gap-3" },
  ],
  defaultVariants: { variant: "default", orientation: "vertical" },
});

const itemVariants = cva(
  "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 data-[state=checked]:border-primary aspect-square shrink-0 rounded-full border shadow-xs transition-[color,box-shadow,border-color] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "size-3.5",
        md: "size-4",
        lg: "size-5",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const dotVariants = cva(
  "fill-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  {
    variants: {
      size: {
        sm: "size-1.5",
        md: "size-2",
        lg: "size-2.5",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const optionVariants = cva("group/option relative flex transition-all", {
  variants: {
    variant: {
      default: "items-start gap-3",
      card: "border-input hover:bg-accent/40 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 has-[:focus-visible]:ring-ring/50 cursor-pointer items-start gap-3 rounded-lg border p-4 has-[:focus-visible]:ring-[3px] has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-50",
      segmented:
        "text-muted-foreground has-[[data-state=checked]]:bg-background has-[[data-state=checked]]:text-foreground has-[:focus-visible]:ring-ring/50 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap has-[[data-state=checked]]:shadow-sm has-[:focus-visible]:ring-[3px] has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-50",
    },
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    },
  },
  compoundVariants: [
    { variant: "segmented", size: "sm", class: "px-2.5 py-1" },
    { variant: "segmented", size: "md", class: "px-3 py-1.5" },
    { variant: "segmented", size: "lg", class: "px-4 py-2" },
    { variant: "card", size: "sm", class: "p-3" },
    { variant: "card", size: "lg", class: "p-5" },
  ],
  defaultVariants: { variant: "default", size: "md" },
});

interface RadioGroupProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
    "orientation"
  > {
  size?: RadioSize;
  variant?: RadioVariant;
  orientation?: RadioOrientation;
  invalid?: boolean;
}

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(
  (
    {
      className,
      size = "md",
      variant = "default",
      orientation = "vertical",
      invalid = false,
      ...props
    },
    ref,
  ) => {
    const value = React.useMemo(
      () => ({ size, variant, orientation, invalid }),
      [size, variant, orientation, invalid],
    );
    return (
      <RadioGroupContext.Provider value={value}>
        <RadioGroupPrimitive.Root
          ref={ref}
          data-slot="radio-group"
          data-variant={variant}
          aria-invalid={invalid || undefined}
          orientation={orientation}
          className={cn(groupVariants({ variant, orientation }), className)}
          {...props}
        />
      </RadioGroupContext.Provider>
    );
  },
);
RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  size?: RadioSize;
  invalid?: boolean;
  bare?: boolean;
}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, size, invalid, bare = false, ...props }, ref) => {
  const ctx = useRadioGroupContext();
  const resolvedSize = size ?? ctx.size;
  const isInvalid = invalid ?? ctx.invalid;

  if (bare) {
    return (
      <RadioGroupPrimitive.Item
        ref={ref}
        data-slot="radio-group-item"
        aria-invalid={isInvalid || undefined}
        className={cn(
          "absolute inset-0 z-10 cursor-pointer rounded-[inherit] opacity-0 outline-none disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      />
    );
  }

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      data-slot="radio-group-item"
      aria-invalid={isInvalid || undefined}
      className={cn(itemVariants({ size: resolvedSize }), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className={dotVariants({ size: resolvedSize })} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

interface RadioGroupOptionProps
  extends Omit<RadioGroupItemProps, "children" | "bare"> {
  label: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  optionClassName?: string;
}

const RadioGroupOption = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupOptionProps
>(
  (
    {
      label,
      description,
      icon,
      badge,
      optionClassName,
      id,
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    const { variant, size } = useRadioGroupContext();
    const generatedId = React.useId();
    const itemId = id ?? generatedId;
    const descId = `${itemId}-description`;

    const text = (
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center gap-2 leading-none font-medium">
          {icon && (
            <span className="text-muted-foreground flex shrink-0 items-center [&_svg]:size-4">
              {icon}
            </span>
          )}
          <span>{label}</span>
          {badge && (
            <span className="bg-secondary text-secondary-foreground rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold">
              {badge}
            </span>
          )}
        </span>
        {description && variant !== "segmented" && (
          <span
            id={descId}
            className="text-muted-foreground text-[0.85em] font-normal"
          >
            {description}
          </span>
        )}
      </span>
    );

    return (
      <label
        htmlFor={itemId}
        data-slot="radio-group-option"
        className={cn(
          optionVariants({ variant, size }),
          disabled && "cursor-not-allowed opacity-50",
          optionClassName,
        )}
      >
        <RadioGroupItem
          ref={ref}
          id={itemId}
          disabled={disabled}
          bare={variant === "segmented"}
          aria-describedby={description ? descId : undefined}
          className={cn(variant !== "segmented" && "mt-0.5", className)}
          {...props}
        />
        {text}
      </label>
    );
  },
);
RadioGroupOption.displayName = "RadioGroupOption";

interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

interface RadioGroupFieldProps extends RadioGroupProps {
  options: RadioOption[];
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  fieldClassName?: string;
}

function RadioGroupField({
  options,
  label,
  helperText,
  error,
  required,
  fieldClassName,
  ...groupProps
}: RadioGroupFieldProps) {
  const id = React.useId();
  const labelId = `${id}-label`;
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const describedBy =
    [error ? errorId : null, helperText ? helperId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div data-slot="radio-group-field" className={cn("grid gap-2", fieldClassName)}>
      {label && (
        <span id={labelId} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </span>
      )}
      <RadioGroup
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={describedBy}
        required={required}
        invalid={Boolean(error) || groupProps.invalid}
        {...groupProps}
      >
        {options.map((option) => (
          <RadioGroupOption
            key={option.value}
            value={option.value}
            label={option.label}
            description={option.description}
            icon={option.icon}
            badge={option.badge}
            disabled={option.disabled}
          />
        ))}
      </RadioGroup>
      {helperText && !error && (
        <p id={helperId} className="text-muted-foreground text-xs">
          {helperText}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
}

export {
  RadioGroup,
  RadioGroupItem,
  RadioGroupOption,
  RadioGroupField,
  useRadioGroupContext,
  itemVariants as radioItemVariants,
};
export type {
  RadioGroupProps,
  RadioGroupItemProps,
  RadioGroupOptionProps,
  RadioGroupFieldProps,
  RadioOption,
};
