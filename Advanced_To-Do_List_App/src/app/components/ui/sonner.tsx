"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast, type ToasterProps } from "sonner";
import {
  CheckCircle2,
  Info,
  Loader2,
  OctagonX,
  TriangleAlert,
  X,
} from "lucide-react";

type AppTheme = NonNullable<ToasterProps["theme"]>;

interface AppToasterProps extends ToasterProps {
  /**
   * Pass the app's own theme ("light" | "dark") when you are NOT using
   * next-themes. If omitted, the theme comes from next-themes, and falls back
   * to "system" when no ThemeProvider is present.
   */
  appTheme?: "light" | "dark";
}

const Toaster = ({ appTheme, ...props }: AppToasterProps) => {
  // useTheme() safely returns an empty object outside a <ThemeProvider>.
  const { theme: nextTheme } = useTheme();
  const theme: AppTheme = appTheme ?? ((nextTheme as AppTheme) || "system");

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="bottom-right"
      closeButton
      visibleToasts={4}
      gap={10}
      // Slightly longer than the default so people can actually read longer messages.
      duration={4500}
      icons={{
        success: <CheckCircle2 className="size-4 text-green-500" />,
        info: <Info className="size-4 text-blue-500" />,
        warning: <TriangleAlert className="size-4 text-yellow-500" />,
        error: <OctagonX className="size-4 text-red-500" />,
        loading: <Loader2 className="size-4 animate-spin" />,
        close: <X className="size-3" />,
      }}
      toastOptions={{
        classNames: {
          toast: "group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
          title: "group-[.toast]:font-medium",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

/**
 * Handy presets so call sites stay one-liners and consistent.
 *
 *   notify.success("Task completed");
 *   notify.undo("Task deleted", () => restoreTask(id));
 *   notify.promise(saveTask(), { loading: "Saving…", success: "Saved", error: "Couldn't save" });
 */
const notify = {
  success: (message: string, description?: string) =>
    toast.success(message, { description }),
  error: (message: string, description?: string) =>
    toast.error(message, { description }),
  info: (message: string, description?: string) =>
    toast.info(message, { description }),
  warning: (message: string, description?: string) =>
    toast.warning(message, { description }),
  /** A message with an Undo button, ideal for destructive actions. */
  undo: (message: string, onUndo: () => void) =>
    toast(message, {
      duration: 6000,
      action: { label: "Undo", onClick: onUndo },
    }),
  promise: toast.promise,
  dismiss: toast.dismiss,
};

export { Toaster, toast, notify };
