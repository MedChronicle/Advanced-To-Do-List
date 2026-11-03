"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover@1.1.6";
import { XIcon } from "lucide-react@0.487.0";
import { cva } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

type PopoverSize = "sm" | "md" | "lg" | "xl" | "fit";

interface PopoverContextValue {
  openOnHover: boolean;
  onTriggerEnter: (event: React.PointerEvent) => void;
  onTriggerLeave: (event: React.PointerEvent) => void;
  onContentEnter: (event: React.PointerEvent) => void;
  onContentLeave: (event: React.PointerEvent) => void;
  lastPointerType: React.MutableRefObject<string>;
  close: () => void;
}

const noop = () => {};

const PopoverContext = React.createContext<PopoverContextValue>({
  openOnHover: false,
  onTriggerEnter: noop,
  onTriggerLeave: noop,
  onContentEnter: noop,
  onContentLeave: noop,
  lastPointerType: { current: "mouse" },
  close: noop,
});

const usePopoverContext = () => React.useContext(PopoverContext);

const contentVariants = cva(
  "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-w-[calc(100vw-1rem)] origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden motion-reduce:animate-none",
  {
    variants: {
      size: {
        sm: "w-56",
        md: "w-72",
        lg: "w-96",
        xl: "w-[32rem]",
        fit: "w-auto",
      },
    },
    defaultVariants: { size: "md" },
  },
);

interface PopoverProps
  extends React.ComponentProps<typeof PopoverPrimitive.Root> {
  openOnHover?: boolean;
  hoverDelay?: number;
  closeDelay?: number;
}

function Popover({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  openOnHover = false,
  hoverDelay = 150,
  closeDelay = 120,
  ...props
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const timerRef = React.useRef<number | null>(null);
  const lastPointerType = React.useRef<string>("mouse");

  const clearTimer = React.useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const schedule = React.useCallback(
    (next: boolean, delay: number) => {
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        setOpen(next);
      }, delay);
    },
    [clearTimer, setOpen],
  );

  React.useEffect(() => clearTimer, [clearTimer]);

  const value = React.useMemo<PopoverContextValue>(() => {
    const enter = (event: React.PointerEvent) => {
      if (!openOnHover || event.pointerType === "touch") return;
      schedule(true, hoverDelay);
    };
    const leave = (event: React.PointerEvent) => {
      if (!openOnHover || event.pointerType === "touch") return;
      schedule(false, closeDelay);
    };
    return {
      openOnHover,
      onTriggerEnter: enter,
      onTriggerLeave: leave,
      onContentEnter: (event) => {
        if (!openOnHover || event.pointerType === "touch") return;
        clearTimer();
      },
      onContentLeave: leave,
      lastPointerType,
      close: () => {
        clearTimer();
        setOpen(false);
      },
    };
  }, [openOnHover, schedule, hoverDelay, closeDelay, clearTimer, setOpen]);

  return (
    <PopoverContext.Provider value={value}>
      <PopoverPrimitive.Root
        data-slot="popover"
        open={open}
        onOpenChange={(next) => {
          clearTimer();
          setOpen(next);
        }}
        {...props}
      />
    </PopoverContext.Provider>
  );
}

const PopoverTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>(({ onPointerEnter, onPointerLeave, onPointerDown, onClick, ...props }, ref) => {
  const ctx = usePopoverContext();
  return (
    <PopoverPrimitive.Trigger
      ref={ref}
      data-slot="popover-trigger"
      onPointerDown={(event) => {
        ctx.lastPointerType.current = event.pointerType;
        onPointerDown?.(event);
      }}
      onPointerEnter={(event) => {
        ctx.onTriggerEnter(event);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        ctx.onTriggerLeave(event);
        onPointerLeave?.(event);
      }}
      onClick={(event) => {
        if (ctx.openOnHover && ctx.lastPointerType.current !== "touch") {
          event.preventDefault();
        }
        onClick?.(event);
      }}
      {...props}
    />
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

interface PopoverContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  size?: PopoverSize;
  arrow?: boolean;
  arrowClassName?: string;
  showClose?: boolean;
  closeLabel?: string;
  matchTriggerWidth?: boolean;
  container?: HTMLElement | null;
}

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(
  (
    {
      className,
      align = "center",
      sideOffset = 4,
      collisionPadding = 8,
      size,
      arrow = false,
      arrowClassName,
      showClose = false,
      closeLabel = "Close",
      matchTriggerWidth = false,
      container,
      children,
      style,
      onPointerEnter,
      onPointerLeave,
      onOpenAutoFocus,
      onCloseAutoFocus,
      ...props
    },
    ref,
  ) => {
    const ctx = usePopoverContext();
    return (
      <PopoverPrimitive.Portal container={container ?? undefined}>
        <PopoverPrimitive.Content
          ref={ref}
          data-slot="popover-content"
          align={align}
          sideOffset={sideOffset}
          collisionPadding={collisionPadding}
          className={cn(
            contentVariants({ size }),
            matchTriggerWidth && "w-(--radix-popover-trigger-width)",
            showClose && "pr-10",
            className,
          )}
          style={style}
          onPointerEnter={(event) => {
            ctx.onContentEnter(event);
            onPointerEnter?.(event);
          }}
          onPointerLeave={(event) => {
            ctx.onContentLeave(event);
            onPointerLeave?.(event);
          }}
          onOpenAutoFocus={(event) => {
            if (ctx.openOnHover && ctx.lastPointerType.current !== "touch") {
              event.preventDefault();
            }
            onOpenAutoFocus?.(event);
          }}
          onCloseAutoFocus={(event) => {
            if (ctx.openOnHover && ctx.lastPointerType.current !== "touch") {
              event.preventDefault();
            }
            onCloseAutoFocus?.(event);
          }}
          {...props}
        >
          {children}
          {showClose && (
            <PopoverPrimitive.Close
              data-slot="popover-close-button"
              aria-label={closeLabel}
              className="focus-visible:ring-ring/50 absolute top-3 right-3 inline-flex size-6 items-center justify-center rounded-md opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:ring-[3px]"
            >
              <XIcon className="size-4" />
            </PopoverPrimitive.Close>
          )}
          {arrow && (
            <PopoverPrimitive.Arrow
              data-slot="popover-arrow"
              className={cn(
                "fill-popover -mt-px drop-shadow-[0_1px_0_var(--border)]",
                arrowClassName,
              )}
            />
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    );
  },
);
PopoverContent.displayName = "PopoverContent";

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

const PopoverClose = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Close>
>((props, ref) => (
  <PopoverPrimitive.Close ref={ref} data-slot="popover-close" {...props} />
));
PopoverClose.displayName = "PopoverClose";

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("mb-3 flex flex-col gap-1", className)}
      {...props}
    />
  );
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h4">) {
  return (
    <h4
      data-slot="popover-title"
      className={cn("text-sm leading-none font-semibold", className)}
      {...props}
    />
  );
}

function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function PopoverFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-footer"
      className={cn("mt-4 flex items-center justify-end gap-2", className)}
      {...props}
    />
  );
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverClose,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverFooter,
  usePopoverContext,
  contentVariants as popoverContentVariants,
};
export type { PopoverProps, PopoverContentProps, PopoverSize };
