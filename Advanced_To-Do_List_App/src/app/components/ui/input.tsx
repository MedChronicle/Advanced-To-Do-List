"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label@2.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const labelVariants = cva(
  "flex items-center gap-2 leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
      invalid: {
        true: "text-destructive",
        false: "",
      },
    },
    defaultVariants: { size: "md", invalid: false },
  },
);

interface FieldContextValue {
  id: string;
  descriptionId: string;
  errorId: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
  hasDescription: boolean;
  hasError: boolean;
  setHasDescription: (value: boolean) => void;
  setHasError: (value: boolean) => void;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

function useFieldContext() {
  return React.useContext(FieldContext);
}

interface FieldProps extends React.ComponentPropsWithoutRef<"div"> {
  id?: string;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  (
    {
      className,
      id,
      invalid = false,
      required = false,
      disabled = false,
      orientation = "vertical",
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const baseId = id ?? generatedId;
    const [hasDescription, setHasDescription] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);

    const value = React.useMemo<FieldContextValue>(
      () => ({
        id: baseId,
        descriptionId: `${baseId}-description`,
        errorId: `${baseId}-error`,
        invalid,
        required,
        disabled,
        hasDescription,
        hasError,
        setHasDescription,
        setHasError,
      }),
      [baseId, invalid, required, disabled, hasDescription, hasError],
    );

    return (
      <FieldContext.Provider value={value}>
        <div
          ref={ref}
          data-slot="field"
          data-invalid={invalid || undefined}
          data-disabled={disabled || undefined}
          data-orientation={orientation}
          className={cn(
            "group",
            orientation === "vertical"
              ? "grid gap-1.5"
              : "grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5",
            className,
          )}
          {...props}
        />
      </FieldContext.Provider>
    );
  },
);
Field.displayName = "Field";

function useField() {
  const ctx = useFieldContext();
  const describedBy =
    [
      ctx?.hasDescription ? ctx.descriptionId : null,
      ctx?.invalid && ctx.hasError ? ctx.errorId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return {
    id: ctx?.id,
    invalid: ctx?.invalid ?? false,
    required: ctx?.required ?? false,
    disabled: ctx?.disabled ?? false,
    controlProps: {
      id: ctx?.id,
      "aria-describedby": describedBy,
      "aria-invalid": ctx?.invalid || undefined,
      "aria-required": ctx?.required || undefined,
      disabled: ctx?.disabled || undefined,
    },
  };
}

interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    Omit<VariantProps<typeof labelVariants>, "invalid"> {
  required?: boolean;
  optional?: boolean | React.ReactNode;
  invalid?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  hint?: React.ReactNode;
  requiredIndicator?: React.ReactNode;
  requiredLabel?: string;
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(
  (
    {
      className,
      children,
      size,
      required,
      optional,
      invalid,
      icon,
      badge,
      hint,
      requiredIndicator,
      requiredLabel = "required",
      htmlFor,
      ...props
    },
    ref,
  ) => {
    const field = useFieldContext();
    const isRequired = required ?? field?.required ?? false;
    const isInvalid = invalid ?? field?.invalid ?? false;
    const isDisabled = field?.disabled ?? false;

    return (
      <LabelPrimitive.Root
        ref={ref}
        data-slot="label"
        data-disabled={isDisabled || undefined}
        htmlFor={htmlFor ?? field?.id}
        className={cn(
          labelVariants({ size, invalid: isInvalid }),
          hint && "justify-between",
          className,
        )}
        {...props}
      >
        <span className="inline-flex items-center gap-2">
          {icon && (
            <span className="text-muted-foreground inline-flex shrink-0 [&_svg]:size-4">
              {icon}
            </span>
          )}
          <span>{children}</span>
          {isRequired && (
            <>
              <span aria-hidden className="text-destructive -ml-1">
                {requiredIndicator ?? "*"}
              </span>
              <span className="sr-only">({requiredLabel})</span>
            </>
          )}
          {!isRequired && optional && (
            <span className="text-muted-foreground -ml-1 text-[0.85em] font-normal">
              {optional === true ? "(optional)" : optional}
            </span>
          )}
          {badge && (
            <span className="bg-secondary text-secondary-foreground rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold">
              {badge}
            </span>
          )}
        </span>
        {hint && (
          <span className="text-muted-foreground text-[0.85em] font-normal">
            {hint}
          </span>
        )}
      </LabelPrimitive.Root>
    );
  },
);
Label.displayName = "Label";

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(({ className, id, children, ...props }, ref) => {
  const field = useFieldContext();
  const setHasDescription = field?.setHasDescription;
  const hasContent = Boolean(children);

  React.useEffect(() => {
    if (!setHasDescription) return;
    setHasDescription(hasContent);
    return () => setHasDescription(false);
  }, [setHasDescription, hasContent]);

  if (!hasContent) return null;

  return (
    <p
      ref={ref}
      id={id ?? field?.descriptionId}
      data-slot="field-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    >
      {children}
    </p>
  );
});
FieldDescription.displayName = "FieldDescription";

const FieldError = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(({ className, id, children, ...props }, ref) => {
  const field = useFieldContext();
  const setHasError = field?.setHasError;
  const hasContent = Boolean(children);

  React.useEffect(() => {
    if (!setHasError) return;
    setHasError(hasContent);
    return () => setHasError(false);
  }, [setHasError, hasContent]);

  if (!hasContent) return null;

  return (
    <p
      ref={ref}
      id={id ?? field?.errorId}
      role="alert"
      data-slot="field-error"
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {children}
    </p>
  );
});
FieldError.displayName = "FieldError";

interface LabeledFieldProps extends Omit<FieldProps, "children"> {
  label: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  optional?: boolean | React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  size?: LabelProps["size"];
  labelClassName?: string;
  children: React.ReactNode;
}

function LabeledField({
  label,
  description,
  error,
  optional,
  hint,
  icon,
  size,
  labelClassName,
  invalid,
  children,
  ...fieldProps
}: LabeledFieldProps) {
  const isInvalid = invalid ?? Boolean(error);
  return (
    <Field invalid={isInvalid} {...fieldProps}>
      <Label
        size={size}
        optional={optional}
        hint={hint}
        icon={icon}
        className={labelClassName}
      >
        {label}
      </Label>
      {children}
      <FieldDescription>{description}</FieldDescription>
      <FieldError>{isInvalid ? error : null}</FieldError>
    </Field>
  );
}

export {
  Label,
  Field,
  FieldDescription,
  FieldError,
  LabeledField,
  useField,
  useFieldContext,
  labelVariants,
};
export type { LabelProps, FieldProps, LabeledFieldProps };
