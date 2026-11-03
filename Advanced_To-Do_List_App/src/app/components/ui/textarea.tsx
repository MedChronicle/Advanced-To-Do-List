"use client";

import * as React from "react";

import { cn } from "./utils";

interface TextareaProps extends React.ComponentProps<"textarea"> {
  /**
   * Grow with the content. Uses native `field-sizing: content` where supported
   * and a JS fallback elsewhere (Firefox, older Safari). Defaults to true.
   */
  autoResize?: boolean;
  /** Stop growing after this many rows and scroll instead. */
  maxRows?: number;
  /** Show a live character counter (shows "n / max" when `maxLength` is set). */
  showCount?: boolean;
  /** Extra classes for the wrapper that is rendered when `showCount` is on. */
  wrapperClassName?: string;
}

const supportsFieldSizing =
  typeof CSS !== "undefined" &&
  typeof CSS.supports === "function" &&
  CSS.supports("field-sizing", "content");

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      className,
      autoResize = true,
      maxRows,
      showCount = false,
      wrapperClassName,
      maxLength,
      value,
      defaultValue,
      onChange,
      rows,
      ...props
    },
    forwardedRef,
  ) {
    const innerRef = React.useRef<HTMLTextAreaElement>(null);
    const [length, setLength] = React.useState(
      () => String(value ?? defaultValue ?? "").length,
    );

    // Keep our own ref while still honouring the caller's ref (function or object).
    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );

    const resize = React.useCallback(() => {
      const el = innerRef.current;
      if (!el || !autoResize) return;

      // Fallback sizing for browsers without `field-sizing`.
      if (!supportsFieldSizing) {
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      }

      // Cap the height at maxRows and let the content scroll beyond it.
      if (maxRows) {
        const cs = getComputedStyle(el);
        const line = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
        const padding = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
        const border = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
        el.style.maxHeight = `${line * maxRows + padding + border}px`;
        el.style.overflowY = el.scrollHeight > el.clientHeight ? "auto" : "hidden";
      }
    }, [autoResize, maxRows]);

    // Re-measure whenever the value changes (controlled) or on mount.
    React.useLayoutEffect(resize, [resize, value]);

    // Re-measure when the width changes, because wrapping changes the height.
    React.useEffect(() => {
      const el = innerRef.current;
      if (!el || !autoResize || typeof ResizeObserver === "undefined") return;
      let lastWidth = el.offsetWidth;
      const ro = new ResizeObserver(() => {
        if (el.offsetWidth !== lastWidth) {
          lastWidth = el.offsetWidth;
          resize();
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    }, [autoResize, resize]);

    // Keep the counter in sync for controlled usage too.
    React.useEffect(() => {
      if (value !== undefined) setLength(String(value).length);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLength(e.target.value.length);
      resize();
      onChange?.(e);
    };

    const textarea = (
      <textarea
        ref={setRefs}
        data-slot="textarea"
        rows={rows}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        className={cn(
          "resize-none border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex min-h-16 w-full rounded-md border bg-input-background px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          autoResize && "field-sizing-content",
          className,
        )}
        {...props}
      />
    );

    if (!showCount) return textarea;

    const nearLimit = maxLength !== undefined && length >= maxLength * 0.9;
    const atLimit = maxLength !== undefined && length >= maxLength;

    return (
      <div className={cn("relative w-full", wrapperClassName)}>
        {textarea}
        <span
          aria-live="polite"
          className={cn(
            "text-muted-foreground mt-1 block text-right text-xs tabular-nums",
            nearLimit && "text-orange-500",
            atLimit && "text-destructive",
          )}
        >
          {maxLength !== undefined ? `${length} / ${maxLength}` : length}
        </span>
      </div>
    );
  },
);

export { Textarea };
export type { TextareaProps };
