"use client";

import * as React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react@0.487.0";
import { DayPicker, type DateRange, type Matcher } from "react-day-picker@8.10.1";

import { cn } from "./utils";
import { Button, buttonVariants } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type CalendarSize = "sm" | "md" | "lg";

interface CalendarPreset {
  label: string;
  value: Date | DateRange;
}

interface CalendarExtras {
  size?: CalendarSize;
  todayButton?: boolean | string;
  presets?: CalendarPreset[];
  onPresetSelect?: (value: Date | DateRange) => void;
  markedDates?: Date[];
  highlightedDates?: Date[];
  highlightWeekends?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

type CalendarProps = React.ComponentProps<typeof DayPicker> & CalendarExtras;

const sizeClasses: Record<CalendarSize, { day: string; head: string }> = {
  sm: { day: "size-7 text-xs", head: "w-7 text-[0.7rem]" },
  md: { day: "size-8", head: "w-8 text-[0.8rem]" },
  lg: { day: "size-10 text-base", head: "w-10 text-sm" },
};

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function isRange(value: Date | DateRange): value is DateRange {
  return !(value instanceof Date);
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  size = "md",
  todayButton = false,
  presets,
  onPresetSelect,
  markedDates,
  highlightedDates,
  highlightWeekends = false,
  minDate,
  maxDate,
  footer,
  modifiers,
  modifiersClassNames,
  disabled,
  components,
  month: monthProp,
  onMonthChange,
  ...props
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState<Date>(
    monthProp ?? props.defaultMonth ?? new Date(),
  );
  const isControlled = monthProp !== undefined;
  const currentMonth = isControlled ? monthProp : internalMonth;

  const handleMonthChange = React.useCallback(
    (next: Date) => {
      if (!isControlled) setInternalMonth(next);
      onMonthChange?.(next);
    },
    [isControlled, onMonthChange],
  );

  const sizes = sizeClasses[size];

  const mergedModifiers = React.useMemo(() => {
    const next: Record<string, Matcher | Matcher[]> = {
      ...((modifiers as Record<string, Matcher | Matcher[]>) ?? {}),
    };
    if (markedDates?.length) next.marked = markedDates;
    if (highlightedDates?.length) next.highlighted = highlightedDates;
    if (highlightWeekends) next.weekend = { dayOfWeek: [0, 6] };
    return next;
  }, [modifiers, markedDates, highlightedDates, highlightWeekends]);

  const mergedModifierClassNames = React.useMemo(
    () => ({
      marked:
        "relative after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-primary aria-selected:after:bg-primary-foreground",
      highlighted: "bg-primary/10 font-medium",
      weekend: "text-muted-foreground",
      ...(modifiersClassNames ?? {}),
    }),
    [modifiersClassNames],
  );

  const mergedDisabled = React.useMemo(() => {
    const matchers: Matcher[] = [
      ...toArray(disabled as Matcher | Matcher[] | undefined),
    ];
    if (minDate) matchers.push({ before: minDate });
    if (maxDate) matchers.push({ after: maxDate });
    return matchers.length > 0 ? matchers : undefined;
  }, [disabled, minDate, maxDate]);

  const hasFooter = Boolean(todayButton) || Boolean(presets?.length) || Boolean(footer);

  const composedFooter = hasFooter ? (
    <div className="mt-3 flex flex-col gap-2 border-t pt-3">
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-7 px-2.5 text-xs",
              )}
              onClick={() => {
                const target = isRange(preset.value)
                  ? preset.value.from
                  : preset.value;
                if (target) handleMonthChange(target);
                onPresetSelect?.(preset.value);
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
      {todayButton && (
        <button
          type="button"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full")}
          onClick={() => handleMonthChange(new Date())}
        >
          {typeof todayButton === "string" ? todayButton : "Today"}
        </button>
      )}
      {footer}
    </div>
  ) : undefined;

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "flex items-center gap-1 text-sm font-medium",
        caption_dropdowns: "flex items-center justify-center gap-1",
        dropdown_month:
          "relative inline-flex items-center rounded-md px-1.5 py-0.5 hover:bg-accent",
        dropdown_year:
          "relative inline-flex items-center rounded-md px-1.5 py-0.5 hover:bg-accent",
        dropdown: "absolute inset-0 w-full cursor-pointer opacity-0",
        dropdown_icon: "ml-0.5 size-3.5 opacity-60",
        vhidden: "sr-only",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell: cn("text-muted-foreground rounded-md font-normal", sizes.head),
        row: "flex w-full mt-2",
        weeknumber: cn(
          "text-muted-foreground flex items-center justify-center text-xs",
          sizes.day,
        ),
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "p-0 font-normal aria-selected:opacity-100",
          sizes.day,
        ),
        day_range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...iconProps }) => (
          <ChevronLeft className={cn("size-4", className)} {...iconProps} />
        ),
        IconRight: ({ className, ...iconProps }) => (
          <ChevronRight className={cn("size-4", className)} {...iconProps} />
        ),
        ...components,
      }}
      modifiers={mergedModifiers}
      modifiersClassNames={mergedModifierClassNames}
      disabled={mergedDisabled}
      footer={composedFooter}
      {...(props as React.ComponentProps<typeof DayPicker>)}
      month={currentMonth}
      onMonthChange={handleMonthChange}
    />
  );
}

