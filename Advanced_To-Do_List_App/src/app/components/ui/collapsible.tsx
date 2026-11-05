"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible@1.1.3";
import { ChevronDownIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

/* -------------------------------------------------------------------------- */
/*  Hook: open state with optional localStorage persistence                   */
/* -------------------------------------------------------------------------- */

/**
 * Open/closed state that can survive reloads.
 * Safe for SSR: starts with `defaultOpen`, then hydrates from storage.
 */
function useCollapsibleState(defaultOpen = false, persistKey?: string) {
  const [open, setOpenState] = React.useState(defaultOpen);

  React.useEffect(() => {
    if (!persistKey) return;
    try {
      const stored = window.localStorage.getItem(`collapsible:${persistKey}`);
      if (stored !== null) setOpenState(stored === "1");
    } catch {
      /* storage unavailable – ignore */
    }
  }, [persistKey]);

  const setOpen = React.useCallback(
    (next: boolean) => {
      setOpenState(next);
      if (!persistKey) return;
      try {
        window.localStorage.setItem(`collapsible:${persistKey}`, next ? "1" : "0");
      } catch {
        /* ignore */
      }
    },
    [persistKey],
  );

  return [open, setOpen] as const;
}

/* -------------------------------------------------------------------------- */
/*  Primitives                                                                */
/* -------------------------------------------------------------------------- */

type CollapsibleProps = React.ComponentProps<typeof CollapsiblePrimitive.Root> & {
  /** Remember the open state in localStorage under this key (uncontrolled only). */
  persistKey?: string;
};

function Collapsible({
  persistKey,
  defaultOpen,
  open: controlledOpen,
  onOpenChange,
  ...props
}: CollapsibleProps) {
  const [stored, setStored] = useCollapsibleState(defaultOpen ?? false, persistKey);
  const isControlled = controlledOpen !== undefined;

  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      open={isControlled ? controlledOpen : stored}
      onOpenChange={(next) => {
        if (!isControlled) setStored(next);
        onOpenChange?.(next);
      }}
      {...props}
    />
  );
}

type CollapsibleTriggerProps = React.ComponentProps<
  typeof CollapsiblePrimitive.CollapsibleTrigger
> & {
  /** Adds a chevron that rotates when open. Ignored with `asChild`. */
  showChevron?: boolean;
  chevronPosition?: "start" | "end";
};

function CollapsibleTrigger({
  className,
  children,
  asChild,
  showChevron = false,
  chevronPosition = "end",
  ...props
}: CollapsibleTriggerProps) {
  const chevron = (
    <ChevronDownIcon
      aria-hidden
      className="text-muted-foreground size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/trigger:rotate-180 motion-reduce:transition-none"
    />
  );

  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      asChild={asChild}
      className={cn(
        !asChild &&
          "group/trigger focus-visible:ring-ring/50 flex w-full items-center gap-2 rounded-md text-left outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {asChild || !showChevron ? (
        children
      ) : (
        <>
          {chevronPosition === "start" && chevron}
          <span className="flex-1">{children}</span>
          {chevronPosition === "end" && chevron}
        </>
      )}
    </CollapsiblePrimitive.CollapsibleTrigger>
  );
}

type CollapsibleContentProps = React.ComponentProps<
  typeof CollapsiblePrimitive.CollapsibleContent
> & {
  /** Smoothly animate height (default true). Set false for instant toggle. */
  animated?: boolean;
};

function CollapsibleContent({
  className,
  children,
  animated = true,
  ...props
}: CollapsibleContentProps) {
  if (!animated) {
    return (
      <CollapsiblePrimitive.CollapsibleContent
        data-slot="collapsible-content"
        className={className}
        {...props}
      >
        {children}
      </CollapsiblePrimitive.CollapsibleContent>
    );
  }

  /**
   * Height animation via the grid-rows trick: the content stays mounted
   * (forceMount), the row animates 0fr <-> 1fr, and `invisible` removes the
   * closed content from the tab order and accessibility tree once collapsed.
   */
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      forceMount
      className={cn(
        "!grid transition-[grid-template-rows,visibility] duration-200 ease-out motion-reduce:transition-none",
        "data-[state=closed]:invisible data-[state=closed]:grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]",
      )}
      {...props}
    >
      <div className={cn("min-h-0 overflow-hidden", className)}>{children}</div>
    </CollapsiblePrimitive.CollapsibleContent>
  );
}

/* -------------------------------------------------------------------------- */
/*  CollapsibleSection – ready-made titled panel                              */
/* -------------------------------------------------------------------------- */

interface CollapsibleSectionProps
  extends Omit<CollapsibleProps, "title" | "children"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  /** Small badge/count shown beside the title, e.g. number of items. */
  badge?: React.ReactNode;
  /** Content aligned to the far right of the header (before the chevron). */
  actions?: React.ReactNode;
  variant?: "default" | "card" | "ghost";
  children: React.ReactNode;
  contentClassName?: string;
}

function CollapsibleSection({
  title,
  description,
  icon,
  badge,
  actions,
  variant = "default",
  className,
  contentClassName,
  children,
  ...props
}: CollapsibleSectionProps) {
  return (
    <Collapsible
      className={cn(
        variant === "card" && "bg-card rounded-lg border shadow-xs",
        variant === "default" && "border-b",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "flex items-center gap-2",
          variant === "card" ? "px-4 py-3" : "py-3",
        )}
      >
        <CollapsibleTrigger
          showChevron
          chevronPosition="start"
          disabled={props.disabled}
          className="min-w-0 flex-1"
        >
          <span className="flex items-center gap-2">
            {icon && <span className="text-muted-foreground [&>svg]:size-4">{icon}</span>}
            <span className="grid gap-0.5">
              <span className="text-sm leading-none font-medium">{title}</span>
              {description && (
                <span className="text-muted-foreground text-xs font-normal">
                  {description}
                </span>
              )}
            </span>
            {badge !== undefined && (
              <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium tabular-nums">
                {badge}
              </span>
            )}
          </span>
        </CollapsibleTrigger>
        {actions}
      </div>
      <CollapsibleContent>
        <div
          className={cn(
            "pb-4 text-sm",
            variant === "card" ? "px-4" : "pl-6",
            contentClassName,
          )}
        >
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleSection,
  useCollapsibleState,
};
export type {
  CollapsibleProps,
  CollapsibleTriggerProps,
  CollapsibleContentProps,
  CollapsibleSectionProps,
};
