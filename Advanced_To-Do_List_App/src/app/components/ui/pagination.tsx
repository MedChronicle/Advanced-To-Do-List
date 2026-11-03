import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  MoreHorizontalIcon,
} from "lucide-react@0.487.0";

import { cn } from "./utils";
import { Button, buttonVariants } from "./button";

type ButtonVariant = React.ComponentProps<typeof Button>["variant"];
type PaginationItemValue = number | "start-ellipsis" | "end-ellipsis";

function range(start: number, end: number) {
  if (end < start) return [];
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

interface UsePaginationOptions {
  page: number;
  totalPages: number;
  siblingCount?: number;
  boundaryCount?: number;
}

function usePagination({
  page,
  totalPages,
  siblingCount = 1,
  boundaryCount = 1,
}: UsePaginationOptions): PaginationItemValue[] {
  return React.useMemo(() => {
    const total = Math.max(0, Math.floor(totalPages));
    if (total === 0) return [];

    const startPages = range(1, Math.min(boundaryCount, total));
    const endPages = range(
      Math.max(total - boundaryCount + 1, boundaryCount + 1),
      total,
    );

    const siblingsStart = Math.max(
      Math.min(page - siblingCount, total - boundaryCount - siblingCount * 2 - 1),
      boundaryCount + 2,
    );
    const siblingsEnd = Math.min(
      Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
      endPages.length > 0 ? endPages[0] - 2 : total - 1,
    );

    const startGap: PaginationItemValue[] =
      siblingsStart > boundaryCount + 2
        ? ["start-ellipsis"]
        : boundaryCount + 1 < total - boundaryCount
          ? [boundaryCount + 1]
          : [];

    const endGap: PaginationItemValue[] =
      siblingsEnd < total - boundaryCount - 1
        ? ["end-ellipsis"]
        : total - boundaryCount > boundaryCount
          ? [total - boundaryCount]
          : [];

    return [
      ...startPages,
      ...startGap,
      ...range(siblingsStart, siblingsEnd),
      ...endGap,
      ...endPages,
    ];
  }, [page, totalPages, siblingCount, boundaryCount]);
}

const Pagination = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav">
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    role="navigation"
    aria-label="pagination"
    data-slot="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
));
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentPropsWithoutRef<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-slot="pagination-content"
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>((props, ref) => <li ref={ref} data-slot="pagination-item" {...props} />);
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
  disabled?: boolean;
  activeVariant?: ButtonVariant;
  inactiveVariant?: ButtonVariant;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentPropsWithoutRef<"a">;

