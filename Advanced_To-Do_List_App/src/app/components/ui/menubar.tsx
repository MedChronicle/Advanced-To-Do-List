"use client";

import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar@1.1.6";
import {
  CheckIcon,
  ChevronRightIcon,
  CircleIcon,
  Loader2Icon,
} from "lucide-react@0.487.0";
import { cva } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

type MenubarVariant = "default" | "ghost" | "pill";
type MenubarSize = "sm" | "md" | "lg";

interface MenubarContextValue {
  variant: MenubarVariant;
  size: MenubarSize;
}

const MenubarContext = React.createContext<MenubarContextValue>({
  variant: "default",
  size: "md",
});

const useMenubarContext = () => React.useContext(MenubarContext);

const rootVariants = cva("flex items-center gap-1 border p-1", {
  variants: {
    variant: {
      default: "bg-background rounded-md shadow-xs",
      ghost: "rounded-md border-transparent bg-transparent shadow-none",
      pill: "bg-muted rounded-full border-transparent",
    },
    size: {
      sm: "h-8 text-xs",
      md: "h-9",
      lg: "h-11 text-base",
    },
  },
  defaultVariants: { variant: "default", size: "md" },
});

const triggerVariants = cva(
  "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex items-center font-medium outline-hidden transition-colors select-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "rounded-sm",
        ghost: "rounded-sm",
        pill: "rounded-full",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2 py-1 text-sm",
        lg: "px-3 py-1.5 text-base",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

const contentVariants = cva(
  "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-menubar-content-available-height) origin-(--radix-menubar-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md motion-reduce:animate-none",
  {
    variants: {
      size: {
        sm: "min-w-[8rem]",
        md: "min-w-[12rem]",
        lg: "min-w-[16rem]",
        xl: "min-w-[20rem]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const itemBase =
  "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

interface MenubarProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root> {
  variant?: MenubarVariant;
  size?: MenubarSize;
}

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  MenubarProps
>(({ className, variant = "default", size = "md", ...props }, ref) => {
  const value = React.useMemo(() => ({ variant, size }), [variant, size]);
  return (
    <MenubarContext.Provider value={value}>
      <MenubarPrimitive.Root
        ref={ref}
        data-slot="menubar"
        className={cn(rootVariants({ variant, size }), className)}
        {...props}
      />
    </MenubarContext.Provider>
  );
});
Menubar.displayName = "Menubar";

function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />;
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />;
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />;
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return (
    <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
  );
}

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const { variant, size } = useMenubarContext();
  return (
    <MenubarPrimitive.Trigger
      ref={ref}
      data-slot="menubar-trigger"
      className={cn(triggerVariants({ variant, size }), className)}
      {...props}
    />
  );
});
MenubarTrigger.displayName = "MenubarTrigger";

interface MenubarContentProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content> {
  size?: "sm" | "md" | "lg" | "xl";
}

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  MenubarContentProps
>(
  (
    {
      className,
      align = "start",
      alignOffset = -4,
      sideOffset = 8,
      collisionPadding = 8,
      size,
      ...props
    },
    ref,
  ) => (
    <MenubarPortal>
      <MenubarPrimitive.Content
        ref={ref}
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(contentVariants({ size }), className)}
        {...props}
      />
    </MenubarPortal>
  ),
);
MenubarContent.displayName = "MenubarContent";

const MenubarShortcut = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    data-slot="menubar-shortcut"
    className={cn(
      "text-muted-foreground ml-auto pl-4 text-xs tracking-widest",
      className,
    )}
    {...props}
  />
));
MenubarShortcut.displayName = "MenubarShortcut";

