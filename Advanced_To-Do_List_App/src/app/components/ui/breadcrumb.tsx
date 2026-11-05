"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  HomeIcon,
  MoreHorizontal,
} from "lucide-react@0.487.0";
import { cva } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

type BreadcrumbSize = "sm" | "md" | "lg";
type BreadcrumbSeparatorStyle = "chevron" | "slash" | "dot" | "arrow";

interface BreadcrumbContextValue {
  size: BreadcrumbSize;
  separator: BreadcrumbSeparatorStyle;
}

const BreadcrumbContext = React.createContext<BreadcrumbContextValue>({
  size: "md",
  separator: "chevron",
});

const useBreadcrumbContext = () => React.useContext(BreadcrumbContext);

const listVariants = cva(
  "text-muted-foreground flex flex-wrap items-center break-words",
  {
    variants: {
      size: {
        sm: "gap-1 text-xs sm:gap-1.5",
        md: "gap-1.5 text-sm sm:gap-2.5",
        lg: "gap-2 text-base sm:gap-3",
      },
    },
    defaultVariants: { size: "md" },
  },
);

interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  size?: BreadcrumbSize;
  separator?: BreadcrumbSeparatorStyle;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ size = "md", separator = "chevron", ...props }, ref) => {
    const value = React.useMemo(() => ({ size, separator }), [size, separator]);
    return (
      <BreadcrumbContext.Provider value={value}>
        <nav
          ref={ref}
          aria-label="breadcrumb"
          data-slot="breadcrumb"
          {...props}
        />
      </BreadcrumbContext.Provider>
    );
  },
);
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => {
  const { size } = useBreadcrumbContext();
  return (
    <ol
      ref={ref}
      data-slot="breadcrumb-list"
      className={cn(listVariants({ size }), className)}
      {...props}
    />
  );
});
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-slot="breadcrumb-item"
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
));
BreadcrumbItem.displayName = "BreadcrumbItem";

interface BreadcrumbLinkProps extends React.ComponentPropsWithoutRef<"a"> {
  asChild?: boolean;
  icon?: React.ReactNode;
}

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ asChild, className, icon, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "a";
    const classes = cn(
      "hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-sm transition-colors outline-none focus-visible:ring-[3px] [&_svg:not([class*='size-'])]:size-4",
      className,
    );

    if (asChild) {
      return (
        <Comp ref={ref} data-slot="breadcrumb-link" className={classes} {...props}>
          {children}
        </Comp>
      );
    }

    return (
      <Comp ref={ref} data-slot="breadcrumb-link" className={classes} {...props}>
        {icon}
        {children}
      </Comp>
    );
  },
);
BreadcrumbLink.displayName = "BreadcrumbLink";

interface BreadcrumbPageProps extends React.ComponentPropsWithoutRef<"span"> {
  icon?: React.ReactNode;
}

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  ({ className, icon, children, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn(
        "text-foreground inline-flex items-center gap-1.5 font-normal [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  ),
);
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ children, className, ...props }, ref) => {
  const { separator } = useBreadcrumbContext();

  const fallback = (() => {
    switch (separator) {
      case "slash":
        return <span className="text-muted-foreground/60">/</span>;
      case "dot":
        return <span className="text-muted-foreground/60">·</span>;
      case "arrow":
        return <ArrowRight className="rtl:rotate-180" />;
      default:
        return <ChevronRight className="rtl:rotate-180" />;
    }
  })();

  return (
    <li
      ref={ref}
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? fallback}
    </li>
  );
});
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    data-slot="breadcrumb-ellipsis"
    role="presentation"
    aria-hidden="true"
    className={cn("flex size-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="size-4" />
    <span className="sr-only">More</span>
  </span>
));
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

