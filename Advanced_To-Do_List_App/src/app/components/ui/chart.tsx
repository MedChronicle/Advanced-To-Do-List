"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts@2.15.2";

import { cn } from "./utils";

const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

/** Keep only characters that are safe inside a CSS custom-property name. */
const sanitizeKey = (key: string) => key.replace(/[^a-zA-Z0-9_-]/g, "_");

/** Allow hex, rgb(), hsl(), oklch(), var(--x), named colors, etc. – nothing that could break out of a declaration. */
const isSafeColor = (value: string) => /^[#a-zA-Z0-9(),.%\s/_-]+$/.test(value);

/* -------------------------------------------------------------------------- */
/*  Series visibility hook (click legend to show/hide a series)               */
/* -------------------------------------------------------------------------- */

/**
 * Tracks which series are hidden. Pass `hidden` / `toggle` to
 * <ChartLegendContent /> and `hide={isHidden(key)}` to each series.
 * The last visible series can't be hidden, so the chart never goes blank.
 */
function useChartSeries(allKeys: string[], initiallyHidden: string[] = []) {
  const [hidden, setHidden] = React.useState<string[]>(initiallyHidden);

  const toggle = React.useCallback(
    (key: string) => {
      setHidden((prev) => {
        if (prev.includes(key)) return prev.filter((k) => k !== key);
        const visibleCount = allKeys.filter((k) => !prev.includes(k)).length;
        return visibleCount <= 1 ? prev : [...prev, key];
      });
    },
    [allKeys],
  );

  const isHidden = React.useCallback((key: string) => hidden.includes(key), [hidden]);
  const reset = React.useCallback(() => setHidden([]), []);

  return { hidden, toggle, isHidden, reset };
}

/* -------------------------------------------------------------------------- */
/*  Container                                                                 */
/* -------------------------------------------------------------------------- */

function ChartContainer({
  id,
  className,
  children,
  config,
  loading = false,
  empty = false,
  emptyMessage = "No data to display",
  title,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
  /** Shows a skeleton instead of the chart. */
  loading?: boolean;
  /** Shows `emptyMessage` instead of the chart. */
  empty?: boolean;
  emptyMessage?: React.ReactNode;
  /** Accessible name for the chart (read by screen readers). */
  title?: string;
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;
  const contextValue = React.useMemo(() => ({ config }), [config]);

  return (
    <ChartContext.Provider value={contextValue}>
      <div
        data-slot="chart"
        data-chart={chartId}
        data-state={loading ? "loading" : empty ? "empty" : "ready"}
        role="img"
        aria-label={title}
        aria-busy={loading || undefined}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        {loading ? (
          <div
            data-slot="chart-skeleton"
            className="bg-muted/60 h-full w-full animate-pulse rounded-lg"
          />
        ) : empty ? (
          <div
            data-slot="chart-empty"
            className="text-muted-foreground flex h-full w-full items-center justify-center text-sm"
          >
            {emptyMessage}
          </div>
        ) : (
          <RechartsPrimitive.ResponsiveContainer>
            {children}
          </RechartsPrimitive.ResponsiveContainer>
        )}
      </div>
    </ChartContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Style injection (sanitised)                                               */
/* -------------------------------------------------------------------------- */

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color,
  );

  if (!colorConfig.length) {
    return null;
  }

  const safeId = sanitizeKey(id);

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${safeId}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color && isSafeColor(color)
      ? `  --color-${sanitizeKey(key)}: ${color};`
      : null;
  })
  .filter(Boolean)
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

/* -------------------------------------------------------------------------- */
/*  Tooltip                                                                   */
/* -------------------------------------------------------------------------- */

const ChartTooltip = RechartsPrimitive.Tooltip;

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  valueFormatter,
  showTotal = false,
  totalLabel = "Total",
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
    /** Format each numeric value, e.g. (v) => `$${v.toLocaleString()}`. */
    valueFormatter?: (
      value: number | string,
      name: string,
      item: any,
    ) => React.ReactNode;
    /** Append a total row summing all numeric series. */
    showTotal?: boolean;
    totalLabel?: React.ReactNode;
  }) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }

    const [item] = payload;
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === "string"
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label;

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      );
    }

    if (!value) {
      return null;
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ]);

  const total = React.useMemo(
    () =>
      showTotal
        ? (payload ?? []).reduce(
            (sum, item) => sum + (typeof item.value === "number" ? item.value : 0),
            0,
          )
        : 0,
    [payload, showTotal],
  );

  if (!active || !payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== "dot";

  const renderValue = (item: (typeof payload)[number], name: string) => {
    if (item.value === undefined || item.value === null) return null;
    const formatted = valueFormatter
      ? valueFormatter(item.value as number | string, name, item)
      : typeof item.value === "number"
        ? item.value.toLocaleString()
        : String(item.value);
    return (
      <span className="text-foreground font-mono font-medium tabular-nums">
        {formatted}
      </span>
    );
  };

  return (
    <div
      role="tooltip"
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color || item.payload?.fill || item.color;
          const displayName = String(itemConfig?.label ?? item.name ?? "");

          return (
            <div
              key={`${item.dataKey ?? item.name ?? "item"}-${index}`}
              className={cn(
                "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                indicator === "dot" && "items-center",
              )}
            >
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn(
                          "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                          {
                            "h-2.5 w-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent":
                              indicator === "dashed",
                            "my-0.5": nestLabel && indicator === "dashed",
                          },
                        )}
                        style={
                          {
                            "--color-bg": indicatorColor,
                            "--color-border": indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    )
                  )}
                  <div
                    className={cn(
                      "flex flex-1 justify-between gap-4 leading-none",
                      nestLabel ? "items-end" : "items-center",
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {/* `0` is a valid value – don't hide it. */}
                    {renderValue(item, displayName)}
                  </div>
                </>
              )}
            </div>
          );
        })}

        {showTotal && payload.length > 1 && (
          <div className="border-border/50 flex items-center justify-between gap-4 border-t pt-1.5 leading-none">
            <span className="text-muted-foreground">{totalLabel}</span>
            <span className="text-foreground font-mono font-medium tabular-nums">
              {valueFormatter
                ? valueFormatter(total, String(totalLabel), null)
                : total.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Legend                                                                    */
/* -------------------------------------------------------------------------- */

const ChartLegend = RechartsPrimitive.Legend;

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
  hidden,
  onToggle,
}: React.ComponentProps<"div"> &
  Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
    hideIcon?: boolean;
    nameKey?: string;
    /** Keys of series currently hidden (from useChartSeries). */
    hidden?: string[];
    /** When provided, legend items become toggle buttons. */
    onToggle?: (key: string) => void;
  }) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-4 gap-y-1",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
    >
      {payload.map((item, index) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);
        const seriesKey = String(item.dataKey ?? item.value ?? key);
        const isHidden = hidden?.includes(seriesKey) ?? false;

        const content = (
          <>
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
            )}
            {itemConfig?.label ?? item.value}
          </>
        );

        const base = cn(
          "[&>svg]:text-muted-foreground flex items-center gap-1.5 transition-opacity [&>svg]:h-3 [&>svg]:w-3",
          isHidden && "opacity-40",
        );

        return onToggle ? (
          <button
            key={`${item.value}-${index}`}
            type="button"
            aria-pressed={!isHidden}
            onClick={() => onToggle(seriesKey)}
            className={cn(
              base,
              "focus-visible:ring-ring/50 cursor-pointer rounded-sm outline-none hover:opacity-80 focus-visible:ring-2",
              isHidden && "line-through",
            )}
          >
            {content}
          </button>
        ) : (
          <div key={`${item.value}-${index}`} className={base}>
            {content}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Config lookup                                                             */
/* -------------------------------------------------------------------------- */

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  useChartSeries,
};