interface MenubarItemProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> {
  inset?: boolean;
  variant?: "default" | "destructive";
  icon?: React.ReactNode;
  shortcut?: React.ReactNode;
  description?: React.ReactNode;
  loading?: boolean;
}

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  MenubarItemProps
>(
  (
    {
      className,
      inset,
      variant = "default",
      icon,
      shortcut,
      description,
      loading,
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <MenubarPrimitive.Item
      ref={ref}
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      disabled={disabled || loading}
      className={cn(
        itemBase,
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground rounded-sm px-2 py-1.5 text-sm data-[inset]:pl-8",
        description && "items-start",
        className,
      )}
      {...props}
    >
      {loading ? <Loader2Icon className="animate-spin" /> : icon}
      {description ? (
        <span className="flex min-w-0 flex-col gap-0.5">
          <span>{children}</span>
          <span className="text-muted-foreground text-xs">{description}</span>
        </span>
      ) : (
        children
      )}
      {shortcut && <MenubarShortcut>{shortcut}</MenubarShortcut>}
    </MenubarPrimitive.Item>
  ),
);
MenubarItem.displayName = "MenubarItem";

interface MenubarCheckboxItemProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem> {
  shortcut?: React.ReactNode;
}

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  MenubarCheckboxItemProps
>(({ className, children, checked, shortcut, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    data-slot="menubar-checkbox-item"
    className={cn(itemBase, "rounded-xs py-1.5 pr-2 pl-8 text-sm", className)}
    checked={checked}
    {...props}
  >
    <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <CheckIcon className="size-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
    {shortcut && <MenubarShortcut>{shortcut}</MenubarShortcut>}
  </MenubarPrimitive.CheckboxItem>
));
MenubarCheckboxItem.displayName = "MenubarCheckboxItem";

interface MenubarRadioItemProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem> {
  shortcut?: React.ReactNode;
}

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  MenubarRadioItemProps
>(({ className, children, shortcut, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    data-slot="menubar-radio-item"
    className={cn(itemBase, "rounded-xs py-1.5 pr-2 pl-8 text-sm", className)}
    {...props}
  >
    <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <CircleIcon className="size-2 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
    {shortcut && <MenubarShortcut>{shortcut}</MenubarShortcut>}
  </MenubarPrimitive.RadioItem>
));
MenubarRadioItem.displayName = "MenubarRadioItem";

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    data-slot="menubar-label"
    data-inset={inset}
    className={cn("px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", className)}
    {...props}
  />
));
MenubarLabel.displayName = "MenubarLabel";

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    data-slot="menubar-separator"
    className={cn("bg-border -mx-1 my-1 h-px", className)}
    {...props}
  />
));
MenubarSeparator.displayName = "MenubarSeparator";

function MenubarSub({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean;
    icon?: React.ReactNode;
  }
>(({ className, inset, icon, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    data-slot="menubar-sub-trigger"
    data-inset={inset}
    className={cn(
      "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[inset]:pl-8 [&_svg:not([class*='size-'])]:size-4",
      className,
    )}
    {...props}
  >
    {icon}
    {children}
    <ChevronRightIcon className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
));
MenubarSubTrigger.displayName = "MenubarSubTrigger";

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    data-slot="menubar-sub-content"
    className={cn(
      "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg motion-reduce:animate-none",
      className,
    )}
    {...props}
  />
));
MenubarSubContent.displayName = "MenubarSubContent";

type MenubarEntry =
  | {
      type?: "item";
      label: React.ReactNode;
      icon?: React.ReactNode;
      hotkey?: string;
      description?: React.ReactNode;
      onSelect?: () => void;
      disabled?: boolean;
      loading?: boolean;
      destructive?: boolean;
      inset?: boolean;
    }
  | {
      type: "checkbox";
      label: React.ReactNode;
      checked: boolean;
      onCheckedChange: (checked: boolean) => void;
      hotkey?: string;
      disabled?: boolean;
    }
  | {
      type: "radio";
      value: string;
      onValueChange: (value: string) => void;
      options: Array<{ value: string; label: React.ReactNode; disabled?: boolean }>;
    }
  | { type: "separator" }
  | { type: "label"; label: React.ReactNode; inset?: boolean }
  | {
      type: "sub";
      label: React.ReactNode;
      icon?: React.ReactNode;
      entries: MenubarEntry[];
      disabled?: boolean;
    };

interface MenubarSection {
  label: React.ReactNode;
  entries: MenubarEntry[];
  size?: "sm" | "md" | "lg" | "xl";
}

function useIsMac() {
  const [isMac, setIsMac] = React.useState(false);
  React.useEffect(() => {
    if (typeof navigator === "undefined") return;
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent));
  }, []);
  return isMac;
}

function formatHotkey(hotkey: string, isMac: boolean) {
  const parts = hotkey.split("+").map((part) => part.trim().toLowerCase());
  const symbols: Record<string, [string, string]> = {
    mod: ["⌘", "Ctrl"],
    ctrl: ["⌃", "Ctrl"],
    alt: ["⌥", "Alt"],
    shift: ["⇧", "Shift"],
    enter: ["↵", "Enter"],
    backspace: ["⌫", "Backspace"],
    delete: ["⌦", "Del"],
    escape: ["⎋", "Esc"],
    esc: ["⎋", "Esc"],
  };
  const mapped = parts.map((part) => {
    const entry = symbols[part];
    if (entry) return isMac ? entry[0] : entry[1];
    return part.length === 1 ? part.toUpperCase() : part;
  });
  return isMac ? mapped.join("") : mapped.join("+");
}

