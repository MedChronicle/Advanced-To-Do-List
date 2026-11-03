"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion@1.2.3";
import { ChevronDownIcon, PlusIcon } from "lucide-react@0.487.0";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

type AccordionVariant = "default" | "bordered" | "card" | "ghost" | "separated";
type AccordionSize = "sm" | "md" | "lg";
type AccordionIcon = "chevron" | "plus" | "none";
type AccordionIconPosition = "start" | "end";

interface AccordionContextValue {
  variant: AccordionVariant;
  size: AccordionSize;
  icon: AccordionIcon;
  iconPosition: AccordionIconPosition;
}

const AccordionContext = React.createContext<AccordionContextValue>({
  variant: "default",
  size: "md",
  icon: "chevron",
  iconPosition: "end",
});

const useAccordionContext = () => React.useContext(AccordionContext);

const rootVariants = cva("w-full", {
  variants: {
    variant: {
      default: "",
      bordered: "overflow-hidden rounded-xl border divide-y",
      card: "flex flex-col gap-3",
      ghost: "flex flex-col gap-1",
      separated: "flex flex-col gap-2",
    },
  },
  defaultVariants: { variant: "default" },
});

const itemVariants = cva("transition-colors", {
  variants: {
    variant: {
      default: "border-b last:border-b-0",
      bordered: "data-[state=open]:bg-muted/30",
      card: "bg-card rounded-xl border shadow-xs data-[state=open]:shadow-md",
      ghost: "rounded-lg data-[state=open]:bg-muted/50",
      separated: "rounded-lg border data-[state=open]:border-primary/40",
    },
  },
  defaultVariants: { variant: "default" },
});

const triggerVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 group flex flex-1 items-start justify-between gap-4 text-left font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "py-2.5 text-xs",
        md: "py-4 text-sm",
        lg: "py-5 text-base",
      },
      variant: {
        default: "rounded-md hover:underline",
        bordered: "px-4 hover:bg-muted/50",
        card: "rounded-xl px-4 hover:bg-muted/40",
        ghost: "rounded-lg px-3 hover:bg-muted/60",
        separated: "rounded-lg px-4 hover:bg-muted/40",
      },
    },
    defaultVariants: { size: "md", variant: "default" },
  },
);

const contentPaddingVariants = cva("", {
  variants: {
    size: {
      sm: "pb-2.5 text-xs",
      md: "pb-4 text-sm",
      lg: "pb-5 text-base",
    },
    variant: {
      default: "pt-0",
      bordered: "px-4 pt-0",
      card: "px-4 pt-0",
      ghost: "px-3 pt-0",
      separated: "px-4 pt-0",
    },
  },
  defaultVariants: { size: "md", variant: "default" },
});

type AccordionProps = React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Root
> &
  VariantProps<typeof rootVariants> & {
    size?: AccordionSize;
    icon?: AccordionIcon;
    iconPosition?: AccordionIconPosition;
  };

const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  AccordionProps
>(
  (
    {
      className,
      variant = "default",
      size = "md",
      icon = "chevron",
      iconPosition = "end",
      ...props
    },
    ref,
  ) => {
    const value = React.useMemo<AccordionContextValue>(
      () => ({
        variant: variant ?? "default",
        size,
        icon,
        iconPosition,
      }),
      [variant, size, icon, iconPosition],
    );

    return (
      <AccordionContext.Provider value={value}>
        <AccordionPrimitive.Root
          ref={ref}
          data-slot="accordion"
          data-variant={variant}
          className={cn(rootVariants({ variant }), className)}
          {...(props as React.ComponentPropsWithoutRef<
            typeof AccordionPrimitive.Root
          >)}
        />
      </AccordionContext.Provider>
    );
  },
);
Accordion.displayName = "Accordion";

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => {
  const { variant } = useAccordionContext();
  return (
    <AccordionPrimitive.Item
      ref={ref}
      data-slot="accordion-item"
      className={cn(itemVariants({ variant }), className)}
      {...props}
    />
  );
});
AccordionItem.displayName = "AccordionItem";

function AccordionIndicator({
  icon,
  className,
}: {
  icon: AccordionIcon;
  className?: string;
}) {
  if (icon === "none") return null;
  if (icon === "plus") {
    return (
      <PlusIcon
        aria-hidden
        className={cn(
          "text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200 motion-reduce:transition-none group-data-[state=open]:rotate-45",
          className,
        )}
      />
    );
  }
  return (
    <ChevronDownIcon
      aria-hidden
      className={cn(
        "text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200 motion-reduce:transition-none group-data-[state=open]:rotate-180",
        className,
      )}
    />
  );
}

interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  leadingIcon?: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: AccordionIcon;
  iconPosition?: AccordionIconPosition;
  headerClassName?: string;
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(
  (
    {
      className,
      headerClassName,
      children,
      leadingIcon,
      description,
      badge,
      icon,
      iconPosition,
      ...props
    },
    ref,
  ) => {
    const ctx = useAccordionContext();
    const resolvedIcon = icon ?? ctx.icon;
    const resolvedPosition = iconPosition ?? ctx.iconPosition;

    return (
      <AccordionPrimitive.Header className={cn("flex", headerClassName)}>
        <AccordionPrimitive.Trigger
          ref={ref}
          data-slot="accordion-trigger"
          className={cn(
            triggerVariants({ size: ctx.size, variant: ctx.variant }),
            className,
          )}
          {...props}
        >
          {resolvedPosition === "start" && (
            <AccordionIndicator icon={resolvedIcon} />
          )}
          {leadingIcon && (
            <span className="text-muted-foreground mt-0.5 shrink-0 [&_svg]:size-4">
              {leadingIcon}
            </span>
          )}
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex items-center gap-2">
              <span className="truncate-none">{children}</span>
              {badge && (
                <span className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-[10px] leading-none font-semibold">
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
          {resolvedPosition === "end" && (
            <AccordionIndicator icon={resolvedIcon} />
          )}
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    );
  },
);
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> & {
    innerClassName?: string;
  }
>(({ className, innerClassName, children, ...props }, ref) => {
  const { size, variant } = useAccordionContext();
  return (
    <AccordionPrimitive.Content
      ref={ref}
      data-slot="accordion-content"
      className={cn(
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden motion-reduce:animate-none",
        contentPaddingVariants({ size, variant }),
        className,
      )}
      {...props}
    >
      <div className={cn("pt-0", innerClassName)}>{children}</div>
    </AccordionPrimitive.Content>
  );
});
AccordionContent.displayName = "AccordionContent";

interface AccordionListItem {
  value: string;
  title: React.ReactNode;
  content: React.ReactNode;
  description?: React.ReactNode;
  leadingIcon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

function AccordionList({
  items,
  ...props
}: AccordionProps & { items: AccordionListItem[] }) {
  return (
    <Accordion {...props}>
      {items.map((item) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          disabled={item.disabled}
        >
          <AccordionTrigger
            leadingIcon={item.leadingIcon}
            description={item.description}
            badge={item.badge}
          >
            {item.title}
          </AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AccordionList,
  useAccordionContext,
};
export type { AccordionProps, AccordionTriggerProps, AccordionListItem };