const PaginationLink = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  (
    {
      className,
      isActive,
      disabled,
      size = "icon",
      activeVariant = "outline",
      inactiveVariant = "ghost",
      onClick,
      tabIndex,
      ...props
    },
    ref,
  ) => (
    <a
      ref={ref}
      aria-current={isActive ? "page" : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : tabIndex}
      data-slot="pagination-link"
      data-active={isActive}
      data-disabled={disabled || undefined}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      className={cn(
        buttonVariants({
          variant: isActive ? activeVariant : inactiveVariant,
          size,
        }),
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof PaginationLink> & { label?: string }
>(({ className, label = "Previous", ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to previous page"
    rel="prev"
    size="default"
    className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
    {...props}
  >
    <ChevronLeftIcon />
    <span className="hidden sm:block">{label}</span>
  </PaginationLink>
));
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof PaginationLink> & { label?: string }
>(({ className, label = "Next", ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to next page"
    rel="next"
    size="default"
    className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
    {...props}
  >
    <span className="hidden sm:block">{label}</span>
    <ChevronRightIcon />
  </PaginationLink>
));
PaginationNext.displayName = "PaginationNext";

const PaginationFirst = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof PaginationLink>
>(({ className, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to first page"
    className={className}
    {...props}
  >
    <ChevronsLeftIcon />
  </PaginationLink>
));
PaginationFirst.displayName = "PaginationFirst";

const PaginationLast = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof PaginationLink>
>(({ className, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to last page"
    className={className}
    {...props}
  >
    <ChevronsRightIcon />
  </PaginationLink>
));
PaginationLast.displayName = "PaginationLast";

const PaginationEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    aria-hidden
    data-slot="pagination-ellipsis"
    className={cn("flex size-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontalIcon className="size-4" />
    <span className="sr-only">More pages</span>
  </span>
));
PaginationEllipsis.displayName = "PaginationEllipsis";

interface PaginationInfoProps extends React.ComponentPropsWithoutRef<"p"> {
  page: number;
  pageSize: number;
  total: number;
  format?: (from: number, to: number, total: number) => React.ReactNode;
}

function PaginationInfo({
  page,
  pageSize,
  total,
  format,
  className,
  ...props
}: PaginationInfoProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <p
      data-slot="pagination-info"
      aria-live="polite"
      className={cn("text-muted-foreground text-sm tabular-nums", className)}
      {...props}
    >
      {format ? (
        format(from, to, total)
      ) : (
        <>
          Showing {from}–{to} of {total}
        </>
      )}
    </p>
  );
}

interface PaginationJumpProps
  extends Omit<React.ComponentPropsWithoutRef<"form">, "onSubmit"> {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label?: string;
  buttonLabel?: string;
}

function PaginationJump({
  page,
  totalPages,
  onPageChange,
  label = "Go to page",
  buttonLabel = "Go",
  className,
  ...props
}: PaginationJumpProps) {
  const [value, setValue] = React.useState(String(page));
  const id = React.useId();

  React.useEffect(() => {
    setValue(String(page));
  }, [page]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      setValue(String(page));
      return;
    }
    const next = Math.min(Math.max(parsed, 1), Math.max(totalPages, 1));
    setValue(String(next));
    onPageChange(next);
  };

  return (
    <form
      data-slot="pagination-jump"
      onSubmit={submit}
      className={cn("flex items-center gap-2 text-sm", className)}
      {...props}
    >
      <label htmlFor={id} className="text-muted-foreground whitespace-nowrap">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={1}
        max={totalPages}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-16 rounded-md border px-2 text-center text-sm tabular-nums outline-none focus-visible:ring-[3px]"
      />
      <button
        type="submit"
        className={cn(buttonVariants({ variant: "outline", size: "default" }))}
      >
        {buttonLabel}
      </button>
    </form>
  );
}

interface PaginationControlsProps
  extends Omit<React.ComponentPropsWithoutRef<"nav">, "onChange"> {
  page?: number;
  defaultPage?: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  siblingCount?: number;
  boundaryCount?: number;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  responsive?: boolean;
  compact?: boolean;
  size?: React.ComponentProps<typeof Button>["size"];
  activeVariant?: ButtonVariant;
  inactiveVariant?: ButtonVariant;
  getHref?: (page: number) => string;
  previousLabel?: string;
  nextLabel?: string;
  contentClassName?: string;
}

function PaginationControls({
  page: pageProp,
  defaultPage = 1,
  totalPages,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  showFirstLast = false,
  showPrevNext = true,
  responsive = true,
  compact = false,
  size = "icon",
  activeVariant = "outline",
  inactiveVariant = "ghost",
  getHref,
  previousLabel,
  nextLabel,
  contentClassName,
  className,
  ...props
}: PaginationControlsProps) {
  const [internalPage, setInternalPage] = React.useState(defaultPage);
  const isControlled = pageProp !== undefined;
  const safeTotal = Math.max(1, Math.floor(totalPages));
  const page = Math.min(
    Math.max(isControlled ? pageProp : internalPage, 1),
    safeTotal,
  );

  const items = usePagination({ page, totalPages: safeTotal, siblingCount, boundaryCount });

  const go = React.useCallback(
    (next: number) => {
      const target = Math.min(Math.max(next, 1), safeTotal);
      if (target === page) return;
      if (!isControlled) setInternalPage(target);
      onPageChange?.(target);
    },
    [isControlled, onPageChange, page, safeTotal],
  );

  const linkProps = (target: number) => ({
    href: getHref ? getHref(target) : "#",
    onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (!getHref) event.preventDefault();
      go(target);
    },
  });

  const atStart = page <= 1;
  const atEnd = page >= safeTotal;

  const status = (
    <li
      data-slot="pagination-status"
      aria-live="polite"
      className={cn(
        "text-muted-foreground px-3 text-sm tabular-nums",
        responsive && !compact && "sm:hidden",
      )}
    >
      Page {page} of {safeTotal}
    </li>
  );

  const showNumbers = !compact;

  return (
    <Pagination className={className} {...props}>
      <PaginationContent className={contentClassName}>
        {showFirstLast && (
          <PaginationItem>
            <PaginationFirst
              size={size}
              disabled={atStart}
              inactiveVariant={inactiveVariant}
              {...linkProps(1)}
            />
          </PaginationItem>
        )}
        {showPrevNext && (
          <PaginationItem>
            <PaginationPrevious
              disabled={atStart}
              label={previousLabel}
              inactiveVariant={inactiveVariant}
              {...linkProps(page - 1)}
            />
          </PaginationItem>
        )}

        {(compact || responsive) && status}

        {showNumbers &&
          items.map((item) =>
            typeof item === "number" ? (
              <PaginationItem
                key={item}
                className={responsive ? "hidden sm:block" : undefined}
              >
                <PaginationLink
                  size={size}
                  isActive={item === page}
                  activeVariant={activeVariant}
                  inactiveVariant={inactiveVariant}
                  aria-label={`Go to page ${item}`}
                  {...linkProps(item)}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            ) : (
              <PaginationItem
                key={item}
                className={responsive ? "hidden sm:block" : undefined}
              >
                <PaginationEllipsis />
              </PaginationItem>
            ),
          )}

        {showPrevNext && (
          <PaginationItem>
            <PaginationNext
              disabled={atEnd}
              label={nextLabel}
              inactiveVariant={inactiveVariant}
              {...linkProps(page + 1)}
            />
          </PaginationItem>
        )}
        {showFirstLast && (
          <PaginationItem>
            <PaginationLast
              size={size}
              disabled={atEnd}
              inactiveVariant={inactiveVariant}
              {...linkProps(safeTotal)}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationFirst,
  PaginationLast,
  PaginationEllipsis,
  PaginationInfo,
  PaginationJump,
  PaginationControls,
  usePagination,
};
export type {
  PaginationLinkProps,
  PaginationInfoProps,
  PaginationJumpProps,
  PaginationControlsProps,
  PaginationItemValue,
  UsePaginationOptions,
};
