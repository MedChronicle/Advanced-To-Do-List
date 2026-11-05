"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";
import { Loader2Icon } from "lucide-react@0.487.0";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98] motion-reduce:active:scale-100 aria-busy:cursor-progress",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline active:scale-100",
        success:
          "bg-emerald-600 text-white hover:bg-emerald-600/90 focus-visible:ring-emerald-500/30 dark:bg-emerald-600/70",
        warning:
          "bg-amber-500 text-black hover:bg-amber-500/90 focus-visible:ring-amber-500/30",
        soft: "bg-primary/10 text-primary hover:bg-primary/20",
        "soft-destructive":
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/20",
        "outline-destructive":
          "border border-destructive/50 bg-background text-destructive hover:bg-destructive/10 focus-visible:ring-destructive/20",
        gradient:
          "bg-gradient-to-r from-primary to-primary/60 text-primary-foreground hover:opacity-90",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-7 rounded-md gap-1 px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-md px-8 text-base has-[>svg]:px-6 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-9 rounded-md",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-10 rounded-md",
      },
      shape: {
        default: "",
        pill: "rounded-full",
        square: "rounded-none",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
      fullWidth: false,
    },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

interface ButtonGroupContextValue {
  variant?: ButtonVariantProps["variant"];
  size?: ButtonVariantProps["size"];
}

const ButtonGroupContext = React.createContext<ButtonGroupContextValue>({});

interface ButtonProps
  extends React.ComponentProps<"button">,
    ButtonVariantProps {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: React.ReactNode;
  autoLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  shortcut?: React.ReactNode;
  spinnerClassName?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      shape,
      fullWidth,
      asChild = false,
      loading,
      loadingText,
      autoLoading = false,
      leftIcon,
      rightIcon,
      shortcut,
      spinnerClassName,
      disabled,
      onClick,
      children,
      ...props
    },
    ref,
  ) => {
    const group = React.useContext(ButtonGroupContext);
    const [pending, setPending] = React.useState(false);
    const mountedRef = React.useRef(true);

    React.useEffect(() => {
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
      };
    }, []);

    const isLoading = loading ?? pending;
    const resolvedVariant = variant ?? group.variant;
    const resolvedSize = size ?? group.size;

    const classes = cn(
      buttonVariants({
        variant: resolvedVariant,
        size: resolvedSize,
        shape,
        fullWidth,
      }),
      className,
    );

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading) {
        event.preventDefault();
        return;
      }
      const result = onClick?.(event) as unknown;
      if (
        autoLoading &&
        result &&
        typeof (result as Promise<unknown>).then === "function"
      ) {
        setPending(true);
        (result as Promise<unknown>).then(
          () => mountedRef.current && setPending(false),
          () => mountedRef.current && setPending(false),
        );
      }
    };

    if (asChild) {
      return (
        <Slot
          ref={ref as React.Ref<HTMLElement>}
          data-slot="button"
          className={classes}
          {...(props as React.HTMLAttributes<HTMLElement>)}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        data-slot="button"
        data-loading={isLoading || undefined}
        aria-busy={isLoading || undefined}
        disabled={disabled}
        aria-disabled={isLoading || undefined}
        className={classes}
        onClick={handleClick}
        {...props}
      >
        {isLoading ? (
          <Loader2Icon
            aria-hidden
            className={cn("animate-spin motion-reduce:animate-none", spinnerClassName)}
          />
        ) : (
          leftIcon
        )}
        {isLoading && loadingText ? loadingText : children}
        {!isLoading && rightIcon}
        {shortcut && !isLoading && (
          <kbd className="bg-foreground/10 pointer-events-none ml-1 rounded px-1.5 py-0.5 font-mono text-[10px] leading-none font-medium opacity-80">
            {shortcut}
          </kbd>
        )}
      </button>
    );
  },
);
Button.displayName = "Button";

interface IconButtonProps extends Omit<ButtonProps, "children" | "leftIcon" | "rightIcon" | "shortcut"> {
  label: string;
  children: React.ReactNode;
  showTitle?: boolean;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, children, size = "icon", showTitle = true, ...props }, ref) => (
    <Button
      ref={ref}
      size={size}
      aria-label={label}
      title={showTitle ? label : undefined}
      {...props}
    >
      {children}
    </Button>
  ),
);
IconButton.displayName = "IconButton";

interface ToggleButtonProps
  extends Omit<ButtonProps, "onChange" | "variant"> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  pressedVariant?: ButtonVariantProps["variant"];
  unpressedVariant?: ButtonVariantProps["variant"];
}

const ToggleButton = React.forwardRef<HTMLButtonElement, ToggleButtonProps>(
  (
    {
      pressed: pressedProp,
      defaultPressed = false,
      onPressedChange,
      pressedVariant = "default",
      unpressedVariant = "outline",
      onClick,
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState(defaultPressed);
    const isControlled = pressedProp !== undefined;
    const pressed = isControlled ? pressedProp : internal;

    return (
      <Button
        ref={ref}
        aria-pressed={pressed}
        data-state={pressed ? "on" : "off"}
        variant={pressed ? pressedVariant : unpressedVariant}
        onClick={(event) => {
          const next = !pressed;
          if (!isControlled) setInternal(next);
          onPressedChange?.(next);
          return onClick?.(event);
        }}
        {...props}
      />
    );
  },
);
ToggleButton.displayName = "ToggleButton";

interface ButtonGroupProps extends React.ComponentPropsWithoutRef<"div"> {
  orientation?: "horizontal" | "vertical";
  attached?: boolean;
  variant?: ButtonVariantProps["variant"];
  size?: ButtonVariantProps["size"];
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      className,
      orientation = "horizontal",
      attached = true,
      variant,
      size,
      ...props
    },
    ref,
  ) => {
    const value = React.useMemo(() => ({ variant, size }), [variant, size]);
    return (
      <ButtonGroupContext.Provider value={value}>
        <div
          ref={ref}
          role="group"
          data-slot="button-group"
          data-orientation={orientation}
          className={cn(
            "inline-flex",
            orientation === "vertical" ? "flex-col" : "flex-row",
            !attached && (orientation === "vertical" ? "gap-2" : "gap-2"),
            attached &&
              orientation === "horizontal" &&
              "[&>*:not(:first-child)]:-ml-px [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*:focus-visible]:z-10",
            attached &&
              orientation === "vertical" &&
              "[&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none [&>*:focus-visible]:z-10",
            className,
          )}
          {...props}
        />
      </ButtonGroupContext.Provider>
    );
  },
);
ButtonGroup.displayName = "ButtonGroup";

export { Button, IconButton, ToggleButton, ButtonGroup, buttonVariants };
export type {
  ButtonProps,
  IconButtonProps,
  ToggleButtonProps,
  ButtonGroupProps,
};
