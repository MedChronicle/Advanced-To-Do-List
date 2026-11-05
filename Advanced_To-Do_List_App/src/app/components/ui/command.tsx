"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk@1.1.1";
import { Loader2Icon, SearchIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

/* -------------------------------------------------------------------------- */
/*  Hooks                                                                     */
/* -------------------------------------------------------------------------- */

/** Toggles `setOpen` on Cmd/Ctrl + <key> (default "k"). */
function useCommandHotkey(
  setOpen: (updater: (open: boolean) => boolean) => void,
  key = "k",
  enabled = true,
) {
  React.useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [setOpen, key, enabled]);
}

/** Recently used item ids, persisted in localStorage. */
function useRecentItems(storageKey: string, limit = 5) {
  const [recent, setRecent] = React.useState<string[]>([]);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setRecent(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const push = React.useCallback(
    (id: string) => {
      setRecent((prev) => {
        const next = [id, ...prev.filter((x) => x !== id)].slice(0, limit);
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [storageKey, limit],
  );

  return { recent, push };
}

/* -------------------------------------------------------------------------- */
/*  Primitives                                                                */
/* -------------------------------------------------------------------------- */

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className,
      )}
      {...props}
    />
  );
}

type CommandDialogProps = React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
  /** Props forwarded to the inner <Command> (e.g. shouldFilter, filter, loop). */
  commandProps?: React.ComponentProps<typeof CommandPrimitive>;
  /** Open with Cmd/Ctrl + this key. Pass false to disable. Default "k". */
  hotkey?: string | false;
};

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  commandProps,
  hotkey = false,
  open,
  onOpenChange,
  ...props
}: CommandDialogProps) {
  // Hotkey only works when the dialog is controlled (we need the current state).
  useCommandHotkey(
    (updater) => onOpenChange?.(updater(!!open)),
    hotkey || "k",
    hotkey !== false && !!onOpenChange,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent className="overflow-hidden p-0">
        {/* Title/description must live inside DialogContent for Radix a11y. */}
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Command
          {...commandProps}
          className={cn(
            "[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5",
            commandProps?.className,
          )}
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  loading = false,
  leading,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input> & {
  /** Shows a spinner in place of the search icon (async results). */
  loading?: boolean;
  /** Content before the input, e.g. a breadcrumb chip for nested pages. */
  leading?: React.ReactNode;
}) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      {loading ? (
        <Loader2Icon aria-hidden className="size-4 shrink-0 animate-spin opacity-50" />
      ) : (
        <SearchIcon aria-hidden className="size-4 shrink-0 opacity-50" />
      )}
      {leading}
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
}

function CommandEmpty({
  className,
  children = "No results found.",
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn("py-6 text-center text-sm", className)}
      {...props}
    >
      {children}
    </CommandPrimitive.Empty>
  );
}

