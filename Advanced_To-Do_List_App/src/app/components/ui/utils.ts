import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names conditionally and resolve Tailwind conflicts.
 *
 * clsx handles conditionals / arrays / objects, twMerge makes the *last*
 * conflicting Tailwind utility win.
 *
 * @example
 * cn("px-2 py-1", isActive && "bg-blue-500", { "opacity-50": disabled });
 * cn("p-4", "p-2"); // -> "p-2"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
