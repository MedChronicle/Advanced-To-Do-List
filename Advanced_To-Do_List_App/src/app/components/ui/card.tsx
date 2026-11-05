"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  MinusIcon,
} from "lucide-react@0.487.0";

import { cn } from "./utils";

const cardVariants = cva(
  "group/card bg-card text-card-foreground flex gap-(--card-gap) rounded-xl border transition-[box-shadow,transform,border-color,background-color] duration-200",
  {
    variants: {
      variant: {
        default: "",
        outline: "bg-transparent",
        elevated: "shadow-md",
        ghost: "border-transparent bg-transparent",
        muted: "bg-muted/50 border-transparent",
        dashed: "border-dashed bg-transparent",
        gradient: "bg-gradient-to-br from-primary/10 via-card to-card",
        destructive: "border-destructive/40 bg-destructive/5",
      },
      density: {
        sm: "[--card-p:calc(var(--spacing)*4)] [--card-gap:calc(var(--spacing)*4)]",
        md: "[--card-p:calc(var(--spacing)*6)] [--card-gap:calc(var(--spacing)*6)]",
        lg: "[--card-p:calc(var(--spacing)*8)] [--card-gap:calc(var(--spacing)*8)]",
      },
      orientation: {
        vertical: "flex-col",
        horizontal: "flex-row items-stretch",
      },
      interactive: {
        true: "focus-visible:ring-ring/50 cursor-pointer outline-none hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-[3px] motion-reduce:hover:translate-y-0",
        false: "",
      },
      selected: {
        true: "border-primary ring-primary ring-2",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      density: "md",
      orientation: "vertical",
      interactive: false,
      selected: false,
    },
  },
);

interface CardProps
  extends React.ComponentPropsWithoutRef<"div">,
    Omit<VariantProps<typeof cardVariants>, "interactive" | "selected"> {
  asChild?: boolean;
  href?: string;
  interactive?: boolean;
  selected?: boolean;
  loading?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      density,
      orientation,
      interactive,
      selected,
      loading = false,
      asChild = false,
      href,
      children,
      ...props
    },
    ref,
  ) => {
    const isInteractive = interactive ?? Boolean(href);
    const classes = cn(
      cardVariants({
        variant,
        density,
        orientation,
        interactive: isInteractive,
        selected,
      }),
      loading && "relative",
      className,
    );

    const shared = {
      "data-slot": "card",
      "data-selected": selected || undefined,
      "data-orientation": orientation ?? "vertical",
      "aria-busy": loading || undefined,
      className: classes,
    };

    const overlay = loading ? (
      <div
        aria-hidden
        data-slot="card-loading"
        className="bg-background/60 absolute inset-0 z-10 animate-pulse rounded-[inherit] motion-reduce:animate-none"
      />
    ) : null;

    if (asChild) {
      return (
        <Slot ref={ref as React.Ref<HTMLElement>} {...shared} {...props}>
          {children}
        </Slot>
      );
    }

    if (href) {
      return (
        <a
          ref={ref as unknown as React.Ref<HTMLAnchorElement>}
          href={href}
          {...shared}
          {...(props as React.ComponentPropsWithoutRef<"a">)}
        >
          {children}
          {overlay}
        </a>
      );
    }

    return (
      <div ref={ref} {...shared} {...props}>
        {children}
        {overlay}
      </div>
    );
  },
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-header"
    className={cn(
      "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-(--card-p) pt-(--card-p) has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-(--card-p)",
      className,
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<"h4">
>(({ className, ...props }, ref) => (
  <h4
    ref={ref}
    data-slot="card-title"
    className={cn("leading-none", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="card-description"
    className={cn("text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardAction = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-action"
    className={cn(
      "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
      className,
    )}
    {...props}
  />
));
CardAction.displayName = "CardAction";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-content"
    className={cn("px-(--card-p) [&:last-child]:pb-(--card-p)", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-footer"
    className={cn(
      "flex items-center px-(--card-p) pb-(--card-p) [.border-t]:pt-(--card-p)",
      className,
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

interface CardMediaProps extends React.ComponentPropsWithoutRef<"div"> {
  src?: string;
  alt?: string;
  aspect?: string;
  imageClassName?: string;
}

const CardMedia = React.forwardRef<HTMLDivElement, CardMediaProps>(
  ({ className, src, alt = "", aspect = "aspect-video", imageClassName, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-media"
      className={cn(
        "bg-muted relative shrink-0 overflow-hidden first:rounded-t-[inherit] last:rounded-b-[inherit] group-data-[orientation=horizontal]/card:w-1/3 group-data-[orientation=horizontal]/card:max-w-xs group-data-[orientation=horizontal]/card:rounded-l-[inherit] group-data-[orientation=horizontal]/card:rounded-tr-none",
        aspect,
        "group-data-[orientation=horizontal]/card:aspect-auto",
        className,
      )}
      {...props}
    >
      {src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={cn("size-full object-cover", imageClassName)}
        />
      )}
      {children}
    </div>
  ),
);
CardMedia.displayName = "CardMedia";

const CardBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-body"
    className={cn("flex min-w-0 flex-1 flex-col gap-(--card-gap) py-(--card-p)", className)}
    {...props}
  />
));
CardBody.displayName = "CardBody";

interface CardIconProps extends React.ComponentPropsWithoutRef<"div"> {
  tone?: "default" | "primary" | "success" | "warning" | "destructive" | "info";
}

const iconTones: Record<NonNullable<CardIconProps["tone"]>, string> = {
  default: "bg-muted text-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

const CardIcon = React.forwardRef<HTMLDivElement, CardIconProps>(
  ({ className, tone = "default", ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-icon"
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg]:size-5",
        iconTones[tone],
        className,
      )}
      {...props}
    />
  ),
);
CardIcon.displayName = "CardIcon";

interface StatCardProps extends Omit<CardProps, "children" | "title"> {
  label: React.ReactNode;
  value: React.ReactNode;
  change?: number;
  changeLabel?: React.ReactNode;
  upIsGood?: boolean;
  icon?: React.ReactNode;
  iconTone?: CardIconProps["tone"];
  description?: React.ReactNode;
  formatChange?: (change: number) => string;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      label,
      value,
      change,
      changeLabel,
      upIsGood = true,
      icon,
      iconTone = "primary",
      description,
      formatChange,
      loading,
      ...props
    },
    ref,
  ) => {
    const direction =
      change === undefined || change === 0 ? "flat" : change > 0 ? "up" : "down";
    const good =
      direction === "flat" ? null : direction === "up" ? upIsGood : !upIsGood;
    const TrendIcon =
      direction === "up"
        ? ArrowUpRightIcon
        : direction === "down"
          ? ArrowDownRightIcon
          : MinusIcon;
    const changeText =
      change === undefined
        ? ""
        : (formatChange?.(change) ??
          `${change > 0 ? "+" : ""}${change.toFixed(1)}%`);

    return (
      <Card ref={ref} loading={loading} {...props}>
        <CardHeader>
          <CardDescription>{label}</CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums">
            {value}
          </CardTitle>
          {icon && (
            <CardAction>
              <CardIcon tone={iconTone}>{icon}</CardIcon>
            </CardAction>
          )}
        </CardHeader>
        {(change !== undefined || description) && (
          <CardFooter className="flex-col items-start gap-1 text-sm">
            {change !== undefined && (
              <div
                className={cn(
                  "inline-flex items-center gap-1 font-medium",
                  good === true && "text-emerald-600 dark:text-emerald-400",
                  good === false && "text-destructive",
                  good === null && "text-muted-foreground",
                )}
              >
                <TrendIcon className="size-4" aria-hidden />
                <span>{changeText}</span>
                {changeLabel && (
                  <span className="text-muted-foreground font-normal">
                    {changeLabel}
                  </span>
                )}
              </div>
            )}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </CardFooter>
        )}
      </Card>
    );
  },
);
StatCard.displayName = "StatCard";

interface CardSkeletonProps extends Omit<CardProps, "children"> {
  lines?: number;
  media?: boolean;
}

const CardSkeleton = React.forwardRef<HTMLDivElement, CardSkeletonProps>(
  ({ lines = 3, media = false, className, ...props }, ref) => (
    <Card
      ref={ref}
      aria-busy
      aria-live="polite"
      className={cn("animate-pulse motion-reduce:animate-none", className)}
      {...props}
    >
      {media && <div className="bg-muted aspect-video rounded-t-[inherit]" />}
      <div
        className={cn(
          "flex flex-col gap-3 px-(--card-p)",
          media ? "pb-(--card-p)" : "py-(--card-p)",
        )}
      >
        <div className="bg-muted h-4 w-1/3 rounded" />
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className="bg-muted h-3 rounded"
            style={{ width: index === lines - 1 ? "60%" : "100%" }}
          />
        ))}
      </div>
    </Card>
  ),
);
CardSkeleton.displayName = "CardSkeleton";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardMedia,
  CardBody,
  CardIcon,
  StatCard,
  CardSkeleton,
  cardVariants,
};
export type {
  CardProps,
  CardMediaProps,
  CardIconProps,
  StatCardProps,
  CardSkeletonProps,
};