interface BreadcrumbEntry {
  label: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  title?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

interface BreadcrumbCollapsedProps {
  items: BreadcrumbEntry[];
  label?: string;
  renderLink?: (entry: BreadcrumbEntry, content: React.ReactNode) => React.ReactElement;
}

function BreadcrumbCollapsed({
  items,
  label = "Show hidden pages",
  renderLink,
}: BreadcrumbCollapsedProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLSpanElement>(null);
  const menuId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <span ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 inline-flex size-7 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-[3px]"
      >
        <MoreHorizontal className="size-4" />
      </button>
      {open && (
        <ul
          id={menuId}
          data-slot="breadcrumb-collapsed-menu"
          className="bg-popover text-popover-foreground absolute top-full left-0 z-50 mt-1 flex min-w-40 max-w-64 flex-col gap-0.5 rounded-md border p-1 shadow-md"
        >
          {items.map((entry, index) => {
            const content = (
              <>
                {entry.icon}
                <span className="truncate">{entry.label}</span>
              </>
            );
            const className =
              "hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus-visible:bg-accent [&_svg:not([class*='size-'])]:size-4";
            return (
              <li key={index}>
                {renderLink ? (
                  <Slot className={className} onClick={() => setOpen(false)}>
                    {renderLink(entry, content)}
                  </Slot>
                ) : (
                  <a
                    href={entry.href}
                    title={entry.title}
                    className={className}
                    onClick={(event) => {
                      entry.onClick?.(event);
                      setOpen(false);
                    }}
                  >
                    {content}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </span>
  );
}

interface BreadcrumbTrailProps
  extends Omit<React.ComponentPropsWithoutRef<"nav">, "children"> {
  items: BreadcrumbEntry[];
  size?: BreadcrumbSize;
  separator?: BreadcrumbSeparatorStyle;
  maxItems?: number;
  itemsBeforeCollapse?: number;
  itemsAfterCollapse?: number;
  homeIcon?: boolean;
  mobileBack?: boolean;
  truncateLabels?: boolean;
  structuredData?: boolean;
  baseUrl?: string;
  renderLink?: (entry: BreadcrumbEntry, content: React.ReactNode) => React.ReactElement;
  listClassName?: string;
}

function buildStructuredData(items: BreadcrumbEntry[], baseUrl?: string) {
  const elements = items
    .map((entry, index) => ({ entry, position: index + 1 }))
    .filter(({ entry }) => typeof entry.label === "string")
    .map(({ entry, position }) => {
      const base: Record<string, unknown> = {
        "@type": "ListItem",
        position,
        name: entry.label,
      };
      if (entry.href) {
        base.item = baseUrl
          ? new URL(entry.href, baseUrl).toString()
          : entry.href;
      }
      return base;
    });

  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: elements,
  }).replace(/</g, "\\u003c");
}

const BreadcrumbTrail = React.forwardRef<HTMLElement, BreadcrumbTrailProps>(
  (
    {
      items,
      size = "md",
      separator = "chevron",
      maxItems,
      itemsBeforeCollapse = 1,
      itemsAfterCollapse,
      homeIcon = false,
      mobileBack = false,
      truncateLabels = true,
      structuredData = false,
      baseUrl,
      renderLink,
      listClassName,
      className,
      ...props
    },
    ref,
  ) => {
    const total = items.length;
    const shouldCollapse = maxItems !== undefined && maxItems >= 2 && total > maxItems;
    const before = Math.min(itemsBeforeCollapse, Math.max((maxItems ?? total) - 2, 0));
    const after = shouldCollapse
      ? Math.max(itemsAfterCollapse ?? (maxItems as number) - before - 1, 1)
      : 0;

    const head = shouldCollapse ? items.slice(0, before) : items;
    const hidden = shouldCollapse ? items.slice(before, total - after) : [];
    const tail = shouldCollapse ? items.slice(total - after) : [];

    const labelClass = truncateLabels
      ? "max-w-[10rem] truncate sm:max-w-[16rem]"
      : undefined;

    const renderEntry = (
      entry: BreadcrumbEntry,
      index: number,
      isLast: boolean,
      isFirst: boolean,
    ) => {
      const showHome = homeIcon && isFirst;
      const icon = showHome ? <HomeIcon aria-hidden /> : entry.icon;
      const text =
        showHome && typeof entry.label === "string" ? (
          <span className="sr-only sm:not-sr-only">{entry.label}</span>
        ) : (
          <span
            className={labelClass}
            title={
              entry.title ??
              (typeof entry.label === "string" ? entry.label : undefined)
            }
          >
            {entry.label}
          </span>
        );

      if (isLast) {
        return (
          <BreadcrumbPage icon={icon}>
            {text}
          </BreadcrumbPage>
        );
      }

      const content = (
        <>
          {icon}
          {text}
        </>
      );

      if (renderLink) {
        return <BreadcrumbLink asChild>{renderLink(entry, content)}</BreadcrumbLink>;
      }

      return (
        <BreadcrumbLink href={entry.href} onClick={entry.onClick}>
          {content}
        </BreadcrumbLink>
      );
    };

    const parent = total > 1 ? items[total - 2] : undefined;

    return (
      <Breadcrumb
        ref={ref}
        size={size}
        separator={separator}
        className={className}
        {...props}
      >
        {mobileBack && parent && (
          <div className="sm:hidden">
            {renderLink ? (
              <BreadcrumbLink asChild>
                {renderLink(
                  parent,
                  <>
                    <ChevronLeft aria-hidden />
                    <span className={labelClass}>{parent.label}</span>
                  </>,
                )}
              </BreadcrumbLink>
            ) : (
              <BreadcrumbLink href={parent.href} onClick={parent.onClick}>
                <ChevronLeft aria-hidden />
                <span className={labelClass}>{parent.label}</span>
              </BreadcrumbLink>
            )}
          </div>
        )}
        <BreadcrumbList
          className={cn(mobileBack && parent && "hidden sm:flex", listClassName)}
        >
          {head.map((entry, index) => {
            const isLast = !shouldCollapse && index === head.length - 1;
            return (
              <React.Fragment key={`head-${index}`}>
                <BreadcrumbItem>
                  {renderEntry(entry, index, isLast, index === 0)}
                </BreadcrumbItem>
                {(!isLast || shouldCollapse) && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
          {shouldCollapse && (
            <>
              <BreadcrumbItem>
                <BreadcrumbCollapsed items={hidden} renderLink={renderLink} />
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          {tail.map((entry, index) => {
            const isLast = index === tail.length - 1;
            return (
              <React.Fragment key={`tail-${index}`}>
                <BreadcrumbItem>
                  {renderEntry(entry, index, isLast, false)}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: buildStructuredData(items, baseUrl) }}
          />
        )}
      </Breadcrumb>
    );
  },
);
BreadcrumbTrail.displayName = "BreadcrumbTrail";

interface BreadcrumbsFromPathOptions {
  homeLabel?: React.ReactNode;
  homeHref?: string;
  labels?: Record<string, string>;
  format?: (segment: string) => string;
  skip?: string[];
}

function titleize(segment: string) {
  let decoded = segment;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    decoded = segment;
  }
  return decoded
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function breadcrumbsFromPath(
  pathname: string,
  {
    homeLabel = "Home",
    homeHref = "/",
    labels = {},
    format = titleize,
    skip = [],
  }: BreadcrumbsFromPathOptions = {},
): BreadcrumbEntry[] {
  const path = pathname.split(/[?#]/)[0];
  const segments = path.split("/").filter(Boolean);
  const entries: BreadcrumbEntry[] = [{ label: homeLabel, href: homeHref }];
  let current = "";
  segments.forEach((segment) => {
    current += `/${segment}`;
    if (skip.includes(segment)) return;
    entries.push({
      label: labels[segment] ?? labels[current] ?? format(segment),
      href: current,
    });
  });
  return entries;
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  BreadcrumbCollapsed,
  BreadcrumbTrail,
  breadcrumbsFromPath,
  useBreadcrumbContext,
};
export type {
  BreadcrumbProps,
  BreadcrumbLinkProps,
  BreadcrumbPageProps,
  BreadcrumbEntry,
  BreadcrumbCollapsedProps,
  BreadcrumbTrailProps,
  BreadcrumbsFromPathOptions,
  BreadcrumbSize,
  BreadcrumbSeparatorStyle,
};
