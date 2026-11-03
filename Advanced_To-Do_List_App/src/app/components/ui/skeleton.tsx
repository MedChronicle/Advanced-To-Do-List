import * as React from "react";

import { cn } from "./utils";

interface SkeletonProps extends React.ComponentProps<"div"> {
  /** Pulse animation. Set false for a static placeholder. Defaults to true. */
  animate?: boolean;
}

/**
 * Base placeholder block. Decorative by default (`aria-hidden`): announce
 * loading once on the surrounding region instead, e.g.
 * `<div aria-busy="true" aria-live="polite">…skeletons…</div>`.
 */
function Skeleton({ className, animate = true, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "bg-accent rounded-md",
        animate && "animate-pulse motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

/** Round placeholder, e.g. for avatars. `size` is in pixels. */
function SkeletonCircle({
  size = 40,
  className,
  style,
  ...props
}: SkeletonProps & { size?: number }) {
  return (
    <Skeleton
      data-slot="skeleton-circle"
      className={cn("shrink-0 rounded-full", className)}
      style={{ width: size, height: size, ...style }}
      {...props}
    />
  );
}

/** Several lines of text; the last line is shorter so it looks like a paragraph. */
function SkeletonText({
  lines = 3,
  className,
  lineClassName,
  animate = true,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  lines?: number;
  lineClassName?: string;
  animate?: boolean;
}) {
  return (
    <div
      data-slot="skeleton-text"
      aria-hidden="true"
      className={cn("space-y-2", className)}
      {...props}
    >
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          animate={animate}
          className={cn(
            "h-3.5",
            i === lines - 1 && lines > 1 ? "w-3/5" : "w-full",
            lineClassName,
          )}
        />
      ))}
    </div>
  );
}

/**
 * Ready-made placeholder that matches the TaskCard layout, so the task list
 * doesn't jump when data arrives:
 *
 *   {isLoading && Array.from({ length: 4 }, (_, i) => <TaskCardSkeleton key={i} />)}
 */
function TaskCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-slot="task-card-skeleton"
      aria-hidden="true"
      className={cn(
        "bg-card flex items-start gap-3 rounded-xl border p-4",
        className,
      )}
    >
      <Skeleton className="mt-1 size-5 shrink-0 rounded" />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <SkeletonText lines={2} />
        <div className="flex gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}

export { Skeleton, SkeletonCircle, SkeletonText, TaskCardSkeleton };
export type { SkeletonProps };
