"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { cn } from "./utils";

/* ------------------------------------------------------------------ */
/* Table-wide options shared with every part through context           */
/* ------------------------------------------------------------------ */

interface TableContextValue {
  dense: boolean;
  striped: boolean;
  stickyHeader: boolean;
}

const TableContext = React.createContext<TableContextValue>({
  dense: false,
  striped: false,
  stickyHeader: false,
});

interface TableProps extends React.ComponentProps<"table"> {
  /** Tighter cell padding for data-heavy views. */
  dense?: boolean;
  /** Alternate row backgrounds (zebra). */
  striped?: boolean;
  /**
   * Keep the header visible while the body scrolls. Give the table a height
   * with `containerClassName`, e.g. "max-h-96".
   */
  stickyHeader?: boolean;
  /** Classes for the scroll container around the <table>. */
  containerClassName?: string;
}

function Table({
  className,
  containerClassName,
  dense = false,
  striped = false,
  stickyHeader = false,
  ...props
}: TableProps) {
  const value = React.useMemo(
    () => ({ dense, striped, stickyHeader }),
    [dense, striped, stickyHeader],
  );

  return (
    <TableContext.Provider value={value}>
      <div
        data-slot="table-container"
        // Scrollable regions must be keyboard-reachable for accessibility.
        tabIndex={0}
        className={cn(
          "focus-visible:ring-ring/50 relative w-full overflow-auto rounded-md outline-none focus-visible:ring-[3px]",
          containerClassName,
        )}
      >
        <table
          data-slot="table"
          className={cn("w-full caption-bottom text-sm", className)}
          {...props}
        />
      </div>
    </TableContext.Provider>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  const { stickyHeader } = React.useContext(TableContext);
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "[&_tr]:border-b",
        stickyHeader &&
          "[&_th]:bg-background sticky top-0 z-10 [&_th]:shadow-[inset_0_-1px_0_var(--border)]",
        className,
      )}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  const { striped } = React.useContext(TableContext);
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&_tr:last-child]:border-0",
        striped && "[&_tr:nth-child(even)]:bg-muted/30",
        className,
      )}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

type SortDirection = "asc" | "desc" | false;

interface TableHeadProps extends React.ComponentProps<"th"> {
  /**
   * Makes the column sortable. Pass the current direction (or false when this
   * column isn't the sorted one) together with `onSort`.
   */
  sortDirection?: SortDirection;
  onSort?: () => void;
}

function TableHead({
  className,
  children,
  sortDirection,
  onSort,
  ...props
}: TableHeadProps) {
  const { dense } = React.useContext(TableContext);
  const sortable = !!onSort;

  const Icon =
    sortDirection === "asc"
      ? ArrowUp
      : sortDirection === "desc"
        ? ArrowDown
        : ChevronsUpDown;

  return (
    <th
      data-slot="table-head"
      aria-sort={
        !sortable
          ? undefined
          : sortDirection === "asc"
            ? "ascending"
            : sortDirection === "desc"
              ? "descending"
              : "none"
      }
      className={cn(
        "text-foreground px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        dense ? "h-8 text-xs" : "h-10",
        className,
      )}
      {...props}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onSort}
          className="hover:text-foreground focus-visible:ring-ring/50 -mx-1 inline-flex items-center gap-1 rounded px-1 outline-none focus-visible:ring-[3px]"
        >
          {children}
          <Icon
            aria-hidden
            className={cn(
              "size-3.5 shrink-0",
              sortDirection ? "opacity-100" : "opacity-40",
            )}
          />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  const { dense } = React.useContext(TableContext);
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        dense ? "px-2 py-1" : "p-2",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

/**
 * Full-width placeholder row for "no results":
 *
 *   {rows.length === 0 && <TableEmpty colSpan={4}>No tasks found.</TableEmpty>}
 */
function TableEmpty({
  colSpan,
  className,
  children = "No results.",
  ...props
}: Omit<React.ComponentProps<"td">, "colSpan"> & { colSpan: number }) {
  return (
    <TableRow className="hover:bg-transparent">
      <td
        data-slot="table-empty"
        colSpan={colSpan}
        className={cn(
          "text-muted-foreground h-24 p-2 text-center align-middle",
          className,
        )}
        {...props}
      >
        {children}
      </td>
    </TableRow>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableEmpty,
};
export type { TableProps, SortDirection };
