// src/app/types/index.ts

/* ─────────────────────────── Literal unions (single source of truth) ─────────────────────────── */

// Each list is defined once. The type is derived from it, so a dropdown, a validator
// and the type can never drift apart.
export const PRIORITIES = ['high', 'medium', 'low'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const TASK_STATUSES = ['active', 'completed'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const VIEWS = ['dashboard', 'tasks', 'progress'] as const;
export type View = (typeof VIEWS)[number];

export const THEMES = ['light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

/* ─────────────────────────── Core entities ─────────────────────────── */

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  categoryId: string | null;
  /** ISO string. A date-only value ("2026-11-04") means "any time that day". */
  dueDate?: string;
  /** ISO string */
  reminder?: string;
  /** Estimated duration in minutes */
  duration?: number;
  subtasks: Subtask[];
  tags: string[];
  /** ISO strings */
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  /** CSS colour, e.g. "#3b82f6" */
  color: string;
}

/* ─────────────────────────── Derived task shapes ─────────────────────────── */

/** What the dialog hands to App.handleAddTask (id and timestamps are generated there). */
export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

/** Partial update for App.handleUpdateTask. The id can't be changed. */
export type TaskUpdate = Partial<Omit<Task, 'id'>>;

/* ─────────────────────────── Filters ─────────────────────────── */

export interface FilterState {
  search: string;
  category: string | null;
  priority: Priority | null;
  /** null and 'all' both mean "no status filter" */
  status: 'all' | TaskStatus | null;
}

export const EMPTY_FILTERS: Readonly<FilterState> = {
  search: '',
  category: null,
  priority: null,
  status: null,
};

/** True when any filter is narrowing the list (handy for a "Clear filters" button). */
export function hasActiveFilters(f: FilterState): boolean {
  return Boolean(f.search.trim() || f.category || f.priority || (f.status && f.status !== 'all'));
}

/* ─────────────────────────── Stats ─────────────────────────── */

export interface TaskStats {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  byPriority: Record<Priority, number>; // same shape as { high; medium; low }
  byCategory: Record<string, number>;
  completionRate: number;
}

/* ─────────────────────────── Display metadata ─────────────────────────── */

export const PRIORITY_META: Record<Priority, { label: string; color: string; rank: number }> = {
  high: { label: 'High', color: '#ef4444', rank: 0 },
  medium: { label: 'Medium', color: '#f59e0b', rank: 1 },
  low: { label: 'Low', color: '#10b981', rank: 2 },
};

export const DEFAULT_CATEGORIES: readonly Category[] = [
  { id: '1', name: 'Work', color: '#3b82f6' },
  { id: '2', name: 'Personal', color: '#10b981' },
  { id: '3', name: 'Communication Skills', color: '#f59e0b' },
  { id: '4', name: 'Health', color: '#ef4444' },
];

/* ─────────────────────────── Runtime type guards ─────────────────────────── */
// Types disappear at runtime, but localStorage data can be old or hand-edited.
// Use these as the `validate` argument of getFromStorage.

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isString = (v: unknown): v is string => typeof v === 'string';

export const isPriority = (v: unknown): v is Priority =>
  isString(v) && (PRIORITIES as readonly string[]).includes(v);

export function isSubtask(v: unknown): v is Subtask {
  return isObject(v) && isString(v.id) && isString(v.title) && typeof v.completed === 'boolean';
}

export function isTask(v: unknown): v is Task {
  return (
    isObject(v) &&
    isString(v.id) &&
    isString(v.title) &&
    typeof v.completed === 'boolean' &&
    isPriority(v.priority) &&
    (v.categoryId === null || isString(v.categoryId)) &&
    Array.isArray(v.subtasks) && v.subtasks.every(isSubtask) &&
    Array.isArray(v.tags) && v.tags.every(isString) &&
    isString(v.createdAt) &&
    isString(v.updatedAt)
  );
}

export const isTaskArray = (v: unknown): v is Task[] => Array.isArray(v) && v.every(isTask);

export function isCategory(v: unknown): v is Category {
  return isObject(v) && isString(v.id) && isString(v.name) && isString(v.color);
}

export const isCategoryArray = (v: unknown): v is Category[] => Array.isArray(v) && v.every(isCategory);

/**
 * Repair an older or partial task instead of dropping it:
 * fills in the fields that were added after it was saved. Returns null if it's hopeless.
 */
export function normalizeTask(raw: unknown): Task | null {
  if (!isObject(raw) || !isString(raw.id) || !isString(raw.title)) return null;
  const now = new Date().toISOString();

  return {
    ...(raw as Partial<Task>),
    id: raw.id,
    title: raw.title,
    completed: Boolean(raw.completed),
    priority: isPriority(raw.priority) ? raw.priority : 'medium',
    categoryId: isString(raw.categoryId) ? raw.categoryId : null,
    subtasks: Array.isArray(raw.subtasks) ? raw.subtasks.filter(isSubtask) : [],
    tags: Array.isArray(raw.tags) ? raw.tags.filter(isString) : [],
    createdAt: isString(raw.createdAt) ? raw.createdAt : now,
    updatedAt: isString(raw.updatedAt) ? raw.updatedAt : now,
  };
}
