"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area@1.2.3";
import { ArrowUpIcon } from "lucide-react@0.487.0";
import { cva } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

type ScrollOrientation = "vertical" | "horizontal" | "both";
type ScrollBarSize = "thin" | "default" | "thick";

interface ScrollState {
  top: number;
  left: number;
  progressY: number;
  progressX: number;
  canScrollUp: boolean;
  canScrollDown: boolean;
  canScrollLeft: boolean;
  canScrollRight: boolean;
}

const initialScrollState: ScrollState = {
  top: 0,
  left: 0,
  progressY: 0,
  progressX: 0,
  canScrollUp: false,
  canScrollDown: false,
  canScrollLeft: false,
  canScrollRight: false,
};

const scrollBarVariants = cva(
  "flex touch-none p-px transition-[colors,opacity] select-none",
  {
    variants: {
      orientation: {
        vertical: "h-full border-l border-l-transparent",
        horizontal: "flex-col border-t border-t-transparent",
      },
      size: {
        thin: "",
        default: "",
        thick: "",
      },
    },
    compoundVariants: [
      { orientation: "vertical", size: "thin", class: "w-1.5" },
      { orientation: "vertical", size: "default", class: "w-2.5" },
      { orientation: "vertical", size: "thick", class: "w-3.5" },
      { orientation: "horizontal", size: "thin", class: "h-1.5" },
      { orientation: "horizontal", size: "default", class: "h-2.5" },
      { orientation: "horizontal", size: "thick", class: "h-3.5" },
    ],
    defaultVariants: { orientation: "vertical", size: "default" },
  },
);

interface ScrollBarProps
  extends React.ComponentPropsWithoutRef<
    typeof ScrollAreaPrimitive.ScrollAreaScrollbar
  > {
  size?: ScrollBarSize;
  thumbClassName?: string;
}

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  ScrollBarProps
>(
  (
    { className, thumbClassName, orientation = "vertical", size = "default", ...props },
    ref,
  ) => (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(scrollBarVariants({ orientation, size }), className)}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className={cn(
          "bg-border hover:bg-muted-foreground/50 active:bg-muted-foreground/70 relative flex-1 rounded-full transition-colors",
          thumbClassName,
        )}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  ),
);
ScrollBar.displayName = "ScrollBar";

