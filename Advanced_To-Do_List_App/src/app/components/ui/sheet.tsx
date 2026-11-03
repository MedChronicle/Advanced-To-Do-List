"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog@1.1.6";
import { XIcon, GripVerticalIcon } from "lucide-react@0.487.0";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

type Side = "top" | "right" | "bottom" | "left";

function useComposedRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return React.useCallback(
    (node: T | null) => {
      refs.forEach((ref) => {
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs,
  );
}

const sheetVariants = cva(
  "bg-background fixed z-50 flex flex-col gap-4 shadow-xl outline-none transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 motion-reduce:animate-none motion-reduce:transition-none",
  {
    variants: {
      side: {
        right:
          "inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right pb-[env(safe-area-inset-bottom)]",
        left: "inset-y-0 left-0 h-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left pb-[env(safe-area-inset-bottom)]",
        top: "inset-x-0 top-0 h-auto border-b rounded-b-2xl data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top pt-[env(safe-area-inset-top)]",
        bottom:
          "inset-x-0 bottom-0 h-auto border-t rounded-t-2xl data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom pb-[env(safe-area-inset-bottom)]",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
        xl: "",
        full: "",
      },
    },
    compoundVariants: [
      { side: ["left", "right"], size: "sm", class: "w-3/4 sm:max-w-xs" },
      { side: ["left", "right"], size: "md", class: "w-3/4 sm:max-w-sm" },
      { side: ["left", "right"], size: "lg", class: "w-full sm:max-w-xl" },
      { side: ["left", "right"], size: "xl", class: "w-full sm:max-w-3xl" },
      { side: ["left", "right"], size: "full", class: "w-screen max-w-none" },
      { side: ["top", "bottom"], size: "sm", class: "max-h-[40vh]" },
      { side: ["top", "bottom"], size: "md", class: "max-h-[60vh]" },
      { side: ["top", "bottom"], size: "lg", class: "max-h-[80vh]" },
      { side: ["top", "bottom"], size: "xl", class: "max-h-[90vh]" },
      { side: ["top", "bottom"], size: "full", class: "h-screen max-h-none rounded-none" },
    ],
    defaultVariants: {
      side: "right",
      size: "md",
    },
  },
);

const overlayVariants = cva(
  "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none",
  {
    variants: {
      blur: {
        none: "",
        sm: "backdrop-blur-sm",
        md: "backdrop-blur-md",
      },
    },
    defaultVariants: { blur: "none" },
  },
);

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay> &
    VariantProps<typeof overlayVariants>
>(({ className, blur, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    data-slot="sheet-overlay"
    className={cn(overlayVariants({ blur }), className)}
    {...props}
  />
));
SheetOverlay.displayName = "SheetOverlay";

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    Omit<VariantProps<typeof sheetVariants>, "side"> {
  side?: Side;
  showCloseButton?: boolean;
  closeLabel?: string;
  hideOverlay?: boolean;
  overlayClassName?: string;
  overlayBlur?: "none" | "sm" | "md";
  resizable?: boolean;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  onResize?: (width: number) => void;
  swipeToDismiss?: boolean;
  dismissThreshold?: number;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(
  (
    {
      className,
      children,
      side = "right",
      size,
      showCloseButton = true,
      closeLabel = "Close",
      hideOverlay = false,
      overlayClassName,
      overlayBlur = "none",
      resizable = false,
      defaultWidth,
      minWidth = 280,
      maxWidth = 960,
      onResize,
      swipeToDismiss = true,
      dismissThreshold = 120,
      style,
      ...props
    },
    forwardedRef,
  ) => {
    const contentRef = React.useRef<HTMLDivElement>(null);
    const closeRef = React.useRef<HTMLButtonElement>(null);
    const composedRef = useComposedRefs(forwardedRef, contentRef);

    const [width, setWidth] = React.useState<number | undefined>(defaultWidth);
    const [dragY, setDragY] = React.useState(0);
    const [dragging, setDragging] = React.useState(false);

    const isHorizontal = side === "left" || side === "right";
    const canResize = resizable && isHorizontal;
    const canSwipe = swipeToDismiss && (side === "bottom" || side === "top");

    const clampWidth = React.useCallback(
      (value: number) => {
        const viewportMax = typeof window !== "undefined" ? window.innerWidth : maxWidth;
        return Math.min(Math.max(value, minWidth), Math.min(maxWidth, viewportMax));
      },
      [minWidth, maxWidth],
    );

    const handleResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!contentRef.current) return;
      event.preventDefault();
      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);
      const startX = event.clientX;
      const startWidth = contentRef.current.offsetWidth;
      setDragging(true);

      const onMove = (e: PointerEvent) => {
        const delta = side === "right" ? startX - e.clientX : e.clientX - startX;
        const next = clampWidth(startWidth + delta);
        setWidth(next);
        onResize?.(next);
      };
      const onUp = (e: PointerEvent) => {
        target.releasePointerCapture(e.pointerId);
        target.removeEventListener("pointermove", onMove);
        target.removeEventListener("pointerup", onUp);
        target.removeEventListener("pointercancel", onUp);
        setDragging(false);
      };
      target.addEventListener("pointermove", onMove);
      target.addEventListener("pointerup", onUp);
      target.addEventListener("pointercancel", onUp);
    };

    const handleResizeKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!contentRef.current) return;
      const step = event.shiftKey ? 48 : 16;
      const current = width ?? contentRef.current.offsetWidth;
      const grow = side === "right" ? "ArrowLeft" : "ArrowRight";
      const shrink = side === "right" ? "ArrowRight" : "ArrowLeft";
      if (event.key === grow || event.key === shrink) {
        event.preventDefault();
        const next = clampWidth(current + (event.key === grow ? step : -step));
        setWidth(next);
        onResize?.(next);
      }
    };

    const handleSwipeStart = (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);
      const startY = event.clientY;
      setDragging(true);

      const onMove = (e: PointerEvent) => {
        const raw = e.clientY - startY;
        const constrained = side === "bottom" ? Math.max(0, raw) : Math.min(0, raw);
        setDragY(constrained);
      };
      const onUp = (e: PointerEvent) => {
        target.releasePointerCapture(e.pointerId);
        target.removeEventListener("pointermove", onMove);
        target.removeEventListener("pointerup", onUp);
        target.removeEventListener("pointercancel", onUp);
        setDragging(false);
        const distance = Math.abs(e.clientY - startY);
        setDragY(0);
        if (distance > dismissThreshold) closeRef.current?.click();
      };
      target.addEventListener("pointermove", onMove);
      target.addEventListener("pointerup", onUp);
      target.addEventListener("pointercancel", onUp);
    };

    const mergedStyle: React.CSSProperties = {
      ...style,
      ...(canResize && width !== undefined
        ? { width, maxWidth: "100vw" }
        : null),
      ...(canSwipe && dragY !== 0 ? { transform: `translateY(${dragY}px)` } : null),
      ...(dragging ? { transition: "none", userSelect: "none" } : null),
    };

    return (
      <SheetPortal>
        {!hideOverlay && (
          <SheetOverlay blur={overlayBlur} className={overlayClassName} />
        )}
        <SheetPrimitive.Content
          ref={composedRef}
          data-slot="sheet-content"
          data-side={side}
          className={cn(sheetVariants({ side, size }), className)}
          style={mergedStyle}
          {...props}
        >
          {canSwipe && side === "bottom" && (
            <div
              data-slot="sheet-grabber"
              onPointerDown={handleSwipeStart}
              className="flex w-full cursor-grab touch-none justify-center pt-3 pb-1 active:cursor-grabbing"
            >
              <span className="bg-muted-foreground/30 h-1.5 w-12 rounded-full" />
            </div>
          )}

          {children}

          {canSwipe && side === "top" && (
            <div
              data-slot="sheet-grabber"
              onPointerDown={handleSwipeStart}
              className="flex w-full cursor-grab touch-none justify-center pt-1 pb-3 active:cursor-grabbing"
            >
              <span className="bg-muted-foreground/30 h-1.5 w-12 rounded-full" />
            </div>
          )}

          {canResize && (
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize panel"
              aria-valuemin={minWidth}
              aria-valuemax={maxWidth}
              aria-valuenow={width}
              tabIndex={0}
              onPointerDown={handleResizeStart}
              onKeyDown={handleResizeKey}
              data-slot="sheet-resize-handle"
              className={cn(
                "group absolute inset-y-0 z-10 flex w-3 cursor-col-resize touch-none items-center justify-center outline-none",
                side === "right" ? "-left-1.5" : "-right-1.5",
              )}
            >
              <span className="bg-border group-hover:bg-primary/60 group-focus-visible:bg-primary group-active:bg-primary h-full w-px transition-colors" />
              <GripVerticalIcon className="text-muted-foreground bg-background absolute size-4 rounded-sm border opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
            </div>
          )}

          {showCloseButton && (
            <SheetPrimitive.Close
              ref={closeRef}
              className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
            >
              <XIcon className="size-4" />
              <span className="sr-only">{closeLabel}</span>
            </SheetPrimitive.Close>
          )}

          {!showCloseButton && (
            <SheetPrimitive.Close ref={closeRef} className="sr-only" tabIndex={-1} aria-hidden>
              {closeLabel}
            </SheetPrimitive.Close>
          )}
        </SheetPrimitive.Content>
      </SheetPortal>
    );
  },
);
SheetContent.displayName = "SheetContent";

