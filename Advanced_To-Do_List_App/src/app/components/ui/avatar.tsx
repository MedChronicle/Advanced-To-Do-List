"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar@1.1.3";
import { UserIcon } from "lucide-react@0.487.0";
import { cva } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
type AvatarShape = "circle" | "rounded" | "square";
type AvatarStatus = "online" | "offline" | "busy" | "away";

interface AvatarContextValue {
  size: AvatarSize;
  shape: AvatarShape;
}

const AvatarContext = React.createContext<AvatarContextValue>({
  size: "md",
  shape: "circle",
});

interface AvatarGroupContextValue extends AvatarContextValue {
  ringed: boolean;
}

const AvatarGroupContext = React.createContext<AvatarGroupContextValue | null>(
  null,
);

const sizeClasses: Record<AvatarSize, string> = {
  xs: "size-6",
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
  xl: "size-16",
  "2xl": "size-24",
};

const textClasses: Record<AvatarSize, string> = {
  xs: "text-[10px]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-xl",
  "2xl": "text-3xl",
};

const overlapClasses: Record<AvatarSize, string> = {
  xs: "-space-x-1.5",
  sm: "-space-x-2",
  md: "-space-x-2.5",
  lg: "-space-x-3",
  xl: "-space-x-4",
  "2xl": "-space-x-6",
};

const shapeClasses: Record<AvatarShape, string> = {
  circle: "rounded-full",
  rounded: "rounded-lg",
  square: "rounded-none",
};

const statusSizeClasses: Record<AvatarSize, string> = {
  xs: "size-1.5",
  sm: "size-2",
  md: "size-2.5",
  lg: "size-3",
  xl: "size-4",
  "2xl": "size-5",
};

const statusVariants = cva(
  "ring-background absolute right-0 bottom-0 block rounded-full ring-2",
  {
    variants: {
      status: {
        online: "bg-emerald-500",
        offline: "bg-muted-foreground/60",
        busy: "bg-destructive",
        away: "bg-amber-500",
      },
    },
    defaultVariants: { status: "online" },
  },
);

const statusLabels: Record<AvatarStatus, string> = {
  online: "Online",
  offline: "Offline",
  busy: "Busy",
  away: "Away",
};

const palette = [
  "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "bg-teal-500/15 text-teal-700 dark:text-teal-300",
  "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
];

function getInitials(name: string, max = 2) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return Array.from(words[0]).slice(0, max).join("").toUpperCase();
  const first = Array.from(words[0])[0] ?? "";
  const last = Array.from(words[words.length - 1])[0] ?? "";
  const initials = max >= 2 ? first + last : first;
  return initials.toUpperCase();
}

function colorForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return palette[Math.abs(hash) % palette.length];
}

interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: AvatarStatus;
  statusLabel?: string;
  badge?: React.ReactNode;
  ring?: boolean;
  wrapperClassName?: string;
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(
  (
    {
      className,
      wrapperClassName,
      size: sizeProp,
      shape: shapeProp,
      status,
      statusLabel,
      badge,
      ring,
      ...props
    },
    ref,
  ) => {
    const group = React.useContext(AvatarGroupContext);
    const size = sizeProp ?? group?.size ?? "md";
    const shape = shapeProp ?? group?.shape ?? "circle";
    const ringed = ring ?? group?.ringed ?? false;
    const value = React.useMemo(() => ({ size, shape }), [size, shape]);

    const root = (
      <AvatarContext.Provider value={value}>
        <AvatarPrimitive.Root
          ref={ref}
          data-slot="avatar"
          data-size={size}
          data-shape={shape}
          className={cn(
            "relative flex shrink-0 overflow-hidden",
            sizeClasses[size],
            shapeClasses[shape],
            ringed && "ring-background ring-2",
            className,
          )}
          {...props}
        />
      </AvatarContext.Provider>
    );

    if (!status && !badge) return root;

    return (
      <span
        data-slot="avatar-wrapper"
        className={cn("relative inline-flex shrink-0", wrapperClassName)}
      >
        {root}
        {status && (
          <span
            data-slot="avatar-status"
            data-status={status}
            className={cn(statusVariants({ status }), statusSizeClasses[size])}
          >
            <span className="sr-only">{statusLabel ?? statusLabels[status]}</span>
          </span>
        )}
        {badge && (
          <span
            data-slot="avatar-badge"
            className="bg-destructive text-destructive-foreground ring-background absolute -top-1 -right-1 flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-4 font-semibold ring-2"
          >
            {badge}
          </span>
        )}
      </span>
    );
  },
);
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    data-slot="avatar-image"
    className={cn("aspect-square size-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";

interface AvatarFallbackProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  name?: string;
  colorize?: boolean;
  maxInitials?: number;
  icon?: React.ReactNode;
}

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(
  (
    {
      className,
      children,
      name,
      colorize = false,
      maxInitials = 2,
      icon,
      ...props
    },
    ref,
  ) => {
    const { size, shape } = React.useContext(AvatarContext);
    const initials = name ? getInitials(name, maxInitials) : "";

    return (
      <AvatarPrimitive.Fallback
        ref={ref}
        data-slot="avatar-fallback"
        className={cn(
          "flex size-full items-center justify-center font-medium select-none",
          shapeClasses[shape],
          textClasses[size],
          colorize && name ? colorForName(name) : "bg-muted",
          className,
        )}
        {...props}
      >
        {children ??
          (initials ? (
            <span aria-hidden={Boolean(name)}>{initials}</span>
          ) : (
            (icon ?? <UserIcon className="size-1/2 opacity-60" />)
          ))}
        {!children && name && <span className="sr-only">{name}</span>}
      </AvatarPrimitive.Fallback>
    );
  },
);
AvatarFallback.displayName = "AvatarFallback";

interface AvatarCountProps extends React.ComponentPropsWithoutRef<"span"> {
  count: number;
  size?: AvatarSize;
  shape?: AvatarShape;
}

const AvatarCount = React.forwardRef<HTMLSpanElement, AvatarCountProps>(
  ({ className, count, size: sizeProp, shape: shapeProp, ...props }, ref) => {
    const group = React.useContext(AvatarGroupContext);
    const size = sizeProp ?? group?.size ?? "md";
    const shape = shapeProp ?? group?.shape ?? "circle";
    return (
      <span
        ref={ref}
        data-slot="avatar-count"
        aria-label={`${count} more`}
        className={cn(
          "bg-muted text-muted-foreground flex shrink-0 items-center justify-center font-medium tabular-nums select-none",
          sizeClasses[size],
          shapeClasses[shape],
          textClasses[size],
          group?.ringed && "ring-background ring-2",
          className,
        )}
        {...props}
      >
        +{count}
      </span>
    );
  },
);
AvatarCount.displayName = "AvatarCount";

interface AvatarGroupProps extends React.ComponentPropsWithoutRef<"div"> {
  size?: AvatarSize;
  shape?: AvatarShape;
  max?: number;
  ringed?: boolean;
  stack?: "start" | "end";
  total?: number;
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    {
      className,
      children,
      size = "md",
      shape = "circle",
      max,
      ringed = true,
      stack = "end",
      total,
      ...props
    },
    ref,
  ) => {
    const items = React.Children.toArray(children);
    const limit = max !== undefined && max > 0 ? max : items.length;
    const visible = items.slice(0, limit);
    const hidden = Math.max((total ?? items.length) - visible.length, 0);
    const value = React.useMemo(
      () => ({ size, shape, ringed }),
      [size, shape, ringed],
    );
    const count = visible.length + (hidden > 0 ? 1 : 0);

    return (
      <AvatarGroupContext.Provider value={value}>
        <div
          ref={ref}
          role="group"
          data-slot="avatar-group"
          className={cn("flex items-center", overlapClasses[size], className)}
          {...props}
        >
          {visible.map((child, index) => (
            <span
              key={index}
              className="inline-flex"
              style={{ zIndex: stack === "end" ? index + 1 : count - index }}
            >
              {child}
            </span>
          ))}
          {hidden > 0 && (
            <span
              className="inline-flex"
              style={{ zIndex: stack === "end" ? count : 0 }}
            >
              <AvatarCount count={hidden} />
            </span>
          )}
        </div>
      </AvatarGroupContext.Provider>
    );
  },
);
AvatarGroup.displayName = "AvatarGroup";

interface AvatarUserProps extends Omit<AvatarProps, "children"> {
  name: string;
  src?: string;
  alt?: string;
  description?: React.ReactNode;
  colorize?: boolean;
  textClassName?: string;
  reverse?: boolean;
}

const AvatarUser = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarUserProps
>(
  (
    {
      name,
      src,
      alt,
      description,
      colorize = true,
      textClassName,
      reverse = false,
      size = "md",
      ...props
    },
    ref,
  ) => {
    const avatar = (
      <Avatar ref={ref} size={size} {...props}>
        {src && <AvatarImage src={src} alt={alt ?? name} />}
        <AvatarFallback name={name} colorize={colorize} />
      </Avatar>
    );

    if (!description) return avatar;

    return (
      <div
        data-slot="avatar-user"
        className={cn("flex items-center gap-3", reverse && "flex-row-reverse")}
      >
        {avatar}
        <div className={cn("flex min-w-0 flex-col", textClassName)}>
          <span className="truncate text-sm leading-tight font-medium">
            {name}
          </span>
          <span className="text-muted-foreground truncate text-xs">
            {description}
          </span>
        </div>
      </div>
    );
  },
);
AvatarUser.displayName = "AvatarUser";

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarCount,
  AvatarUser,
  getInitials,
  colorForName,
};
export type {
  AvatarProps,
  AvatarFallbackProps,
  AvatarGroupProps,
  AvatarCountProps,
  AvatarUserProps,
  AvatarSize,
  AvatarShape,
  AvatarStatus,
};
