import * as React from "react";

/** Tailwind-compatible breakpoints (px). */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

const MOBILE_BREAKPOINT = BREAKPOINTS.md;

/**
 * Subscribe to any CSS media query.
 *
 * Built on useSyncExternalStore, so it is tear-free in concurrent React,
 * reads the correct value on the very first client render (no flash of the
 * wrong layout) and is SSR-safe via `getServerSnapshot`.
 *
 * @param query  A media query string, e.g. "(max-width: 767px)".
 * @param serverFallback  Value to use during SSR / hydration. Defaults to false.
 */
export function useMediaQuery(query: string, serverFallback = false): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = React.useCallback(
    () =>
      typeof window !== "undefined" && !!window.matchMedia
        ? window.matchMedia(query).matches
        : serverFallback,
    [query, serverFallback],
  );

  return React.useSyncExternalStore(subscribe, getSnapshot, () => serverFallback);
}

/** True below the `md` breakpoint (< 768px). Same API as before. */
export function useIsMobile(serverFallback = false): boolean {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`, serverFallback);
}

/** True at or above the given breakpoint, e.g. useBreakpoint("lg"). */
export function useBreakpoint(bp: Breakpoint, serverFallback = false): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS[bp]}px)`, serverFallback);
}

/** Respect the user's OS-level "reduce motion" setting. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** Detects a touch-first device (no hover, coarse pointer). */
export function useIsTouchDevice(): boolean {
  return useMediaQuery("(hover: none) and (pointer: coarse)");
}

/** Detects the OS color scheme preference. */
export function usePrefersDark(): boolean {
  return useMediaQuery("(prefers-color-scheme: dark)");
}
