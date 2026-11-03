"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "./utils";

/**
 * Tracks whether a <TooltipProvider> already exists higher in the tree, so a
 * lone <Tooltip> only creates its own provider when it has to. This lets
 * tooltips share one provider (and therefore Radix's "skip delay" behaviour
 * when you move between neighbouring triggers) instead of each one wrapping
 * itself in a private provider.
 */
const HasProviderContext = React.createContext(false);

function TooltipProvider({
  delayDuration = 200,
  skipDelayDuration = 300,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      {...props}
    >
      <HasProviderContext.Provider value={true}>
        {children}
      </HasProviderContext.Provider>
    </TooltipPrimitive.Provider>
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const hasProvider = React.useContext(HasProviderContext);
  const root = <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
  return hasProvider ? root : <TooltipProvider>{root}</TooltipProvider>;
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

interface TooltipContentProps
  extends React.ComponentProps<typeof TooltipPrimitive.Content> {
  /** Show the little pointer arrow. Defaults to true. */
  showArrow?: boolean;
}

function TooltipContent({
  className,
  sideOffset = 6,
  collisionPadding = 8,
  showArrow = true,
  children,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          "bg-primary text-primary-foreground z-50 w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance shadow-md",
          "animate-in fade-in-0 zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          // Honour the OS "reduce motion" setting.
          "motion-reduce:animate-none",
          className,
        )}
        {...props}
      >
        {children}
        {showArrow && (
          <TooltipPrimitive.Arrow
            className="fill-primary"
            width={10}
            height={5}
          />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

/**
 * One-liner convenience wrapper:
 *
 *   <SimpleTooltip content="Delete task" shortcut="⌫">
 *     <Button size="icon" aria-label="Delete task">…</Button>
 *   </SimpleTooltip>
 *
 * The trigger child must be a single element that can hold a ref. Always give
 * icon-only triggers an aria-label: tooltips are a visual hint, not a
 * replacement for an accessible name.
 */
interface SimpleTooltipProps
  extends Omit<React.ComponentProps<typeof TooltipPrimitive.Root>, "children"> {
  content: React.ReactNode;
  children: React.ReactElement;
  /** Optional keyboard shortcut hint shown next to the label. */
  shortcut?: string;
  side?: React.ComponentProps<typeof TooltipPrimitive.Content>["side"];
  align?: React.ComponentProps<typeof TooltipPrimitive.Content>["align"];
  /** Skip rendering the tooltip entirely (handy for conditional tooltips). */
  disabled?: boolean;
}

function SimpleTooltip({
  content,
  children,
  shortcut,
  side = "top",
  align = "center",
  disabled = false,
  ...rootProps
}: SimpleTooltipProps) {
  if (disabled || content == null || content === "") return children;
  return (
    <Tooltip {...rootProps}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} align={align}>
        <span className="flex items-center gap-2">
          {content}
          {shortcut && (
            <kbd className="bg-primary-foreground/15 rounded px-1 py-0.5 font-sans text-[10px] leading-none">
              {shortcut}
            </kbd>
          )}
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  SimpleTooltip,
};
