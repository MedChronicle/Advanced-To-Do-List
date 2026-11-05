"use client";

import * as React from "react";
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio@1.1.2";
import { ImageOffIcon } from "lucide-react@0.487.0";
import { cva } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

type RatioPreset =
  | "square"
  | "photo"
  | "video"
  | "wide"
  | "ultrawide"
  | "portrait"
  | "story"
  | "golden";

type Breakpoint = "base" | "sm" | "md" | "lg" | "xl";

type RatioValue = number | RatioPreset | `${number}/${number}` | `${number}:${number}`;

type ResponsiveRatio = Partial<Record<Breakpoint, RatioValue>>;

type AspectRatioInput = RatioValue | ResponsiveRatio;

const presets: Record<RatioPreset, number> = {
  square: 1,
  photo: 4 / 3,
  video: 16 / 9,
  wide: 2 / 1,
  ultrawide: 21 / 9,
  portrait: 3 / 4,
  story: 9 / 16,
  golden: 1.618,
};

const breakpointOrder: Breakpoint[] = ["base", "sm", "md", "lg", "xl"];

const breakpointWidths: Record<Exclude<Breakpoint, "base">, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

function parseRatio(value: RatioValue | undefined): number {
  if (value === undefined) return 1;
  if (typeof value === "number") return value > 0 ? value : 1;
  if (value in presets) return presets[value as RatioPreset];
  const parts = value.split(/[/:]/).map(Number);
  if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
    return parts[0] / parts[1];
  }
  return 1;
}

function isResponsive(input: AspectRatioInput): input is ResponsiveRatio {
  return typeof input === "object" && input !== null;
}

function currentBreakpoint(): Breakpoint {
  if (typeof window === "undefined") return "base";
  const width = window.innerWidth;
  if (width >= breakpointWidths.xl) return "xl";
  if (width >= breakpointWidths.lg) return "lg";
  if (width >= breakpointWidths.md) return "md";
  if (width >= breakpointWidths.sm) return "sm";
  return "base";
}