/** Shown while results are loading (renders only when you mount it). */
function CommandLoading({
  className,
  children = "Loading…",
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Loading>) {
  return (
    <CommandPrimitive.Loading {...props}>
      <div
        data-slot="command-loading"
        className={cn(
          "text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm",
          className,
        )}
      >
        <Loader2Icon aria-hidden className="size-4 animate-spin" />
        {children}
      </div>
    </CommandPrimitive.Loading>
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  icon,
  shortcut,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item> & {
  /** Convenience: icon rendered before the label. */
  icon?: React.ReactNode;
  /** Convenience: keyboard hint rendered at the end, e.g. "⌘K". */
  shortcut?: string;
}) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
      {shortcut && <CommandShortcut>{shortcut}</CommandShortcut>}
    </CommandPrimitive.Item>
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

/** Keyboard hints bar shown at the bottom of the palette. */
function CommandFooter({ className, ...props }: React.ComponentProps<"div">) {
  const Kbd = ({ children }: { children: React.ReactNode }) => (
    <kbd className="bg-muted text-muted-foreground rounded border px-1.5 py-0.5 font-mono text-[10px]">
      {children}
    </kbd>
  );
  return (
    <div
      data-slot="command-footer"
      className={cn(
        "text-muted-foreground flex items-center gap-4 border-t px-3 py-2 text-xs",
        className,
      )}
      {...props}
    >
      {props.children ?? (
        <>
          <span className="flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <Kbd>↵</Kbd> select
          </span>
          <span className="flex items-center gap-1">
            <Kbd>esc</Kbd> close
          </span>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  CommandPalette – data-driven, with recents + nested pages                 */
/* -------------------------------------------------------------------------- */

interface CommandPaletteItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  /** Extra search terms that match this item. */
  keywords?: string[];
  disabled?: boolean;
  /** Runs when selected. Ignored if `children` is set. */
  onSelect?: () => void;
  /** Makes this item open a sub-page (Backspace on empty input goes back). */
  children?: CommandPaletteGroup[];
}

interface CommandPaletteGroup {
  heading?: string;
  items: CommandPaletteItem[];
}

interface CommandPaletteProps {
  groups: CommandPaletteGroup[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  emptyMessage?: React.ReactNode;
  /** Shows a spinner and a loading row (for async-fetched groups). */
  loading?: boolean;
  /** Cmd/Ctrl + key to toggle. Default "k". Pass false to disable. */
  hotkey?: string | false;
  /** Show a "Recent" group of previously chosen items. Default true. */
  showRecent?: boolean;
  recentStorageKey?: string;
  showFooter?: boolean;
  /** Called with the raw search text (useful for server-side search). */
  onSearchChange?: (search: string) => void;
  /** Disable cmdk's built-in filtering when you filter on the server. */
  shouldFilter?: boolean;
}

interface PaletteStackEntry {
  title: string;
  groups: CommandPaletteGroup[];
}

function CommandPalette({
  groups,
  open: controlledOpen,
  onOpenChange,
  placeholder = "Type a command or search…",
  emptyMessage,
  loading = false,
  hotkey = "k",
  showRecent = true,
  recentStorageKey = "command-palette:recent",
  showFooter = true,
  onSearchChange,
  shouldFilter = true,
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const [search, setSearch] = React.useState("");
  const [stack, setStack] = React.useState<PaletteStackEntry[]>([]);
  const { recent, push: pushRecent } = useRecentItems(recentStorageKey);

  const setOpen = React.useCallback(
    (next: boolean) => {
      setInternalOpen(next);
      onOpenChange?.(next);
      if (!next) {
        // Reset navigation whenever the palette closes.
        setSearch("");
        setStack([]);
      }
    },
    [onOpenChange],
  );

  useCommandHotkey(
    (updater) => setOpen(updater(open)),
    hotkey || "k",
    hotkey !== false,
  );

  const page = stack[stack.length - 1];
  const visibleGroups = page ? page.groups : groups;

  const rootItems = React.useMemo(
    () => groups.flatMap((g) => g.items).filter((i) => !i.children),
    [groups],
  );
  const recentItems = React.useMemo(
    () =>
      recent
        .map((id) => rootItems.find((i) => i.id === id))
        .filter((i): i is CommandPaletteItem => !!i && !i.disabled),
    [recent, rootItems],
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearchChange?.(value);
  };

  const select = (item: CommandPaletteItem) => {
    if (item.children) {
      setStack((s) => [...s, { title: item.label, groups: item.children! }]);
      handleSearch("");
      return;
    }
    pushRecent(item.id);
    setOpen(false);
    // Let the dialog close before running the action (avoids focus fights).
    window.setTimeout(() => item.onSelect?.(), 0);
  };

  const renderItem = (item: CommandPaletteItem, prefix = "") => (
    <CommandItem
      key={`${prefix}${item.id}`}
      value={`${prefix}${item.id}`}
      keywords={[item.label, ...(item.keywords ?? [])]}
      disabled={item.disabled}
      icon={item.icon}
      shortcut={item.shortcut}
      onSelect={() => select(item)}
    >
      {item.label}
    </CommandItem>
  );

  const showRecentGroup =
    showRecent && !page && !search && recentItems.length > 0;

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      hotkey={false}
      commandProps={{
        shouldFilter,
        onKeyDown: (e) => {
          // Backspace on an empty input steps back out of a sub-page.
          if (e.key === "Backspace" && !search && stack.length) {
            e.preventDefault();
            setStack((s) => s.slice(0, -1));
          }
        },
      }}
    >
      <CommandInput
        value={search}
        onValueChange={handleSearch}
        placeholder={page ? `Search in ${page.title}…` : placeholder}
        loading={loading}
        leading={
          page ? (
            <span className="bg-muted text-muted-foreground shrink-0 rounded px-1.5 py-0.5 text-xs">
              {page.title}
            </span>
          ) : undefined
        }
      />
      <CommandList>
        {loading ? (
          <CommandLoading />
        ) : (
          <CommandEmpty>{emptyMessage}</CommandEmpty>
        )}

        {showRecentGroup && (
          <>
            <CommandGroup heading="Recent">
              {recentItems.map((item) => renderItem(item, "recent:"))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {visibleGroups.map((group, i) => (
          <React.Fragment key={group.heading ?? i}>
            {i > 0 && <CommandSeparator />}
            <CommandGroup heading={group.heading}>
              {group.items.map((item) => renderItem(item))}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
      {showFooter && <CommandFooter />}
    </CommandDialog>
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandLoading,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  CommandFooter,
  CommandPalette,
  useCommandHotkey,
  useRecentItems,
};
export type {
  CommandDialogProps,
  CommandPaletteProps,
  CommandPaletteGroup,
  CommandPaletteItem,
};