function formatDate(date: Date, locale?: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale, options ?? { dateStyle: "medium" }).format(
    date,
  );
}

type PickerCalendarProps = Omit<
  CalendarProps,
  "mode" | "selected" | "onSelect" | "numberOfMonths"
>;

interface DatePickerProps {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  locale?: string;
  formatOptions?: Intl.DateTimeFormatOptions;
  disabled?: boolean;
  className?: string;
  align?: "start" | "center" | "end";
  calendarProps?: PickerCalendarProps;
  id?: string;
  closeOnSelect?: boolean;
}

function DatePicker({
  value,
  defaultValue,
  onChange,
  placeholder = "Pick a date",
  locale,
  formatOptions,
  disabled,
  className,
  align = "start",
  calendarProps,
  id,
  closeOnSelect = true,
}: DatePickerProps) {
  const [internal, setInternal] = React.useState<Date | undefined>(defaultValue);
  const [open, setOpen] = React.useState(false);
  const isControlled = value !== undefined;
  const selected = isControlled ? value : internal;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          data-empty={!selected}
          className={cn(
            "data-[empty=true]:text-muted-foreground w-[240px] justify-start text-left font-normal",
            className,
          )}
        >
          <CalendarIcon />
          {selected ? formatDate(selected, locale, formatOptions) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align} size="fit">
        <Calendar
          {...(calendarProps as CalendarExtras)}
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            if (!isControlled) setInternal(date);
            onChange?.(date);
            if (closeOnSelect && date) setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

interface DateRangePickerProps {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  locale?: string;
  formatOptions?: Intl.DateTimeFormatOptions;
  disabled?: boolean;
  className?: string;
  align?: "start" | "center" | "end";
  calendarProps?: PickerCalendarProps;
  numberOfMonths?: number;
  id?: string;
  closeOnComplete?: boolean;
}

function DateRangePicker({
  value,
  defaultValue,
  onChange,
  placeholder = "Pick a date range",
  locale,
  formatOptions,
  disabled,
  className,
  align = "start",
  calendarProps,
  numberOfMonths = 2,
  id,
  closeOnComplete = true,
}: DateRangePickerProps) {
  const [internal, setInternal] = React.useState<DateRange | undefined>(defaultValue);
  const [open, setOpen] = React.useState(false);
  const isControlled = value !== undefined;
  const selected = isControlled ? value : internal;

  const label = React.useMemo(() => {
    if (!selected?.from) return placeholder;
    const from = formatDate(selected.from, locale, formatOptions);
    if (!selected.to) return from;
    return `${from} – ${formatDate(selected.to, locale, formatOptions)}`;
  }, [selected, placeholder, locale, formatOptions]);

  const applyRange = (range: DateRange | undefined) => {
    if (!isControlled) setInternal(range);
    onChange?.(range);
    if (closeOnComplete && range?.from && range.to && range.from.getTime() !== range.to.getTime()) {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          data-empty={!selected?.from}
          className={cn(
            "data-[empty=true]:text-muted-foreground w-[300px] justify-start text-left font-normal",
            className,
          )}
        >
          <CalendarIcon />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align} size="fit">
        <Calendar
          {...(calendarProps as CalendarExtras)}
          mode="range"
          selected={selected}
          defaultMonth={selected?.from}
          numberOfMonths={numberOfMonths}
          onPresetSelect={(preset) => {
            if (isRange(preset)) applyRange(preset);
          }}
          onSelect={applyRange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export { Calendar, DatePicker, DateRangePicker };
export type {
  CalendarProps,
  CalendarPreset,
  CalendarSize,
  DatePickerProps,
  DateRangePickerProps,
};
