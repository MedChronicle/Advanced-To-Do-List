import React, { memo, useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  CheckSquare,
  AlertCircle,
  Calendar,
  Star,
  X,
  TrendingUp,
  ChevronDown,
  FilterX,
} from 'lucide-react';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Category, FilterState, Task } from '../types';
import { isOverdue, isToday } from '../utils/dateUtils';

type View = 'dashboard' | 'tasks' | 'progress';

/**
 * NOTE: the "Today" and "Overdue" quick filters use two optional boolean keys on
 * FilterState. Add them to your type:
 *   dueToday?: boolean;
 *   overdue?: boolean;
 * and apply them where you filter tasks. Until then they are simply ignored.
 */
type ExtendedFilters = FilterState & { dueToday?: boolean; overdue?: boolean };

interface SidebarProps {
  view: View;
  onViewChange: (view: View) => void;
  categories: Category[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  tasks: Task[];
  theme: 'light' | 'dark';
}

function SidebarComponent({
  view,
  onViewChange,
  categories,
  filters: rawFilters,
  onFilterChange,
  tasks,
  theme,
}: SidebarProps) {
  const isDark = theme === 'dark';
  const filters = rawFilters as ExtendedFilters;
  const [categoriesOpen, setCategoriesOpen] = useState(true);

  /* ---- Single pass over tasks for every count ---- */
  const stats = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    let active = 0;
    let completed = 0;
    let high = 0;
    let today = 0;
    let overdue = 0;

    for (const t of tasks) {
      if (t.completed) {
        completed++;
        continue;
      }
      active++;
      if (t.priority === 'high') high++;
      if (t.categoryId) categoryCounts[t.categoryId] = (categoryCounts[t.categoryId] ?? 0) + 1;
      if (t.dueDate) {
        if (isOverdue(t.dueDate)) overdue++;
        else if (isToday(t.dueDate)) today++;
      }
    }
    const total = tasks.length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { categoryCounts, active, completed, high, today, overdue, total, percent };
  }, [tasks]);

  const hasActiveFilters = !!(
    filters.search ||
    filters.priority ||
    filters.category ||
    filters.dueToday ||
    filters.overdue
  );

  const categoryName = useMemo(
    () => categories.find((c) => c.id === filters.category)?.name,
    [categories, filters.category],
  );

  /** Every quick filter resets the others, so the sidebar never shows two active at once. */
  const applyFilter = useCallback(
    (patch: Partial<ExtendedFilters>) => {
      onViewChange('tasks');
      onFilterChange({
        ...filters,
        category: null,
        priority: null,
        status: null,
        dueToday: false,
        overdue: false,
        ...patch,
      } as FilterState);
    },
    [filters, onFilterChange, onViewChange],
  );

  const clearAll = useCallback(() => {
    onFilterChange({
      ...filters,
      search: '',
      category: null,
      priority: null,
      status: null,
      dueToday: false,
      overdue: false,
    } as FilterState);
  }, [filters, onFilterChange]);

  const noQuickFilter =
    !filters.category && !filters.priority && !filters.dueToday && !filters.overdue;

  const labelStyle = `text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`;
  const sepStyle = `my-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`;

  return (
    <aside
      aria-label="Sidebar"
      className={`hidden w-64 flex-shrink-0 border-r backdrop-blur-xl transition-all duration-300 md:block ${
        isDark
          ? 'border-[#2a2a2a] bg-[#1a1a1a]/90 shadow-2xl shadow-black/30'
          : 'border-gray-200 bg-white/90 shadow-lg shadow-gray-200/50'
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="p-6">
          <h2 className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Navigation</h2>
        </div>

        <nav aria-label="Primary" className="flex-1 space-y-1 overflow-y-auto px-3">
          <NavItem
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Dashboard"
            active={view === 'dashboard'}
            onClick={() => onViewChange('dashboard')}
            theme={theme}
          />

          <NavItem
            icon={<CheckSquare className="h-5 w-5" />}
            label="All Tasks"
            active={view === 'tasks' && noQuickFilter}
            onClick={() => applyFilter({})}
            count={stats.active}
            theme={theme}
          />

          <NavItem
            icon={<TrendingUp className="h-5 w-5" />}
            label="Progress"
            active={view === 'progress'}
            onClick={() => onViewChange('progress')}
            theme={theme}
          />

          <Separator className={sepStyle} />

          <div className="mb-2 px-3">
            <p className={labelStyle}>Quick Filters</p>
          </div>

          <NavItem
            icon={<Star className="h-5 w-5" />}
            label="High Priority"
            active={view === 'tasks' && filters.priority === 'high'}
            onClick={() => applyFilter({ priority: 'high' as any })}
            count={stats.high}
            theme={theme}
          />

          <NavItem
            icon={<Calendar className="h-5 w-5" />}
            label="Today"
            active={view === 'tasks' && !!filters.dueToday}
            onClick={() => applyFilter({ dueToday: true })}
            count={stats.today}
            theme={theme}
          />

          <NavItem
            icon={<AlertCircle className="h-5 w-5" />}
            label="Overdue"
            active={view === 'tasks' && !!filters.overdue}
            onClick={() => applyFilter({ overdue: true })}
            count={stats.overdue}
            countTone="danger"
            theme={theme}
          />

          <Separator className={sepStyle} />

          <button
            type="button"
            onClick={() => setCategoriesOpen((o) => !o)}
            aria-expanded={categoriesOpen}
            className="mb-2 flex w-full items-center justify-between rounded px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
          >
            <span className={labelStyle}>Categories</span>
            <motion.span animate={{ rotate: categoriesOpen ? 0 : -90 }} className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {categoriesOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1 overflow-hidden"
              >
                {categories.length === 0 && (
                  <p className={`px-3 py-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    No categories yet
                  </p>
                )}
                {categories.map((category) => (
                  <NavItem
                    key={category.id}
                    icon={
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    }
                    label={category.name}
                    active={view === 'tasks' && filters.category === category.id}
                    onClick={() => applyFilter({ category: category.id })}
                    count={stats.categoryCounts[category.id] ?? 0}
                    theme={theme}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Separator className={sepStyle} />
                <div className="mb-2 flex items-center justify-between px-3">
                  <p className={labelStyle}>Active Filters</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="h-6 gap-1 px-1.5 text-xs"
                  >
                    <FilterX className="h-3 w-3" />
                    Clear
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 px-3">
                  {filters.search && (
                    <FilterChip
                      label={`Search: ${filters.search}`}
                      onRemove={() => onFilterChange({ ...filters, search: '' } as FilterState)}
                    />
                  )}
                  {filters.priority && (
                    <FilterChip
                      label={`Priority: ${filters.priority}`}
                      onRemove={() => onFilterChange({ ...filters, priority: null } as FilterState)}
                    />
                  )}
                  {filters.category && (
                    <FilterChip
                      label={`Category: ${categoryName ?? 'Unknown'}`}
                      onRemove={() => onFilterChange({ ...filters, category: null } as FilterState)}
                    />
                  )}
                  {filters.dueToday && (
                    <FilterChip
                      label="Due today"
                      onRemove={() => onFilterChange({ ...filters, dueToday: false } as FilterState)}
                    />
                  )}
                  {filters.overdue && (
                    <FilterChip
                      label="Overdue"
                      onRemove={() => onFilterChange({ ...filters, overdue: false } as FilterState)}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Footer: overall completion */}
        <div className={`border-t p-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`mb-2 flex items-center justify-between text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <span>
              {stats.completed} of {stats.total} completed
            </span>
            <span className="tabular-nums">{stats.percent}%</span>
          </div>
          <Progress value={stats.percent} className="h-1.5" aria-label="Overall completion" />
        </div>
      </div>
    </aside>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge variant="secondary" className="flex max-w-full items-center gap-1 pr-1">
      <span className="max-w-[140px] truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter ${label}`}
        className="rounded p-0.5 hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:hover:bg-white/10"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
  countTone?: 'default' | 'danger';
  theme: 'light' | 'dark';
}

const NavItem = memo(function NavItem({
  icon,
  label,
  active,
  onClick,
  count,
  countTone = 'default',
  theme,
}: NavItemProps) {
  const isDark = theme === 'dark';
  const danger = countTone === 'danger' && !active;

  return (
    <motion.button
      type="button"
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 ${
        active
          ? isDark
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
            : 'bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-md shadow-blue-400/30'
          : isDark
          ? 'text-gray-300 hover:bg-[#2a2a2a]'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        {icon}
        <span className="truncate text-sm">{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <Badge
          variant={active ? 'secondary' : 'outline'}
          className={
            active
              ? 'border-white/30 bg-white/20 text-white'
              : danger
              ? 'border-red-500/30 bg-red-500/10 text-red-500'
              : ''
          }
        >
          {count}
        </Badge>
      )}
    </motion.button>
  );
});

export const Sidebar = memo(SidebarComponent);
