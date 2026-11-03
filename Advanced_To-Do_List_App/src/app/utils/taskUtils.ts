// src/app/utils/taskUtils.ts
import type { Task, TaskStats, FilterState, Category } from '../types';
import { isToday, isThisWeek, isOverdue } from './dateUtils';

type Priority = Task['priority'];

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

/** Date → timestamp. Missing or invalid dates return null instead of NaN. */
function toTime(value?: string | null): number | null {
  if (!value) return null;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? null : t;
}

/** Lowercase and strip accents, so "cafe" matches "café". */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/* ─────────────────────────── Stats ─────────────────────────── */

/** One pass over the tasks, instead of ten separate .filter() scans. */
export function calculateTaskStats(tasks: Task[], categories: Category[]): TaskStats {
  const byPriority = { high: 0, medium: 0, low: 0 };
  const byCategory: Record<string, number> = {};
  for (const cat of categories) byCategory[cat.id] = 0;

  let completed = 0;
  let overdue = 0;
  let dueToday = 0;
  let dueThisWeek = 0;

  for (const t of tasks) {
    if (t.completed) {
      completed++;
      continue;
    }

    // Open tasks only from here on
    if (t.priority in byPriority) byPriority[t.priority]++;
    if (t.categoryId && t.categoryId in byCategory) byCategory[t.categoryId]++;

    if (t.dueDate) {
      if (isOverdue(t.dueDate)) overdue++;
      if (isToday(t.dueDate)) dueToday++;
      if (isThisWeek(t.dueDate)) dueThisWeek++;
    }
  }

  const total = tasks.length;

  return {
    total,
    completed,
    active: total - completed,
    overdue,
    dueToday,
    dueThisWeek,
    byPriority,
    byCategory,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

/* ─────────────────────────── Filtering ─────────────────────────── */

/**
 * Search is multi-word AND: "report friday" needs both words somewhere in the
 * title, description or tags. Accent- and case-insensitive.
 */
export function filterTasks(tasks: Task[], filters: FilterState): Task[] {
  const terms = filters.search ? normalize(filters.search).split(/\s+/).filter(Boolean) : [];

  // Nothing active: return the same array reference so memoized children don't re-render
  if (!terms.length && !filters.category && !filters.priority && !filters.status) return tasks;

  return tasks.filter(task => {
    if (filters.category && task.categoryId !== filters.category) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.status === 'completed' && !task.completed) return false;
    if (filters.status === 'active' && task.completed) return false;

    if (terms.length) {
      // `?? []` protects against tasks saved before `tags` existed
      const haystack = normalize(
        [task.title, task.description ?? '', ...(task.tags ?? [])].join(' ')
      );
      if (!terms.every(term => haystack.includes(term))) return false;
    }

    return true;
  });
}

/* ─────────────────────────── Sorting ─────────────────────────── */

/**
 * Completed last → priority → due date (soonest first, undated last) → newest first.
 * Returns a new array, and invalid dates can't poison the comparison with NaN.
 */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;

    const priorityDiff = (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3);
    if (priorityDiff !== 0) return priorityDiff;

    const dueA = toTime(a.dueDate);
    const dueB = toTime(b.dueDate);
    if (dueA !== null && dueB === null) return -1;
    if (dueA === null && dueB !== null) return 1;
    if (dueA !== null && dueB !== null && dueA !== dueB) return dueA - dueB;

    return (toTime(b.createdAt) ?? 0) - (toTime(a.createdAt) ?? 0);
  });
}

/* ─────────────────────────── Per-task progress ─────────────────────────── */

export function getTaskCompletionPercentage(task: Task): number {
  const subtasks = task.subtasks ?? [];
  if (subtasks.length === 0) return task.completed ? 100 : 0;

  const done = subtasks.filter(st => st.completed).length;
  return Math.round((done / subtasks.length) * 100);
}

/* ─────────────────────────── New helpers (opt-in) ─────────────────────────── */

/** Filter + sort in one call, ready for `useMemo(() => getVisibleTasks(tasks, filters), [tasks, filters])`. */
export
