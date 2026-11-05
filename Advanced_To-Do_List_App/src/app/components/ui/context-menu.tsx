"use client";

import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu@2.2.6";
import {
  CheckIcon,
  ChevronRightIcon,
  CircleIcon,
  Loader2Icon,
} from "lucide-react@0.487.0";

import { cn } from "./utils";

/* -------------------------------------------------------------------------- */
/*  Hook: remember what was right-clicked                                     */
/* -------------------------------------------------------------------------- */

/**
 * In lists/tables you usually render ONE menu for many rows. This remembers
 * which row was right-clicked so menu actions know their target.
 *
 *   const { target, bind } = useContextMenuTarget<Row>();
 *   <ContextMenuTrigger {...bind(row)}>…</ContextMenuTrigger>
 *   <ContextMenuContent> …uses `target`… </ContextMenuContent>
 */
function useContextMenuTarget<T>() {
  const [target, setTarget] = React.useState<T | null>(null);

  const bind = React.useCallback(
    (value: T) => ({
      onContextMenu: () => setTarget(value),
    }),
    [],
  );

  const clear = React.useCallback(() => setTarget(null), []);

  return { target, bind, clear };
}

/* -------------------------------------------------------------------------- */
/*  Primitives                                                                */
/* -------------------------------------------------------------------------- */

function ContextMenu({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  );
}

function ContextMenuGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  );
}

function ContextMenuPortal({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  );
}

function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}

function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  );
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  icon,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
      <ChevronRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

type ContextMenuItemProps = React.ComponentProps<
  typeof ContextMenuPrimitive.Item
> & {
  inset?: boolean;
  variant?: "default" | "destructive";
  /** Icon rendered before the label. */
  icon?: React.ReactNode;
  /** Keyboard hint rendered at the end, e.g. "⌘C". */
  shortcut?: string;
  /** Shows a spinner and blocks selection (for async actions). */
  loading?: boolean;
};

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  icon,
  shortcut,
  loading = false,
  disabled,
  children,
  ...props
}: ContextMenuItemProps) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      data-loading={loading || undefined}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {loading ? <Loader2Icon className="animate-spin" /> : icon}
      {children}
      {shortcut && <ContextMenuShortcut>{shortcut}</ContextMenuShortcut>}
    </ContextMenuPrimitive.Item>
  );
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  shortcut,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem> & {
  shortcut?: string;
}) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
      {shortcut && <ContextMenuShortcut>{shortcut}</ContextMenuShortcut>}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        "text-foreground px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Data-driven menu                                                          */
/* -------------------------------------------------------------------------- */

type ContextMenuEntry =
  | {
      type?: "item";
      id: string;
      label: React.ReactNode;
      icon?: React.ReactNode;
      shortcut?: string;
      variant?: "default" | "destructive";
      disabled?: boolean;
      loading?: boolean;
      /** Conditionally remove the entry without extra ternaries. */
      hidden?: boolean;
      onSelect?: (event: Event) => void;
    }
  | {
      type: "checkbox";
      id: string;
      label: React.ReactNode;
      checked: boolean;
      onCheckedChange: (checked: boolean) => void;
      shortcut?: string;
      disabled?: boolean;
      hidden?: boolean;
    }
  | {
      type: "radio";
      id: string;
      /** Optional heading above the options. */
      label?: React.ReactNode;
      value: string;
      onValueChange: (value: string) => void;
      options: { value: string; label: React.ReactNode; disabled?: boolean }[];
      hidden?: boolean;
    }
  | {
      type: "sub";
      id: string;
      label: React.ReactNode;
      icon?: React.ReactNode;
      disabled?: boolean;
      hidden?: boolean;
      entries: ContextMenuEntry[];
    }
  | { type: "label"; id?: string; label: React.ReactNode; hidden?: boolean }
  | { type: "separator"; id?: string; hidden?: boolean };

/**
 * Drops hidden entries, then removes separators that would be leading,
 * trailing, or doubled-up – so conditional entries never leave stray lines.
 */
function normalizeEntries(entries: ContextMenuEntry[]): ContextMenuEntry[] {
  const visible = entries.filter((e) => !e.hidden);
  const out: ContextMenuEntry[] = [];
  for (const entry of visible) {
    if (entry.type === "separator") {
      if (out.length === 0 || out[out.length - 1].type === "separator") continue;
    }
    out.push(entry);
  }
  while (out.length && out[out.length - 1].type === "separator") out.pop();
  return out;
}

function renderEntries(entries: ContextMenuEntry[]): React.ReactNode {
  return normalizeEntries(entries).map((entry, index) => {
    const key = ("id" in entry && entry.id) || `${entry.type}-${index}`;

    switch (entry.type) {
      case "separator":
        return <ContextMenuSeparator key={key} />;

      case "label":
        return <ContextMenuLabel key={key}>{entry.label}</ContextMenuLabel>;

      case "checkbox":
        return (
          <ContextMenuCheckboxItem
            key={key}
            checked={entry.checked}
            onCheckedChange={entry.onCheckedChange}
            disabled={entry.disabled}
            shortcut={entry.shortcut}
          >
            {entry.label}
          </ContextMenuCheckboxItem>
        );

      case "radio":
        return (
          <React.Fragment key={key}>
            {entry.label && <ContextMenuLabel>{entry.label}</ContextMenuLabel>}
            <ContextMenuRadioGroup
              value={entry.value}
              onValueChange={entry.onValueChange}
            >
              {entry.options.map((opt) => (
                <ContextMenuRadioItem
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                >
                  {opt.label}
                </ContextMenuRadioItem>
              ))}
            </ContextMenuRadioGroup>
          </React.Fragment>
        );

      case "sub":
        return (
          <ContextMenuSub key={key}>
            <ContextMenuSubTrigger icon={entry.icon} disabled={entry.disabled}>
              {entry.label}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>{renderEntries(entry.entries)}</ContextMenuSubContent>
          </ContextMenuSub>
        );

      default:
        return (
          <ContextMenuItem
            key={key}
            icon={entry.icon}
            shortcut={entry.shortcut}
            variant={entry.variant}
            disabled={entry.disabled}
            loading={entry.loading}
            onSelect={entry.onSelect}
          >
            {entry.label}
          </ContextMenuItem>
        );
    }
  });
}

interface DataContextMenuProps {
  entries: ContextMenuEntry[];
  /** The area that responds to right-click / long-press. */
  children: React.ReactNode;
  /** Turn the menu off without unmounting the trigger area. */
  disabled?: boolean;
  /** Classes for the trigger wrapper. */
  className?: string;
  contentClassName?: string;
  onOpenChange?: (open: boolean) => void;
}

function DataContextMenu({
  entries,
  children,
  disabled,
  className,
  contentClassName,
  onOpenChange,
}: DataContextMenuProps) {
  return (
    <ContextMenu onOpenChange={onOpenChange}>
      <ContextMenuTrigger disabled={disabled} className={className}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className={cn("w-56", contentClassName)}>
        {renderEntries(entries)}
      </ContextMenuContent>
    </ContextMenu>
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
  DataContextMenu,
  useContextMenuTarget,
};
export type { ContextMenuEntry, ContextMenuItemProps, DataContextMenuProps };