function matchesHotkey(event: KeyboardEvent, hotkey: string, isMac: boolean) {
  const parts = hotkey.split("+").map((part) => part.trim().toLowerCase());
  const key = parts[parts.length - 1];
  const wantsMod = parts.includes("mod");
  const wantsCtrl = parts.includes("ctrl");
  const wantsAlt = parts.includes("alt");
  const wantsShift = parts.includes("shift");
  const modPressed = isMac ? event.metaKey : event.ctrlKey;
  if (wantsMod && !modPressed) return false;
  if (!wantsMod && (isMac ? event.metaKey : false)) return false;
  if (wantsCtrl !== (wantsMod && !isMac ? false : event.ctrlKey) && !wantsMod) {
    return false;
  }
  if (wantsAlt !== event.altKey) return false;
  if (wantsShift !== event.shiftKey) return false;
  return event.key.toLowerCase() === key;
}

function collectHotkeys(
  entries: MenubarEntry[],
  out: Array<{ hotkey: string; run: () => void }> = [],
) {
  entries.forEach((entry) => {
    if (entry.type === "sub") collectHotkeys(entry.entries, out);
    else if (entry.type === "checkbox" && entry.hotkey && !entry.disabled) {
      out.push({
        hotkey: entry.hotkey,
        run: () => entry.onCheckedChange(!entry.checked),
      });
    } else if (
      (entry.type === undefined || entry.type === "item") &&
      entry.hotkey &&
      entry.onSelect &&
      !entry.disabled &&
      !entry.loading
    ) {
      out.push({ hotkey: entry.hotkey, run: entry.onSelect });
    }
  });
  return out;
}

function useMenubarHotkeys(sections: MenubarSection[], enabled = true) {
  const isMac = useIsMac();
  const bindings = React.useMemo(
    () => sections.flatMap((section) => collectHotkeys(section.entries)),
    [sections],
  );

  React.useEffect(() => {
    if (!enabled || bindings.length === 0) return;
    const handler = (event: KeyboardEvent) => {
      for (const binding of bindings) {
        if (matchesHotkey(event, binding.hotkey, isMac)) {
          event.preventDefault();
          binding.run();
          return;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [bindings, enabled, isMac]);
}

function renderEntries(entries: MenubarEntry[], isMac: boolean): React.ReactNode {
  return entries.map((entry, index) => {
    if (entry.type === "separator") {
      return <MenubarSeparator key={index} />;
    }
    if (entry.type === "label") {
      return (
        <MenubarLabel key={index} inset={entry.inset}>
          {entry.label}
        </MenubarLabel>
      );
    }
    if (entry.type === "checkbox") {
      return (
        <MenubarCheckboxItem
          key={index}
          checked={entry.checked}
          onCheckedChange={entry.onCheckedChange}
          disabled={entry.disabled}
          shortcut={entry.hotkey ? formatHotkey(entry.hotkey, isMac) : undefined}
        >
          {entry.label}
        </MenubarCheckboxItem>
      );
    }
    if (entry.type === "radio") {
      return (
        <MenubarRadioGroup
          key={index}
          value={entry.value}
          onValueChange={entry.onValueChange}
        >
          {entry.options.map((option) => (
            <MenubarRadioItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </MenubarRadioItem>
          ))}
        </MenubarRadioGroup>
      );
    }
    if (entry.type === "sub") {
      return (
        <MenubarSub key={index}>
          <MenubarSubTrigger icon={entry.icon} disabled={entry.disabled}>
            {entry.label}
          </MenubarSubTrigger>
          <MenubarSubContent>{renderEntries(entry.entries, isMac)}</MenubarSubContent>
        </MenubarSub>
      );
    }
    return (
      <MenubarItem
        key={index}
        icon={entry.icon}
        description={entry.description}
        disabled={entry.disabled}
        loading={entry.loading}
        inset={entry.inset}
        variant={entry.destructive ? "destructive" : "default"}
        shortcut={entry.hotkey ? formatHotkey(entry.hotkey, isMac) : undefined}
        onSelect={entry.onSelect}
      >
        {entry.label}
      </MenubarItem>
    );
  });
}

interface MenubarBarProps extends Omit<MenubarProps, "children"> {
  sections: MenubarSection[];
  enableHotkeys?: boolean;
}

function MenubarBar({
  sections,
  enableHotkeys = true,
  ...props
}: MenubarBarProps) {
  const isMac = useIsMac();
  useMenubarHotkeys(sections, enableHotkeys);

  return (
    <Menubar {...props}>
      {sections.map((section, index) => (
        <MenubarMenu key={index}>
          <MenubarTrigger>{section.label}</MenubarTrigger>
          <MenubarContent size={section.size}>
            {renderEntries(section.entries, isMac)}
          </MenubarContent>
        </MenubarMenu>
      ))}
    </Menubar>
  );
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarBar,
  useMenubarHotkeys,
  useMenubarContext,
  formatHotkey,
};
export type {
  MenubarProps,
  MenubarContentProps,
  MenubarItemProps,
  MenubarCheckboxItemProps,
  MenubarRadioItemProps,
  MenubarEntry,
  MenubarSection,
  MenubarBarProps,
};
