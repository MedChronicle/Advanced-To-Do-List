"use client";

import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu@1.2.5";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";
import { ChevronDownIcon, MenuIcon, XIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

type NavVariant = "default" | "ghost" | "pill" | "underline";
type NavSize = "sm" | "md" | "lg";

interface NavigationMenuContextValue {
  variant: NavVariant;
  size: NavSize;
}

const NavigationMenuContext = React.createContext<NavigationMenuContextValue>({
  variant: "default",
  size: "md",
});

const useNavigationMenuContext = () => React.useContext(NavigationMenuContext);

const interactive =
  "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground";

const navigationMenuTriggerStyle = cva(
  "group inline-flex w-max items-center justify-center text-sm font-medium disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow,background-color,border-color] focus-visible:ring-[3px] focus-visible:outline-1",
  {
    variants: {
      variant: {
        default: `rounded-md bg-background ${interactive}`,
        ghost: `rounded-md bg-transparent ${interactive}`,
        pill: `rounded-full bg-transparent ${interactive}`,
        underline:
          "rounded-none border-b-2 border-transparent bg-transparent hover:text-foreground focus:text-foreground data-[state=open]:border-primary data-[state=open]:text-foreground data-[active=true]:border-primary data-[active=true]:text-foreground text-muted-foreground",
      },
      size: {
        sm: "h-8 px-3 py-1.5 text-xs",
        md: "h-9 px-4 py-2",
        lg: "h-11 px-5 py-2.5 text-base",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

interface NavigationMenuProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root> {
  viewport?: boolean;
  viewportClassName?: string;
  variant?: NavVariant;
  size?: NavSize;
}

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  NavigationMenuProps
>(
  (
    {
      className,
      children,
      viewport = true,
      viewportClassName,
      variant = "default",
      size = "md",
      ...props
    },
    ref,
  ) => {
    const value = React.useMemo(() => ({ variant, size }), [variant, size]);
    return (
      <NavigationMenuContext.Provider value={value}>
        <NavigationMenuPrimitive.Root
          ref={ref}
          data-slot="navigation-menu"
          data-viewport={viewport}
          className={cn(
            "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
            className,
          )}
          {...props}
        >
          {children}
          {viewport && <NavigationMenuViewport className={viewportClassName} />}
        </NavigationMenuPrimitive.Root>
      </NavigationMenuContext.Provider>
    );
  },
);
NavigationMenu.displayName = "NavigationMenu";

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    data-slot="navigation-menu-list"
    className={cn(
      "group flex flex-1 list-none items-center justify-center gap-1",
      className,
    )}
    {...props}
  />
));
NavigationMenuList.displayName = "NavigationMenuList";

const NavigationMenuItem = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Item
    ref={ref}
    data-slot="navigation-menu-item"
    className={cn("relative", className)}
    {...props}
  />
));
NavigationMenuItem.displayName = "NavigationMenuItem";

interface NavigationMenuTriggerProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger> {
  variant?: NavVariant;
  size?: NavSize;
  hideChevron?: boolean;
}

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  NavigationMenuTriggerProps
>(({ className, children, variant, size, hideChevron = false, ...props }, ref) => {
  const ctx = useNavigationMenuContext();
  return (
    <NavigationMenuPrimitive.Trigger
      ref={ref}
      data-slot="navigation-menu-trigger"
      className={cn(
        navigationMenuTriggerStyle({
          variant: variant ?? ctx.variant,
          size: size ?? ctx.size,
        }),
        "group",
        className,
      )}
      {...props}
    >
      {children}
      {!hideChevron && (
        <ChevronDownIcon
          className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      )}
    </NavigationMenuPrimitive.Trigger>
  );
});
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    data-slot="navigation-menu-content"
    className={cn(
      "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-0 left-0 w-full p-2 pr-2.5 motion-reduce:animate-none md:absolute md:w-auto",
      "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
      className,
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = "NavigationMenuContent";

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className="absolute top-full left-0 isolate z-50 flex justify-center">
    <NavigationMenuPrimitive.Viewport
      ref={ref}
      data-slot="navigation-menu-viewport"
      className={cn(
        "origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow motion-reduce:animate-none md:w-[var(--radix-navigation-menu-viewport-width)]",
        className,
      )}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName = "NavigationMenuViewport";

const NavigationMenuLink = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Link>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Link>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Link
    ref={ref}
    data-slot="navigation-menu-link"
    className={cn(
      "data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
      className,
    )}
    {...props}
  />
));
NavigationMenuLink.displayName = "NavigationMenuLink";

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    data-slot="navigation-menu-indicator"
    className={cn(
      "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
      className,
    )}
    {...props}
  >
    <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = "NavigationMenuIndicator";

interface NavigationMenuListItemProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Link>,
    "title"
  > {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

const NavigationMenuListItem = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Link>,
  NavigationMenuListItemProps
>(({ className, title, description, icon, badge, children, ...props }, ref) => (
  <NavigationMenuLink
    ref={ref}
    data-slot="navigation-menu-list-item"
    className={cn("flex-row items-start gap-3 p-3", className)}
    {...props}
  >
    {icon && (
      <span className="bg-muted text-foreground mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md [&_svg]:size-4">
        {icon}
      </span>
    )}
    <span className="flex min-w-0 flex-col gap-1">
      <span className="flex items-center gap-2 text-sm leading-none font-medium">
        {title}
        {badge && (
          <span className="bg-secondary text-secondary-foreground rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold">
            {badge}
          </span>
        )}
      </span>
      {description && (
        <span className="text-muted-foreground line-clamp-2 text-sm leading-snug font-normal">
          {description}
        </span>
      )}
      {children}
    </span>
  </NavigationMenuLink>
));
NavigationMenuListItem.displayName = "NavigationMenuListItem";

const gridVariants = cva("grid gap-1 p-1", {
  variants: {
    columns: {
      1: "w-full md:w-[20rem]",
      2: "w-full md:w-[36rem] md:grid-cols-2",
      3: "w-full md:w-[52rem] md:grid-cols-3",
    },
  },
  defaultVariants: { columns: 1 },
});

interface NavigationMenuGridProps
  extends React.ComponentPropsWithoutRef<"ul">,
    VariantProps<typeof gridVariants> {}

const NavigationMenuGrid = React.forwardRef<
  HTMLUListElement,
  NavigationMenuGridProps
>(({ className, columns, ...props }, ref) => (
  <ul
    ref={ref}
    data-slot="navigation-menu-grid"
    className={cn(gridVariants({ columns }), "max-w-[calc(100vw-2rem)]", className)}
    {...props}
  />
));
NavigationMenuGrid.displayName = "NavigationMenuGrid";

interface NavigationMenuFeaturedProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Link>,
    "title"
  > {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
}

const NavigationMenuFeatured = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Link>,
  NavigationMenuFeaturedProps
>(({ className, title, description, icon, ...props }, ref) => (
  <NavigationMenuPrimitive.Link
    ref={ref}
    data-slot="navigation-menu-featured"
    className={cn(
      "from-muted/50 to-muted focus-visible:ring-ring/50 flex h-full w-full flex-col justify-end rounded-md bg-gradient-to-b p-5 no-underline outline-none transition-shadow select-none hover:shadow-md focus-visible:ring-[3px]",
      className,
    )}
    {...props}
  >
    {icon && <span className="mb-3 [&_svg]:size-6">{icon}</span>}
    <span className="mb-1 text-base font-medium">{title}</span>
    {description && (
      <span className="text-muted-foreground text-sm leading-snug">
        {description}
      </span>
    )}
  </NavigationMenuPrimitive.Link>
));
NavigationMenuFeatured.displayName = "NavigationMenuFeatured";

interface NavItem {
  label: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  children?: NavItem[];
  columns?: 1 | 2 | 3;
  featured?: {
    title: React.ReactNode;
    description?: React.ReactNode;
    href: string;
    icon?: React.ReactNode;
  };
}

interface NavigationMenuBarProps
  extends Omit<NavigationMenuProps, "children"> {
  items: NavItem[];
  onNavigate?: (item: NavItem) => void;
}

function NavigationMenuBar({
  items,
  onNavigate,
  variant,
  size,
  ...props
}: NavigationMenuBarProps) {
  return (
    <NavigationMenu variant={variant} size={size} {...props}>
      <NavigationMenuList>
        {items.map((item, index) => (
          <NavigationMenuItem key={index}>
            {item.children?.length ? (
              <>
                <NavigationMenuTrigger disabled={item.disabled}>
                  {item.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div
                    className={cn(
                      item.featured &&
                        "grid gap-2 md:w-[36rem] md:grid-cols-[0.8fr_1.2fr]",
                    )}
                  >
                    {item.featured && (
                      <NavigationMenuFeatured
                        href={item.featured.href}
                        title={item.featured.title}
                        description={item.featured.description}
                        icon={item.featured.icon}
                      />
                    )}
                    <NavigationMenuGrid
                      columns={item.featured ? 1 : (item.columns ?? 2)}
                      className={cn(item.featured && "md:w-auto")}
                    >
                      {item.children.map((child, childIndex) => (
                        <li key={childIndex}>
                          <NavigationMenuListItem
                            href={child.href}
                            title={child.label}
                            description={child.description}
                            icon={child.icon}
                            badge={child.badge}
                            active={child.active}
                            onClick={() => onNavigate?.(child)}
                          />
                        </li>
                      ))}
                    </NavigationMenuGrid>
                  </div>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink
                href={item.href}
                active={item.active}
                onClick={() => onNavigate?.(item)}
                className={cn(
                  navigationMenuTriggerStyle({ variant, size }),
                  item.disabled && "pointer-events-none opacity-50",
                )}
              >
                {item.label}
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

interface NavigationMenuMobileProps
  extends Omit<React.ComponentPropsWithoutRef<"nav">, "children"> {
  items: NavItem[];
  onNavigate?: (item: NavItem) => void;
  menuLabel?: string;
}

function NavigationMenuMobile({
  items,
  onNavigate,
  menuLabel = "Menu",
  className,
  ...props
}: NavigationMenuMobileProps) {
  const [open, setOpen] = React.useState(false);
  const panelId = React.useId();

  const linkClass =
    "hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 flex items-center gap-2 rounded-md px-3 py-2 text-sm outline-none focus-visible:ring-[3px] aria-[current=page]:bg-accent/50 aria-[current=page]:font-medium";

  return (
    <nav
      data-slot="navigation-menu-mobile"
      aria-label={menuLabel}
      className={cn("relative", className)}
      {...props}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className="hover:bg-accent focus-visible:ring-ring/50 inline-flex size-9 items-center justify-center rounded-md outline-none focus-visible:ring-[3px]"
      >
        {open ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
      </button>
      {open && (
        <ul
          id={panelId}
          className="bg-popover text-popover-foreground absolute top-full right-0 z-50 mt-2 flex max-h-[70vh] w-72 max-w-[calc(100vw-2rem)] flex-col gap-1 overflow-y-auto rounded-md border p-2 shadow-md"
        >
          {items.map((item, index) => (
            <li key={index}>
              {item.children?.length ? (
                <details className="group/details">
                  <summary
                    className={cn(
                      linkClass,
                      "cursor-pointer list-none justify-between font-medium [&::-webkit-details-marker]:hidden",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon}
                      {item.label}
                    </span>
                    <ChevronDownIcon className="size-4 transition-transform group-open/details:rotate-180 motion-reduce:transition-none" />
                  </summary>
                  <ul className="border-border mt-1 ml-3 flex flex-col gap-0.5 border-l pl-2">
                    {item.children.map((child, childIndex) => (
                      <li key={childIndex}>
                        <a
                          href={child.href}
                          aria-current={child.active ? "page" : undefined}
                          className={linkClass}
                          onClick={() => {
                            onNavigate?.(child);
                            setOpen(false);
                          }}
                        >
                          {child.icon}
                          <span className="flex flex-col">
                            <span>{child.label}</span>
                            {child.description && (
                              <span className="text-muted-foreground text-xs">
                                {child.description}
                              </span>
                            )}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <a
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={linkClass}
                  onClick={() => {
                    onNavigate?.(item);
                    setOpen(false);
                  }}
                >
                  {item.icon}
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  NavigationMenuListItem,
  NavigationMenuGrid,
  NavigationMenuFeatured,
  NavigationMenuBar,
  NavigationMenuMobile,
  navigationMenuTriggerStyle,
  useNavigationMenuContext,
};
export type {
  NavigationMenuProps,
  NavigationMenuTriggerProps,
  NavigationMenuListItemProps,
  NavigationMenuGridProps,
  NavigationMenuFeaturedProps,
  NavigationMenuBarProps,
  NavigationMenuMobileProps,
  NavItem,
};
