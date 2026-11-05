"use client";

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card@1.1.6";

import { cn } from "./utils";

type HoverCardSize = "sm" | "md" | "lg" | "auto";

const sizeClasses: Record<HoverCardSize, string> = {
  sm: "w-48 p-3 text-sm",
  md: "w-64 p-4",
  lg: "w-80 p-5",
  auto: "w-auto max-w-sm p-4",
};

/**
 * Root. Defaults to snappier-than-Radix delays so cards feel intentional
 * (not flickery) when the pointer passes over triggers.
 */
function HoverCard({
  openDelay = 200,
  closeDelay = 100,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return (
    <HoverCardPrimitive.Root
      data-slot="hover-card"
      openDelay={openDelay}
      closeDelay={closeDelay}
      {...props}
    />
  );
}

const HoverCardTrigger = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Trigger>
>(({ ...props }, ref) => (
  <HoverCardPrimitive.Trigger
    ref={ref}
    data-slot="hover-card-trigger"
    {...props}
  />
));
HoverCardTrigger.displayName = "HoverCardTrigger";

interface HoverCardContentProps
  extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content> {
  /** Width / padding preset. */
  size?: HoverCardSize;
  /** Render a small arrow pointing at the trigger. */
  showArrow?: boolean;
  /** Mount the portal into a custom container (e.g. inside a dialog). */
  container?: HTMLElement | null;
}

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  HoverCardContentProps
>(
  (
    {
      className,
      align = "center",
      sideOffset = 6,
      collisionPadding = 8,
      size = "md",
      showArrow = false,
      container,
      children,
      ...props
    },
    ref,
  ) => (
    <HoverCardPrimitive.Portal
      data-slot="hover-card-portal"
      container={container ?? undefined}
    >
      <HoverCardPrimitive.Content
        ref={ref}
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 origin-(--radix-hover-card-content-transform-origin) rounded-md border shadow-md outline-hidden",
          "max-h-(--radix-hover-card-content-available-height) overflow-auto",
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
        {showArrow && (
          <HoverCardPrimitive.Arrow
            data-slot="hover-card-arrow"
            className="fill-popover stroke-border"
          />
        )}
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Portal>
  ),
);
HoverCardContent.displayName = "HoverCardContent";

/**
 * Convenience wrapper: <SimpleHoverCard content={...}>trigger</SimpleHoverCard>
 */
interface SimpleHoverCardProps
  extends Omit<React.ComponentProps<typeof HoverCardPrimitive.Root>, "children"> {
  children: React.ReactNode;
  content: React.ReactNode;
  contentProps?: Omit<HoverCardContentProps, "children">;
}

function SimpleHoverCard({
  children,
  content,
  contentProps,
  ...rootProps
}: SimpleHoverCardProps) {
  return (
    <HoverCard {...rootProps}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent {...contentProps}>{content}</HoverCardContent>
    </HoverCard>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent, SimpleHoverCard };
export type { HoverCardContentProps, HoverCardSize };
