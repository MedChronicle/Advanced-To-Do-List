"use client";

import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react@8.6.0";
import { ArrowLeft, ArrowRight, PauseIcon, PlayIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";
import { Button } from "./button";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

interface AutoplayOptions {
  delay?: number;
  pauseOnHover?: boolean;
  stopOnInteraction?: boolean;
}

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
  autoplay?: boolean | AutoplayOptions;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedIndex: number;
  scrollSnaps: number[];
  autoplayEnabled: boolean;
  playing: boolean;
  togglePlay: () => void;
} & Pick<CarouselProps, "opts" | "plugins" | "orientation" | "setApi">;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

interface CarouselComponentProps
  extends React.ComponentPropsWithoutRef<"div">,
    CarouselProps {}

const Carousel = React.forwardRef<HTMLDivElement, CarouselComponentProps>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      autoplay,
      className,
      children,
      onKeyDownCapture,
      onPointerEnter,
      onPointerLeave,
      onFocusCapture,
      onBlurCapture,
      onPointerDown,
      ...props
    },
    ref,
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins,
    );
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);
    const [hoverPaused, setHoverPaused] = React.useState(false);
    const [userPaused, setUserPaused] = React.useState(false);
    const reducedMotion = useReducedMotion();

    const autoplayEnabled = Boolean(autoplay);
    const autoplayConfig: Required<AutoplayOptions> = {
      delay: typeof autoplay === "object" ? (autoplay.delay ?? 4000) : 4000,
      pauseOnHover:
        typeof autoplay === "object" ? (autoplay.pauseOnHover ?? true) : true,
      stopOnInteraction:
        typeof autoplay === "object"
          ? (autoplay.stopOnInteraction ?? false)
          : false,
    };

    const playing =
      autoplayEnabled && !userPaused && !hoverPaused && !reducedMotion;

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) return;
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
      setSelectedIndex(api.selectedScrollSnap());
      setScrollSnaps(api.scrollSnapList());
    }, []);

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev();
    }, [api]);

    const scrollNext = React.useCallback(() => {
      api?.scrollNext();
    }, [api]);

    const scrollTo = React.useCallback(
      (index: number) => {
        api?.scrollTo(index);
      },
      [api],
    );

    const togglePlay = React.useCallback(() => {
      setUserPaused((value) => !value);
    }, []);

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
        const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
        if (event.key === prevKey) {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === nextKey) {
          event.preventDefault();
          scrollNext();
        } else if (event.key === "Home") {
          event.preventDefault();
          scrollTo(0);
        } else if (event.key === "End") {
          event.preventDefault();
          scrollTo(Math.max(scrollSnaps.length - 1, 0));
        }
      },
      [orientation, scrollPrev, scrollNext, scrollTo, scrollSnaps.length],
    );

    React.useEffect(() => {
      if (!api || !setApi) return;
      setApi(api);
    }, [api, setApi]);

    React.useEffect(() => {
      if (!api) return;
      onSelect(api);
      api.on("reInit", onSelect);
      api.on("select", onSelect);

      return () => {
        api.off("reInit", onSelect);
        api.off("select", onSelect);
      };
    }, [api, onSelect]);

    React.useEffect(() => {
      if (!api || !playing) return;
      const timer = window.setInterval(() => {
        if (typeof document !== "undefined" && document.hidden) return;
        if (api.canScrollNext()) api.scrollNext();
        else api.scrollTo(0);
      }, autoplayConfig.delay);
      return () => window.clearInterval(timer);
    }, [api, playing, autoplayConfig.delay]);

    const value = React.useMemo<CarouselContextProps>(
      () => ({
        carouselRef,
        api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        scrollTo,
        canScrollPrev,
        canScrollNext,
        selectedIndex,
        scrollSnaps,
        autoplayEnabled,
        playing,
        togglePlay,
      }),
      [
        carouselRef,
        api,
        opts,
        orientation,
        scrollPrev,
        scrollNext,
        scrollTo,
        canScrollPrev,
        canScrollNext,
        selectedIndex,
        scrollSnaps,
        autoplayEnabled,
        playing,
        togglePlay,
      ],
    );

    return (
      <CarouselContext.Provider value={value}>
        <div
          ref={ref}
          onKeyDownCapture={(event) => {
            handleKeyDown(event);
            onKeyDownCapture?.(event);
          }}
          onPointerEnter={(event) => {
            if (autoplayConfig.pauseOnHover) setHoverPaused(true);
            onPointerEnter?.(event);
          }}
          onPointerLeave={(event) => {
            setHoverPaused(false);
            onPointerLeave?.(event);
          }}
          onFocusCapture={(event) => {
            if (autoplayEnabled) setHoverPaused(true);
            onFocusCapture?.(event);
          }}
          onBlurCapture={(event) => {
            if (autoplayEnabled) setHoverPaused(false);
            onBlurCapture?.(event);
          }}
          onPointerDown={(event) => {
            if (autoplayEnabled && autoplayConfig.stopOnInteraction) {
              setUserPaused(true);
            }
            onPointerDown?.(event);
          }}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          aria-live={playing ? "off" : "polite"}
          data-slot="carousel"
          data-playing={playing || undefined}
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = "Carousel";

interface CarouselContentProps extends React.ComponentPropsWithoutRef<"div"> {
  viewportClassName?: string;
  grabCursor?: boolean;
}

const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ className, viewportClassName, grabCursor = true, ...props }, ref) => {
    const { carouselRef, orientation } = useCarousel();

    return (
      <div
        ref={carouselRef}
        className={cn(
          "overflow-hidden",
          grabCursor && "cursor-grab active:cursor-grabbing",
          viewportClassName,
        )}
        data-slot="carousel-content"
      >
        <div
          ref={ref}
          className={cn(
            "flex",
            orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, forwardedRef) => {
  const { orientation, selectedIndex } = useCarousel();
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = React.useState<{ index: number; total: number }>({
    index: -1,
    total: 0,
  });

  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
      }
    },
    [forwardedRef],
  );

  React.useEffect(() => {
    const node = innerRef.current;
    const parent = node?.parentElement;
    if (!node || !parent) return;
    const measure = () => {
      const siblings = Array.from(parent.children);
      setPosition({ index: siblings.indexOf(node), total: siblings.length });
    };
    measure();
    const observer =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(measure)
        : null;
    observer?.observe(parent, { childList: true });
    return () => observer?.disconnect();
  }, []);

  return (
    <div
      ref={setRef}
      role="group"
      aria-roledescription="slide"
      aria-label={
        position.index >= 0
          ? `${position.index + 1} of ${position.total}`
          : undefined
      }
      data-slot="carousel-item"
      data-active={position.index === selectedIndex || undefined}
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = "CarouselItem";

interface CarouselArrowProps extends React.ComponentProps<typeof Button> {
  inset?: boolean;
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  inset = false,
  ...props
}: CarouselArrowProps) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? cn("top-1/2 -translate-y-1/2", inset ? "left-2" : "-left-12")
          : cn(
              "left-1/2 -translate-x-1/2 rotate-90",
              inset ? "top-2" : "-top-12",
            ),
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  inset = false,
  ...props
}: CarouselArrowProps) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? cn("top-1/2 -translate-y-1/2", inset ? "right-2" : "-right-12")
          : cn(
              "left-1/2 -translate-x-1/2 rotate-90",
              inset ? "bottom-2" : "-bottom-12",
            ),
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