interface ScrollAreaProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  orientation?: ScrollOrientation;
  scrollbarSize?: ScrollBarSize;
  scrollbarClassName?: string;
  viewportClassName?: string;
  viewportRef?: React.Ref<HTMLDivElement>;
  fadeEdges?: boolean;
  fadeSize?: number;
  showScrollToTop?: boolean;
  scrollToTopThreshold?: number;
  scrollToTopLabel?: string;
  onScrollChange?: (state: ScrollState) => void;
}

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(
  (
    {
      className,
      children,
      orientation = "vertical",
      scrollbarSize = "default",
      scrollbarClassName,
      viewportClassName,
      viewportRef,
      fadeEdges = false,
      fadeSize = 24,
      showScrollToTop = false,
      scrollToTopThreshold = 240,
      scrollToTopLabel = "Scroll to top",
      onScrollChange,
      ...props
    },
    ref,
  ) => {
    const innerViewportRef = React.useRef<HTMLDivElement | null>(null);
    const [state, setState] = React.useState<ScrollState>(initialScrollState);
    const onScrollChangeRef = React.useRef(onScrollChange);
    onScrollChangeRef.current = onScrollChange;

    const setViewportRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        innerViewportRef.current = node;
        if (typeof viewportRef === "function") viewportRef(node);
        else if (viewportRef)
          (viewportRef as React.MutableRefObject<HTMLDivElement | null>).current =
            node;
      },
      [viewportRef],
    );

    const measure = React.useCallback(() => {
      const el = innerViewportRef.current;
      if (!el) return;
      const maxY = el.scrollHeight - el.clientHeight;
      const maxX = el.scrollWidth - el.clientWidth;
      const next: ScrollState = {
        top: el.scrollTop,
        left: el.scrollLeft,
        progressY: maxY > 0 ? el.scrollTop / maxY : 0,
        progressX: maxX > 0 ? el.scrollLeft / maxX : 0,
        canScrollUp: el.scrollTop > 1,
        canScrollDown: el.scrollTop < maxY - 1,
        canScrollLeft: el.scrollLeft > 1,
        canScrollRight: el.scrollLeft < maxX - 1,
      };
      setState((prev) => {
        const same =
          prev.top === next.top &&
          prev.left === next.left &&
          prev.canScrollUp === next.canScrollUp &&
          prev.canScrollDown === next.canScrollDown &&
          prev.canScrollLeft === next.canScrollLeft &&
          prev.canScrollRight === next.canScrollRight;
        return same ? prev : next;
      });
      onScrollChangeRef.current?.(next);
    }, []);

    React.useEffect(() => {
      const el = innerViewportRef.current;
      if (!el) return;
      measure();
      el.addEventListener("scroll", measure, { passive: true });
      const observer =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(measure)
          : null;
      observer?.observe(el);
      Array.from(el.children).forEach((child) => observer?.observe(child));
      return () => {
        el.removeEventListener("scroll", measure);
        observer?.disconnect();
      };
    }, [measure]);

    const scrollToTop = () => {
      const el = innerViewportRef.current;
      if (!el) return;
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    };

    const showVertical = orientation === "vertical" || orientation === "both";
    const showHorizontal =
      orientation === "horizontal" || orientation === "both";

    const fadeStyle = (size: number): React.CSSProperties => ({
      ["--fade-size" as string]: `${size}px`,
    });

    return (
      <ScrollAreaPrimitive.Root
        ref={ref}
        data-slot="scroll-area"
        data-orientation={orientation}
        className={cn("relative", className)}
        {...props}
      >
        <ScrollAreaPrimitive.Viewport
          ref={setViewportRef}
          data-slot="scroll-area-viewport"
          className={cn(
            "focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1",
            viewportClassName,
          )}
        >
          {children}
        </ScrollAreaPrimitive.Viewport>

        {fadeEdges && showVertical && (
          <>
            <div
              aria-hidden
              data-slot="scroll-area-fade-top"
              style={fadeStyle(fadeSize)}
              className={cn(
                "from-background pointer-events-none absolute inset-x-0 top-0 z-10 h-[var(--fade-size)] bg-gradient-to-b to-transparent transition-opacity duration-200",
                state.canScrollUp ? "opacity-100" : "opacity-0",
              )}
            />
            <div
              aria-hidden
              data-slot="scroll-area-fade-bottom"
              style={fadeStyle(fadeSize)}
              className={cn(
                "from-background pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[var(--fade-size)] bg-gradient-to-t to-transparent transition-opacity duration-200",
                state.canScrollDown ? "opacity-100" : "opacity-0",
              )}
            />
          </>
        )}

        {fadeEdges && showHorizontal && (
          <>
            <div
              aria-hidden
              data-slot="scroll-area-fade-left"
              style={fadeStyle(fadeSize)}
              className={cn(
                "from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-[var(--fade-size)] bg-gradient-to-r to-transparent transition-opacity duration-200",
                state.canScrollLeft ? "opacity-100" : "opacity-0",
              )}
            />
            <div
              aria-hidden
              data-slot="scroll-area-fade-right"
              style={fadeStyle(fadeSize)}
              className={cn(
                "from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-[var(--fade-size)] bg-gradient-to-l to-transparent transition-opacity duration-200",
                state.canScrollRight ? "opacity-100" : "opacity-0",
              )}
            />
          </>
        )}

        {showVertical && (
          <ScrollBar
            orientation="vertical"
            size={scrollbarSize}
            className={scrollbarClassName}
          />
        )}
        {showHorizontal && (
          <ScrollBar
            orientation="horizontal"
            size={scrollbarSize}
            className={scrollbarClassName}
          />
        )}
        <ScrollAreaPrimitive.Corner />

        {showScrollToTop && showVertical && (
          <button
            type="button"
            data-slot="scroll-area-to-top"
            aria-label={scrollToTopLabel}
            tabIndex={state.top > scrollToTopThreshold ? 0 : -1}
            onClick={scrollToTop}
            className={cn(
              "bg-background text-foreground focus-visible:ring-ring/50 absolute right-4 bottom-4 z-20 inline-flex size-9 items-center justify-center rounded-full border shadow-md transition-all duration-200 outline-none hover:bg-accent focus-visible:ring-[3px]",
              state.top > scrollToTopThreshold
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0",
            )}
          >
            <ArrowUpIcon className="size-4" />
          </button>
        )}
      </ScrollAreaPrimitive.Root>
    );
  },
);
ScrollArea.displayName = "ScrollArea";

export { ScrollArea, ScrollBar, scrollBarVariants };
export type { ScrollAreaProps, ScrollBarProps, ScrollState, ScrollOrientation };