function useBreakpoint(enabled: boolean): Breakpoint {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>("base");

  React.useEffect(() => {
    if (!enabled) return;
    const update = () => setBreakpoint(currentBreakpoint());
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, [enabled]);

  return breakpoint;
}

function resolveRatio(input: AspectRatioInput, breakpoint: Breakpoint): number {
  if (!isResponsive(input)) return parseRatio(input);
  const activeIndex = breakpointOrder.indexOf(breakpoint);
  for (let i = activeIndex; i >= 0; i -= 1) {
    const candidate = input[breakpointOrder[i]];
    if (candidate !== undefined) return parseRatio(candidate);
  }
  return 1;
}

function useResolvedRatio(input: AspectRatioInput | undefined): number {
  const value = input ?? "square";
  const breakpoint = useBreakpoint(isResponsive(value));
  return resolveRatio(value, breakpoint);
}

const frameVariants = cva("overflow-hidden", {
  variants: {
    rounded: {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full",
    },
    fit: {
      cover: "[&>img]:size-full [&>img]:object-cover [&>video]:size-full [&>video]:object-cover",
      contain:
        "[&>img]:size-full [&>img]:object-contain [&>video]:size-full [&>video]:object-contain",
      fill: "[&>img]:size-full [&>img]:object-fill [&>video]:size-full [&>video]:object-fill",
      none: "",
    },
    bordered: {
      true: "border",
      false: "",
    },
    muted: {
      true: "bg-muted",
      false: "",
    },
  },
  defaultVariants: { rounded: "none", fit: "cover", bordered: false, muted: false },
});

interface AspectRatioProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root>,
    "ratio"
  > {
  ratio?: AspectRatioInput;
  fit?: "cover" | "contain" | "fill" | "none";
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  bordered?: boolean;
  muted?: boolean;
  loading?: boolean;
  overlay?: React.ReactNode;
  overlayClassName?: string;
  wrapperClassName?: string;
}

const AspectRatio = React.forwardRef<
  React.ElementRef<typeof AspectRatioPrimitive.Root>,
  AspectRatioProps
>(
  (
    {
      className,
      ratio = "square",
      fit = "cover",
      rounded = "none",
      bordered = false,
      muted = false,
      loading = false,
      overlay,
      overlayClassName,
      children,
      ...props
    },
    ref,
  ) => {
    const resolved = useResolvedRatio(ratio);

    return (
      <AspectRatioPrimitive.Root
        ref={ref}
        data-slot="aspect-ratio"
        data-loading={loading || undefined}
        ratio={resolved}
        className={cn(
          "relative",
          frameVariants({ rounded, fit, bordered, muted }),
          className,
        )}
        {...props}
      >
        {children}
        {loading && (
          <div
            aria-hidden
            data-slot="aspect-ratio-skeleton"
            className="bg-muted absolute inset-0 animate-pulse motion-reduce:animate-none"
          />
        )}
        {overlay && (
          <div
            data-slot="aspect-ratio-overlay"
            className={cn(
              "absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-3 text-sm text-white",
              overlayClassName,
            )}
          >
            {overlay}
          </div>
        )}
      </AspectRatioPrimitive.Root>
    );
  },
);
AspectRatio.displayName = "AspectRatio";

interface AspectRatioImageProps
  extends Omit<AspectRatioProps, "children" | "onError" | "onLoad">,
    Pick<
      React.ComponentPropsWithoutRef<"img">,
      "src" | "alt" | "srcSet" | "sizes" | "crossOrigin" | "referrerPolicy" | "decoding"
    > {
  fallbackSrc?: string;
  fallback?: React.ReactNode;
  position?: string;
  eager?: boolean;
  imageClassName?: string;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
}

const AspectRatioImage = React.forwardRef<
  React.ElementRef<typeof AspectRatioPrimitive.Root>,
  AspectRatioImageProps
>(
  (
    {
      src,
      alt,
      srcSet,
      sizes,
      crossOrigin,
      referrerPolicy,
      decoding = "async",
      fallbackSrc,
      fallback,
      position,
      eager = false,
      imageClassName,
      onLoad,
      onError,
      fit = "cover",
      muted = true,
      ...rest
    },
    ref,
  ) => {
    const imgRef = React.useRef<HTMLImageElement>(null);
    const [currentSrc, setCurrentSrc] = React.useState(src);
    const [loaded, setLoaded] = React.useState(false);
    const [failed, setFailed] = React.useState(false);

    React.useEffect(() => {
      setCurrentSrc(src);
      setLoaded(false);
      setFailed(false);
    }, [src]);

    React.useEffect(() => {
      const img = imgRef.current;
      if (img && img.complete && img.naturalWidth > 0) setLoaded(true);
    }, [currentSrc]);

    const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        return;
      }
      setFailed(true);
      onError?.(event);
    };

    return (
      <AspectRatio
        ref={ref}
        fit={fit}
        muted={muted}
        loading={!loaded && !failed}
        {...rest}
      >
        {failed ? (
          <div
            role="img"
            aria-label={alt}
            data-slot="aspect-ratio-fallback"
            className="text-muted-foreground absolute inset-0 flex items-center justify-center"
          >
            {fallback ?? <ImageOffIcon className="size-8 opacity-60" />}
          </div>
        ) : (
          <img
            ref={imgRef}
            src={currentSrc}
            alt={alt}
            srcSet={srcSet}
            sizes={sizes}
            crossOrigin={crossOrigin}
            referrerPolicy={referrerPolicy}
            decoding={decoding}
            loading={eager ? "eager" : "lazy"}
            style={position ? { objectPosition: position } : undefined}
            onLoad={(event) => {
              setLoaded(true);
              onLoad?.(event);
            }}
            onError={handleError}
            className={cn(
              "transition-opacity duration-500 motion-reduce:transition-none",
              loaded ? "opacity-100" : "opacity-0",
              imageClassName,
            )}
          />
        )}
      </AspectRatio>
    );
  },
);
AspectRatioImage.displayName = "AspectRatioImage";

interface AspectRatioEmbedProps
  extends Omit<AspectRatioProps, "children">,
    Pick<
      React.ComponentPropsWithoutRef<"iframe">,
      "src" | "allow" | "allowFullScreen" | "referrerPolicy" | "sandbox"
    > {
  title: string;
  iframeClassName?: string;
}

const AspectRatioEmbed = React.forwardRef<
  React.ElementRef<typeof AspectRatioPrimitive.Root>,
  AspectRatioEmbedProps
>(
  (
    {
      src,
      title,
      allow,
      allowFullScreen = true,
      referrerPolicy = "strict-origin-when-cross-origin",
      sandbox,
      iframeClassName,
      ratio = "video",
      rounded = "lg",
      fit = "none",
      muted = true,
      ...rest
    },
    ref,
  ) => {
    const [loaded, setLoaded] = React.useState(false);
    return (
      <AspectRatio
        ref={ref}
        ratio={ratio}
        rounded={rounded}
        fit={fit}
        muted={muted}
        loading={!loaded}
        {...rest}
      >
        <iframe
          src={src}
          title={title}
          allow={allow}
          allowFullScreen={allowFullScreen}
          referrerPolicy={referrerPolicy}
          sandbox={sandbox}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={cn("size-full border-0", iframeClassName)}
        />
      </AspectRatio>
    );
  },
);
AspectRatioEmbed.displayName = "AspectRatioEmbed";

export {
  AspectRatio,
  AspectRatioImage,
  AspectRatioEmbed,
  useResolvedRatio,
  parseRatio,
  presets as aspectRatioPresets,
};
export type {
  AspectRatioProps,
  AspectRatioImageProps,
  AspectRatioEmbedProps,
  AspectRatioInput,
  ResponsiveRatio,
  RatioPreset,
};
