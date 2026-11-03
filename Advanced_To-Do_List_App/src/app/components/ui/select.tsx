"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select@2.1.6";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2Icon,
  SearchIcon,
} from "lucide-react@0.487.0";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

type SelectSize = "sm" | "default" | "lg";
type SelectVariant = "default" | "outline" | "ghost" | "filled";

interface SelectContextValue {
  size: SelectSize;
  variant: SelectVariant;
  loading: boolean;
}

const SelectContext = React.createContext<SelectContextValue>({
  size: "default",
  variant: "default",
  loading: false,
});

const useSelectContext = () => React.useContext(SelectContext);

const triggerVariants = cva(
  "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 whitespace-nowrap transition-[color,box-shadow,background-color] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[loading=true]:cursor-progress *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-input-background dark:bg-input/30 dark:hover:bg-input/50",
        outline: "bg-transparent hover:bg-accent/40",
        ghost:
          "border-transparent bg-transparent hover:bg-accent hover:text-accent-foreground",
        filled: "bg-muted border-transparent hover:bg-muted/70",
      },
      size: {
        sm: "h-8 text-xs",
        default: "h-9 text-sm",
        lg: "h-11 text-base",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

const itemVariants = cva(
  "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm pr-8 pl-2 outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      size: {
        sm: "py-1 text-xs",
        default: "py-1.5 text-sm",
        lg: "py-2 text-base",
      },
    },
    defaultVariants: { size: "default" },
  },
);

interface SelectProps
  extends React.ComponentProps<typeof SelectPrimitive.Root> {
  size?: SelectSize;
  variant?: SelectVariant;
  loading?: boolean;
}

