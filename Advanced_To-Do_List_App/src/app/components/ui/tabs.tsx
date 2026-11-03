"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

/* ------------------------------------------------------------------ */
/* Variants                                                            */
/* ------------------------------------------------------------------ */

const tabsListVariants = cva(
  "text-muted-foreground inline-flex w-fit max-w-full items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden data-[orientation=vertical]:h-auto data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
  {
    variants: {
      variant: {
        /** Segmented control (the original look). */
        default: "bg-muted h-9 justify-center rounded-xl p-[3px]",
        /** Flat tabs with an animated bottom border. */
        underline: "h-9 gap-1 rounded-none border-b bg-transparent p-0 data-[orientation=vertical]:border-b-0 data-[orientation=vertical]:border-r",
        /** Separate rounded pills. */
        pills: "h-9 gap-1 bg-transparent p-0",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: { variant: "default", fullWidth: false },
  },
);

const tabsTriggerVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5 text-sm font-medium whitespace-nowrap",
    "border border-transparent px-3 py-1 transition-[color,background-color,box-shadow,border-color]",
    "focus-visible:ring-ring/50 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:outline-1",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    "motion-reduce:transition-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "text-foreground dark:text-muted-foreground h-[calc(100%-1px)] flex-1 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm dark:data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30",
        underline:
          "text-muted-foreground hover:text-foreground -mb-px h-9 rounded-none border-0 border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground data-[orientation=vertical]:mb-0 data-[orientation=vertical]:-mr-px data-[orientation=vertical]:justify-start data-[orientation=vertical]:border-b-0 data-[orientation=vertical]:border-r-2",
        pills:
          "text-muted-foreground hover:bg-muted hover:text-foreground h-9 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

type TabsVariant = NonNullable<VariantProps<typeof tabsListVariants>["variant"]>;

const TabsVariantContext = React.createContext<TabsVariant>("default");

/* ------------------------------------------------------------------ */
/* Components                                                          */
/* ------------------------------------------------------------------ */

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn(
        "flex flex-col gap-2 data-[orientation=vertical]:flex-row data-[orientation=vertical]:gap-4",
        className,
      )}
      {...props}
    />
  );
}

function TabsList({
  className,
  variant = "default",
  fullWidth = false,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  const v = (variant ?? "default") as TabsVariant;
  return (
    <TabsVariantContext.Provider value={v}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={v}
        className={cn(tabsListVariants({ variant: v, fullWidth }), className)}
        {...props}
      />
    </TabsVariantContext.Provider>
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const variant = React.useContext(TabsVariantContext);
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 outline-none",
        // Gentle fade-in when a panel becomes active (skipped for reduced motion).
        "data-[state=active]:animate-in data-[state=active]:fade-in-0 motion-reduce:animate-none",
        "focus-visible:ring-ring/50 focus-visible:ring-[3px] rounded-md",
        className,
      )}
      {...props}
    />
  );
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
  tabsTriggerVariants,
};