function SheetHeader({
  className,
  sticky = false,
  ...props
}: React.ComponentProps<"div"> & { sticky?: boolean }) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        "flex flex-col gap-1.5 p-4",
        sticky && "bg-background/80 sticky top-0 z-10 border-b backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}

function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-body"
      className={cn(
        "flex-1 overflow-y-auto overscroll-contain px-4 [scrollbar-gutter:stable]",
        className,
      )}
      {...props}
    />
  );
}

function SheetFooter({
  className,
  sticky = false,
  ...props
}: React.ComponentProps<"div"> & { sticky?: boolean }) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "mt-auto flex flex-col gap-2 p-4",
        sticky && "bg-background/80 sticky bottom-0 z-10 border-t backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    data-slot="sheet-title"
    className={cn("text-foreground font-semibold", className)}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    data-slot="sheet-description"
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
));
SheetDescription.displayName = "SheetDescription";

function useControllableSheet(initial = false) {
  const [open, setOpen] = React.useState(initial);
  const openSheet = React.useCallback(() => setOpen(true), []);
  const closeSheet = React.useCallback(() => setOpen(false), []);
  const toggleSheet = React.useCallback(() => setOpen((v) => !v), []);
  return { open, setOpen, openSheet, closeSheet, toggleSheet };
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  useControllableSheet,
  sheetVariants,
};
export type { SheetContentProps };
