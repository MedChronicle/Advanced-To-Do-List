"use client";

import * as React from "react";
import { GripVerticalIcon } from "lucide-react@0.487.0";
import * as ResizablePrimitive from "react-resizable-panels@2.1.7";
import { cva } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

type HandleVariant = "grip" | "bar" | "dots";
type HandleThickness = "thin" | "medium" | "thick";

interface ResizableContextValue {
  dragging: boolean;
  setDragging: (value: boolean) => void;
}

const ResizableContext = React.createContext<ResizableContextValue>({
  dragging: false,
  setDragging: () => {},
});

const useResizableContext = () => React.useContext(ResizableContext);

type PanelGroupProps = React.ComponentProps<
  typeof ResizablePrimitive.PanelGroup
>;

interface ResizablePanelGroupProps extends Omit<PanelGroupProps, "autoSaveId"> {
  persistKey?: string;
  autoSaveId?: string;
}

const ResizablePanelGroup = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive.PanelGroup>,
  ResizablePanelGroupProps
>(({ className, persistKey, autoSaveId, ...props }, ref) => {
  const [dragging, setDragging] = React.useState(false);
  const value = React.useMemo(() => ({ dragging, setDragging }), [dragging]);

  return (
    <ResizableContext.Provider value={value}>
      <ResizablePrimitive.PanelGroup
        ref={ref}
        data-slot="resizable-panel-group"
        data-dragging={dragging || undefined}
        autoSaveId={persistKey ?? autoSaveId}
        className={cn(
          "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
          className,
        )}
        {...props}
      />
    </ResizableContext.Provider>
  );
});
ResizablePanelGroup.displayName = "ResizablePanelGroup";

interface ResizablePanelProps
  extends React.ComponentProps<typeof ResizablePrimitive.Panel> {
  animate?: boolean;
}

const ResizablePanel = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive.Panel>,
  ResizablePanelProps
>(({ className, animate = true, onCollapse, onExpand, ...props }, ref) => {
  const { dragging } = useResizableContext();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <ResizablePrimitive.Panel
      ref={ref}
      data-slot="resizable-panel"
      data-collapsed={collapsed || undefined}
      className={cn(
        animate &&
          !dragging &&
          "transition-[flex-grow] duration-200 ease-out motion-reduce:transition-none",
        className,
      )}
      onCollapse={() => {
        setCollapsed(true);
        onCollapse?.();
      }}
      onExpand={() => {
        setCollapsed(false);
        onExpand?.();
      }}
      {...props}
    />
  );
});
ResizablePanel.displayName = "ResizablePanel";

const handleVariants = cva(
  "bg-border focus-visible:ring-ring data-[resize-handle-state=hover]:bg-primary/60 data-[resize-handle-state=drag]:bg-primary relative flex items-center justify-center transition-colors after:absolute focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[panel-group-direction=horizontal]:cursor-col-resize data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:cursor-row-resize data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90",
  {
    variants: {
      thickness: {
        thin: "w-px data-[panel-group-direction=vertical]:h-px",
        medium: "w-0.5 data-[panel-group-direction=vertical]:h-0.5",
        thick: "w-1 data-[panel-group-direction=vertical]:h-1",
      },
    },
    defaultVariants: { thickness: "thin" },
  },
);

function HandleGrip({ variant }: { variant: HandleVariant }) {
  if (variant === "bar") {
    return (
      <div className="bg-border z-10 h-8 w-1.5 rounded-full border transition-colors group-data-[resize-handle-state=drag]:bg-primary" />
    );
  }
  if (variant === "dots") {
    return (
      <div className="bg-background z-10 flex h-6 w-3 flex-col items-center justify-center gap-0.5 rounded-xs border">
        <span className="bg-muted-foreground size-0.5 rounded-full" />
        <span className="bg-muted-foreground size-0.5 rounded-full" />
        <span className="bg-muted-foreground size-0.5 rounded-full" />
      </div>
    );
  }
  return (
    <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
      <GripVerticalIcon className="size-2.5" />
    </div>
  );
}

interface ResizableHandleProps
  extends React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> {
  withHandle?: boolean;
  handleVariant?: HandleVariant;
  thickness?: HandleThickness;
  showOnHover?: boolean;
}

const ResizableHandle = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive.PanelResizeHandle>,
  ResizableHandleProps
>(
  (
    {
      withHandle,
      handleVariant = "grip",
      thickness = "thin",
      showOnHover = false,
      className,
      onDragging,
      hitAreaMargins,
      ...props
    },
    ref,
  ) => {
    const { setDragging } = useResizableContext();

    return (
      <ResizablePrimitive.PanelResizeHandle
        ref={ref}
        data-slot="resizable-handle"
        hitAreaMargins={hitAreaMargins ?? { coarse: 15, fine: 5 }}
        onDragging={(isDragging) => {
          setDragging(isDragging);
          onDragging?.(isDragging);
        }}
        className={cn(
          "group",
          handleVariants({ thickness }),
          showOnHover &&
            "data-[resize-handle-state=inactive]:bg-transparent hover:bg-border",
          className,
        )}
        {...props}
      >
        {withHandle && (
          <div
            className={cn(
              "contents",
              showOnHover &&
                "[&>div]:opacity-0 [&>div]:transition-opacity group-hover:[&>div]:opacity-100 group-data-[resize-handle-state=drag]:[&>div]:opacity-100",
            )}
          >
            <HandleGrip variant={handleVariant} />
          </div>
        )}
      </ResizablePrimitive.PanelResizeHandle>
    );
  },
);
ResizableHandle.displayName = "ResizableHandle";

function useResizablePanel() {
  const ref = React.useRef<ResizablePrimitive.ImperativePanelHandle>(null);
  const [collapsed, setCollapsed] = React.useState(false);

  const collapse = React.useCallback(() => ref.current?.collapse(), []);
  const expand = React.useCallback(() => ref.current?.expand(), []);
  const toggle = React.useCallback(() => {
    const panel = ref.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  }, []);
  const resize = React.useCallback(
    (size: number) => ref.current?.resize(size),
    [],
  );

  const panelProps = React.useMemo(
    () => ({
      ref,
      collapsible: true,
      onCollapse: () => setCollapsed(true),
      onExpand: () => setCollapsed(false),
    }),
    [],
  );

  return { ref, collapsed, collapse, expand, toggle, resize, panelProps };
}

function useResizableLayout(initial?: number[]) {
  const groupRef =
    React.useRef<ResizablePrimitive.ImperativePanelGroupHandle>(null);
  const [layout, setLayout] = React.useState<number[] | undefined>(initial);

  const reset = React.useCallback(() => {
    if (initial) groupRef.current?.setLayout(initial);
  }, [initial]);

  const apply = React.useCallback((next: number[]) => {
    groupRef.current?.setLayout(next);
  }, []);

  return {
    groupRef,
    layout,
    reset,
    apply,
    groupProps: { ref: groupRef, onLayout: setLayout },
  };
}

export {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  useResizablePanel,
  useResizableLayout,
  useResizableContext,
  handleVariants,
};
export type {
  ResizablePanelGroupProps,
  ResizablePanelProps,
  ResizableHandleProps,
};