function Select({
  size = "default",
  variant = "default",
  loading = false,
  ...props
}: SelectProps) {
  const value = React.useMemo(
    () => ({ size, variant, loading }),
    [size, variant, loading],
  );
  return (
    <SelectContext.Provider value={value}>
      <SelectPrimitive.Root data-slot="select" {...props} />
    </SelectContext.Provider>
  );
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

interface SelectTriggerProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
      "size"
    >,
    Omit<VariantProps<typeof triggerVariants>, "size" | "variant"> {
  size?: SelectSize;
  variant?: SelectVariant;
  loading?: boolean;
  invalid?: boolean;
  leadingIcon?: React.ReactNode;
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(
  (
    {
      className,
      size,
      variant,
      loading,
      invalid,
      leadingIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const ctx = useSelectContext();
    const resolvedSize = size ?? ctx.size;
    const resolvedVariant = variant ?? ctx.variant;
    const isLoading = loading ?? ctx.loading;

    return (
      <SelectPrimitive.Trigger
        ref={ref}
        data-slot="select-trigger"
        data-size={resolvedSize}
        data-loading={isLoading}
        aria-invalid={invalid || props["aria-invalid"] || undefined}
        aria-busy={isLoading || undefined}
        disabled={disabled}
        className={cn(
          triggerVariants({ variant: resolvedVariant, size: resolvedSize }),
          className,
        )}
        {...props}
      >
        {leadingIcon && (
          <span className="flex shrink-0 items-center">{leadingIcon}</span>
        )}
        <span className="flex min-w-0 flex-1 items-center text-left">
          {children}
        </span>
        <SelectPrimitive.Icon asChild>
          {isLoading ? (
            <Loader2Icon className="size-4 animate-spin opacity-60" />
          ) : (
            <ChevronDownIcon className="size-4 opacity-50" />
          )}
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    );
  },
);
SelectTrigger.displayName = "SelectTrigger";

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

interface SelectContentProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  viewportClassName?: string;
  matchTriggerWidth?: boolean;
}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(
  (
    {
      className,
      viewportClassName,
      children,
      header,
      footer,
      matchTriggerWidth = true,
      position = "popper",
      ...props
    },
    ref,
  ) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md motion-reduce:animate-none",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        {header}
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full scroll-my-1",
            position === "popper" &&
              matchTriggerWidth &&
              "min-w-[var(--radix-select-trigger-width)]",
            viewportClassName,
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
        {footer}
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  ),
);
SelectContent.displayName = "SelectContent";

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    data-slot="select-label"
    className={cn(
      "text-muted-foreground px-2 py-1.5 text-xs font-medium",
      className,
    )}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

interface SelectItemProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  description?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ className, children, description, icon, badge, ...props }, ref) => {
  const { size } = useSelectContext();
  return (
    <SelectPrimitive.Item
      ref={ref}
      data-slot="select-item"
      className={cn(
        itemVariants({ size }),
        description && "items-start py-2",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      {icon && (
        <span className={cn("flex shrink-0 items-center", description && "mt-0.5")}>
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2">
          <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
          {badge && (
            <span className="bg-secondary text-secondary-foreground rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold">
              {badge}
            </span>
          )}
        </span>
        {description && (
          <span className="text-muted-foreground text-xs font-normal">
            {description}
          </span>
        )}
      </span>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = "SelectItem";

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    data-slot="select-separator"
    className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

interface SelectSearchProps
  extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value: string;
  onValueChange: (value: string) => void;
}

function SelectSearch({
  value,
  onValueChange,
  className,
  placeholder = "Search",
  onKeyDown,
  ...props
}: SelectSearchProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      data-slot="select-search"
      className="bg-popover sticky top-0 z-10 flex items-center gap-2 border-b px-3"
    >
      <SearchIcon className="text-muted-foreground size-4 shrink-0" />
      <input
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (
            event.key !== "Escape" &&
            event.key !== "ArrowDown" &&
            event.key !== "ArrowUp" &&
            event.key !== "Tab"
          ) {
            event.stopPropagation();
          }
        }}
        autoComplete="off"
        spellCheck={false}
        className={cn(
          "placeholder:text-muted-foreground h-9 w-full bg-transparent text-sm outline-none",
          className,
        )}
        {...props}
      />
    </div>
  );
}

interface SelectOption {
  value: string;
  label: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
  group?: string;
  searchText?: string;
}

interface SelectFieldProps
  extends Omit<SelectProps, "children"> {
  options: SelectOption[];
  placeholder?: string;
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: React.ReactNode;
  id?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  leadingIcon?: React.ReactNode;
}

function SelectField({
  options,
  placeholder = "Select an option",
  label,
  helperText,
  error,
  required,
  searchable = false,
  searchPlaceholder = "Search",
  emptyMessage = "No results found",
  id,
  className,
  triggerClassName,
  contentClassName,
  leadingIcon,
  size,
  variant,
  loading,
  disabled,
  onOpenChange,
  ...rootProps
}: SelectFieldProps) {
  const generatedId = React.useId();
  const triggerId = id ?? generatedId;
  const helperId = `${triggerId}-helper`;
  const errorId = `${triggerId}-error`;
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) =>
      (option.searchText ?? option.label).toLowerCase().includes(q),
    );
  }, [options, query]);

  const groups = React.useMemo(() => {
    const map = new Map<string | undefined, SelectOption[]>();
    filtered.forEach((option) => {
      const list = map.get(option.group) ?? [];
      list.push(option);
      map.set(option.group, list);
    });
    const ungrouped = map.get(undefined) ?? [];
    const named = Array.from(map.entries()).filter(([key]) => key !== undefined);
    return { ungrouped, named: named as Array<[string, SelectOption[]]> };
  }, [filtered]);

  const renderItem = (option: SelectOption) => (
    <SelectItem
      key={option.value}
      value={option.value}
      disabled={option.disabled}
      description={option.description}
      icon={option.icon}
      badge={option.badge}
    >
      {option.label}
    </SelectItem>
  );

  const describedBy =
    [error ? errorId : null, helperText ? helperId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div data-slot="select-field" className={cn("grid gap-1.5", className)}>
      {label && (
        <label htmlFor={triggerId} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}
      <Select
        size={size}
        variant={variant}
        loading={loading}
        disabled={disabled}
        required={required}
        onOpenChange={(open) => {
          if (!open) setQuery("");
          onOpenChange?.(open);
        }}
        {...rootProps}
      >
        <SelectTrigger
          id={triggerId}
          invalid={Boolean(error)}
          aria-describedby={describedBy}
          leadingIcon={leadingIcon}
          className={triggerClassName}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          className={contentClassName}
          header={
            searchable ? (
              <SelectSearch
                value={query}
                onValueChange={setQuery}
                placeholder={searchPlaceholder}
              />
            ) : undefined
          }
        >
          {filtered.length === 0 && (
            <div className="text-muted-foreground px-2 py-6 text-center text-sm">
              {emptyMessage}
            </div>
          )}
          {groups.ungrouped.map(renderItem)}
          {groups.named.map(([group, items], index) => (
            <React.Fragment key={group}>
              {(index > 0 || groups.ungrouped.length > 0) && <SelectSeparator />}
              <SelectGroup>
                <SelectLabel>{group}</SelectLabel>
                {items.map(renderItem)}
              </SelectGroup>
            </React.Fragment>
          ))}
        </SelectContent>
      </Select>
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
  Select,
  SelectContent,
  SelectField,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSearch,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  useSelectContext,
  triggerVariants,
};
export type {
  SelectProps,
  SelectTriggerProps,
  SelectContentProps,
  SelectItemProps,
  SelectOption,
  SelectFieldProps,
};
