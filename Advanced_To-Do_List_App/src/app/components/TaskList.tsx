// src/app/components/TaskList.tsx
import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { ChevronDown, Filter, FilterX, SortAsc } from 'lucide-react';
import type { Task, Category, FilterState } from '../types';
import { filterTasks, sortTasks } from '../utils/taskUtils';
import { getFromStorage, saveToStorage } from '../utils/storage';
import { TaskCard } from './TaskCard';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

/* ─────────────────────────── Types & constants ─────────────────────────── */

type SortBy = 'manual' | 'priority' | 'dueDate' | 'created';
type GroupBy = 'none' | 'priority' | 'category';

interface Group {
  key: string;
  label: string;
  color?: string;
  tasks: Task[];
}

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  filters: FilterState;
  onToggleComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onReorderTasks: (tasks: Task[]) => void;
  /** Optional: shows a "Clear filters" button in the empty state */
  onClearFilters?: () => void;
  theme: 'light' | 'dark';
}

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'manual', label: 'Manual (drag to arrange)' },
  { value: 'priority', label: 'Priority' },
  { value: 'dueDate', label: 'Due date' },
  { value: 'created', label: 'Newest first' },
];

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'priority', label: 'Priority' },
  { value: 'category', label: 'Category' },
];

const PRIORITY_GROUPS: { key: Task['priority']; label: string; color: string }[] = [
  { key: 'high', label: 'High Priority', color: '#ef4444' },
  { key: 'medium', label: 'Medium Priority', color: '#f59e0b' },
  { key: 'low', label: 'Low Priority', color: '#10b981' },
];

const SORT_KEY = 'taskList:sortBy';
const GROUP_KEY = 'taskList:groupBy';

/* ─────────────────────────── Helpers ─────────────────────────── */

function useStoredChoice<T extends string>(key: string, options: readonly { value: T }[], fallback: T) {
  const [value, setValue] = useState<T>(() => {
    const saved = getFromStorage<string>(key, fallback);
    return options.some(o => o.value === saved) ? (saved as T) : fallback;
  });
  const update = useCallback((next: T) => {
    setValue(next);
    saveToStorage(key, next);
  }, [key]);
  return [value, update] as const;
}

const toTime = (v?: string): number | null => {
  if (!v) return null;
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? null : t;
};

function sortByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const da = toTime(a.dueDate);
    const db = toTime(b.dueDate);
    if (da !== null && db === null) return -1;
    if (da === null && db !== null) return 1;
    if (da !== null && db !== null && da !== db) return da - db;
    return (toTime(b.createdAt) ?? 0) - (toTime(a.createdAt) ?? 0);
  });
}

function sortByCreated(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => (toTime(b.createdAt) ?? 0) - (toTime(a.createdAt) ?? 0));
}

/**
 * Put `ordered` back into the FULL list. Each visible task takes the next
 * visible "slot"; hidden (filtered-out) tasks keep their exact positions,
 * so nothing is ever lost when a filter is active.
 */
function mergeOrder(all: Task[], ordered: Task[]): Task[] {
  const visible = new Set(ordered.map(t => t.id));
  let i = 0;
  return all.map(t => (visible.has(t.id) ? ordered[i++] : t));
}

/* ─────────────────────────── Component ─────────────────────────── */

export function TaskList({
  tasks,
  categories,
  filters,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onReorderTasks,
  onClearFilters,
  theme,
}: TaskListProps) {
  const dark = theme === 'dark';
  const [sortBy, setSortBy] = useStoredChoice<SortBy>(SORT_KEY, SORT_OPTIONS, 'priority');
  const [groupBy, setGroupBy] = useStoredChoice<GroupBy>(GROUP_KEY, GROUP_OPTIONS, 'none');
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