interface CarouselDotsProps extends React.ComponentPropsWithoutRef<"div"> {
  variant?: "dots" | "bars";
  dotClassName?: string;
}

const CarouselDots = React.forwardRef<HTMLDivElement, CarouselDotsProps>(
  ({ className, variant = "dots", dotClassName, ...props }, ref) => {
    const { scrollSnaps, selectedIndex, scrollTo, orientation } = useCarousel();

    if (scrollSnaps.length <= 1) return null;

    return (
      <div
        ref={ref}
        role="tablist"
        aria-label="Slides"
        data-slot="carousel-dots"
        className={cn(
          "flex items-center justify-center gap-2",
          orientation === "vertical" && "absolute top-1/2 -right-6 flex-col -translate-y-1/2",
          className,
        )}
        {...props}
      >
        {scrollSnaps.map((_, index) => {
          const selected = index === selectedIndex;
          return (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={`Go to slide ${index + 1}`}
              data-state={selected ? "active" : "inactive"}
              onClick={() => scrollTo(index)}
              className={cn(
                "focus-visible:ring-ring/50 rounded-full outline-none transition-all duration-300 focus-visible:ring-[3px] motion-reduce:transition-none",
                variant === "dots"
                  ? "size-2"
                  : orientation === "horizontal"
                    ? "h-1.5"
                    : "w-1.5",
                variant === "bars" &&
                  (selected
                    ? orientation === "horizontal"
                      ? "w-8"
                      : "h-8"
                    : orientation === "horizontal"
                      ? "w-4"
                      : "h-4"),
                selected ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
                dotClassName,
              )}
            />
          );
        })}
      </div>
    );
  },
);
CarouselDots.displayName = "CarouselDots";

interface CarouselCounterProps extends React.ComponentPropsWithoutRef<"div"> {
  format?: (current: number, total: number) => React.ReactNode;
}

const CarouselCounter = React.forwardRef<HTMLDivElement, CarouselCounterProps>(
  ({ className, format, ...props }, ref) => {
    const { selectedIndex, scrollSnaps } = useCarousel();
    const total = scrollSnaps.length;
    if (total === 0) return null;
    return (
      <div
        ref={ref}
        data-slot="carousel-counter"
        className={cn("text-muted-foreground text-sm tabular-nums", className)}
        {...props}
      >
        {format ? format(selectedIndex + 1, total) : `${selectedIndex + 1} / ${total}`}
      </div>
    );
  },
);
CarouselCounter.displayName = "CarouselCounter";

const CarouselProgress = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { barClassName?: string }
>(({ className, barClassName, ...props }, ref) => {
  const { api } = useCarousel();
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    const update = () => setProgress(Math.min(Math.max(api.scrollProgress(), 0), 1));
    update();
    api.on("scroll", update);
    api.on("reInit", update);
    return () => {
      api.off("scroll", update);
      api.off("reInit", update);
    };
  }, [api]);

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-label="Carousel progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      data-slot="carousel-progress"
      className={cn("bg-muted h-1 w-full overflow-hidden rounded-full", className)}
      {...props}
    >
      <div
        className={cn("bg-primary h-full rounded-full transition-[width] duration-150", barClassName)}
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
});
CarouselProgress.displayName = "CarouselProgress";

function CarouselPlayPause({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { autoplayEnabled, playing, togglePlay } = useCarousel();

  if (!autoplayEnabled) return null;

  return (
    <Button
      data-slot="carousel-play-pause"
      variant={variant}
      size={size}
      aria-pressed={!playing}
      className={cn("size-8 rounded-full", className)}
      onClick={togglePlay}
      {...props}
    >
      {playing ? <PauseIcon /> : <PlayIcon />}
      <span className="sr-only">{playing ? "Pause autoplay" : "Start autoplay"}</span>
    </Button>
  );
}

export {
  type CarouselApi,
  type CarouselProps,
  type AutoplayOptions,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  CarouselCounter,
  CarouselProgress,
  CarouselPlayPause,
  useCarousel,
};
