import React, { memo, useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  CheckCircle2,
  ListTodo,
  Clock,
  AlertTriangle,
  Calendar,
  Star,
  ArrowRight,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Task, Category } from '../types';
import { calculateTaskStats } from '../utils/taskUtils';
import { formatDateTime, isOverdue, isToday } from '../utils/dateUtils';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Checkbox } from './ui/checkbox';

export type DashboardStatKey = 'total' | 'active' | 'completed' | 'overdue';

interface DashboardProps {
  tasks: Task[];
  categories: Category[];
  onViewTasks: () => void;
  theme: 'light' | 'dark';
  /** Optional: make stat cards clickable (e.g. jump to the task list with a filter). */
  onStatClick?: (key: DashboardStatKey) => void;
  /** Optional: lets users tick off tasks straight from the "Up next" list. */
  onToggleComplete?: (taskId: string) => void;
  /** Optional: shows an "Add task" button in the hero and the empty state. */
  onAddTask?: () => void;
  /** Optional display name for the greeting. */
  userName?: string;
}

type PriorityKey = 'high' | 'medium' | 'low';

const PRIORITY_META: Record<PriorityKey, { label: string; bar: string; dot: string }> = {
  high: { label: 'High Priority', bar: 'bg-red-500', dot: 'bg-red-500' },
  medium: { label: 'Medium Priority', bar: 'bg-yellow-500', dot: 'bg-yellow-500' },
  low: { label: 'Low Priority', bar: 'bg-green-500', dot: 'bg-green-500' },
};

function greeting(hour: number) {
  if (hour < 5) return 'Burning the midnight oil';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

/** Small count-up for headline numbers. Skips animation for reduced motion. */
function CountUp({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setN(value);
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / 800, 1);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, reduce]);

  return <>{n}</>;
}

function DashboardComponent({
  tasks,
  categories,
  onViewTasks,
  theme,
  onStatClick,
  onToggleComplete,
  onAddTask,
  userName,
}: DashboardProps) {
  const isDark = theme === 'dark';
  const reduce = useReducedMotion();
  const stats = useMemo(() => calculateTaskStats(tasks, categories), [tasks, categories]);

  const strong = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-gray-400' : 'text-gray-600';
  const body = isDark ? 'text-gray-300' : 'text-gray-700';
  const cardCls = isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200';
  const innerCls = isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200';

  const fade = (delay: number, axis: 'y' | 'x' = 'y', dist = 16) => ({
    initial: { opacity: 0, [axis]: reduce ? 0 : dist },
    animate: { opacity: 1, [axis]: 0 },
    transition: { delay: reduce ? 0 : delay },
  });

  /* ---- Up next: soonest-due open tasks (overdue first) ---- */
  const upNext = useMemo(
    () =>
      tasks
        .filter((t) => !t.completed && t.dueDate)
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
        .slice(0, 5),
    [tasks],
  );

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const statCards: {
    key: DashboardStatKey;
    title: string;
    value: number;
    icon: React.ReactNode;
    bg: string;
    iconColor: string;
    hint?: string;
  }[] = [
    { key: 'total', title: 'Total Tasks', value: stats.total, icon: <ListTodo className="h-6 w-6" />, bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50', iconColor: 'text-blue-500' },
    { key: 'active', title: 'Active Tasks', value: stats.active, icon: <Clock className="h-6 w-6" />, bg: isDark ? 'bg-purple-500/10' : 'bg-purple-50', iconColor: 'text-purple-500' },
    { key: 'completed', title: 'Completed', value: stats.completed, icon: <CheckCircle2 className="h-6 w-6" />, bg: isDark ? 'bg-green-500/10' : 'bg-green-50', iconColor: 'text-green-500' },
    {
      key: 'overdue',
      title: 'Overdue',
      value: stats.overdue,
      icon: <AlertTriangle className="h-6 w-6" />,
      bg: isDark ? 'bg-red-500/10' : 'bg-red-50',
      iconColor: 'text-red-500',
      hint: stats.overdue > 0 ? 'Needs attention' : undefined,
    },
  ];

  const priorityTotal = stats.byPriority.high + stats.byPriority.medium + stats.byPriority.low;
  const heroMessage =
    stats.total === 0
      ? 'Your list is empty — add your first task to get started.'
      : stats.active === 0
      ? 'Everything is done. Enjoy the clear head! 🎉'
      : stats.overdue > 0
      ? `You have ${stats.active} active tasks, ${stats.overdue} of them overdue.`
      : stats.dueToday > 0
      ? `You have ${stats.active} active tasks, ${stats.dueToday} due today.`
      : `You have ${stats.active} active tasks. Let's get things done! 🚀`;

  /* ---- Empty state ---- */
  if (tasks.length === 0) {
    return (
      <motion.div {...fade(0)} className="space-y-6">
        <Card className={`flex flex-col items-center gap-4 p-12 text-center ${cardCls}`}>
          <div className={`rounded-2xl p-4 ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
            <Sparkles className="h-8 w-8 text-blue-500" />
          </div>
          <h2 className={`text-2xl ${strong}`}>{greeting(new Date().getHours())}{userName ? `, ${userName}` : ''}!</h2>
          <p className={`max-w-md text-sm ${muted}`}>{heroMessage}</p>
          {onAddTask && (
            <Button onClick={onAddTask} size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="mr-2 h-5 w-5" />
              Add your first task
            </Button>
          )}
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        {...fade(0, 'y', -16)}
        className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6 text-white ${
          isDark ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'
        }`}
      >
        <div>
          <h2 className="mb-2 text-3xl">
            {greeting(new Date().getHours())}
            {userName ? `, ${userName}` : ''}!
          </h2>
          <p className="opacity-90">{heroMessage}</p>
        </div>
        {onAddTask && (
          <Button onClick={onAddTask} variant="secondary" className="shrink-0 bg-white/20 text-white hover:bg-white/30">
            <Plus className="mr-1.5 h-4 w-4" />
            New task
          </Button>
        )}
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const clickable = !!onStatClick;
          const Inner = (
            <Card className={`p-6 transition-shadow ${cardCls} ${clickable ? 'hover:shadow-lg' : ''}`}>
              <div className="mb-4 flex items-center justify-between">
                <div className={`rounded-lg p-3 ${stat.bg}`}>
                  <div className={stat.iconColor}>{stat.icon}</div>
                </div>
                <div className={`text-3xl tabular-nums ${strong}`}>
                  <CountUp value={stat.value} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-sm ${muted}`}>{stat.title}</p>
                {stat.hint && <span className="text-xs text-red-500">{stat.hint}</span>}
              </div>
            </Card>
          );
          return (
            <motion.div key={stat.key} {...fade(index * 0.08)} whileHover={clickable && !reduce ? { y: -3 } : undefined}>
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onStatClick!(stat.key)}
                  aria-label={`${stat.title}: ${stat.value}. View tasks`}
                  className="block w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                >
                  {Inner}
                </button>
              ) : (
                Inner
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Overall progress */}
      <motion.div {...fade(0.35)}>
        <Card className={`p-6 ${cardCls}`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className={`text-lg ${strong}`}>Overall Progress</h3>
              <p className={`text-sm ${muted}`}>
                {stats.completed} of {stats.total} tasks completed
              </p>
            </div>
            <div className={`text-3xl tabular-nums ${strong}`}>{stats.completionRate}%</div>
          </div>
          <Progress value={stats.completionRate} className="h-3" aria-label="Overall completion rate" />
        </Card>
      </motion.div>

      {/* Priority + deadlines */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div {...fade(0.45, 'x', -16)}>
          <Card className={`h-full p-6 ${cardCls}`}>
            <h3 className={`mb-4 flex items-center gap-2 text-lg ${strong}`}>
              <Star className="h-5 w-5 text-yellow-500" />
              Priority Breakdown
            </h3>

            {/* Stacked distribution bar */}
            {priorityTotal > 0 && (
              <div
                className={`mb-5 flex h-2.5 w-full overflow-hidden rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                role="img"
                aria-label={`High ${stats.byPriority.high}, medium ${stats.byPriority.medium}, low ${stats.byPriority.low}`}
              >
                {(Object.keys(PRIORITY_META) as PriorityKey[]).map((k) => (
                  <motion.div
                    key={k}
                    className={PRIORITY_META[k].bar}
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats.byPriority[k] / priorityTotal) * 100}%` }}
                    transition={{ duration: reduce ? 0 : 0.8, delay: 0.5 }}
                  />
                ))}
              </div>
            )}

            <div className="space-y-4">
              {(Object.keys(PRIORITY_META) as PriorityKey[]).map((k) => (
                <div key={k} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${PRIORITY_META[k].dot}`} />
                    <span className={`text-sm ${body}`}>{PRIORITY_META[k].label}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-xs ${muted}`}>
                      {priorityTotal ? Math.round((stats.byPriority[k] / priorityTotal) * 100) : 0}%
                    </span>
                    <span className={`text-lg tabular-nums ${strong}`}>{stats.byPriority[k]}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div {...fade(0.5, 'x', 16)}>
          <Card className={`h-full p-6 ${cardCls}`}>
            <h3 className={`mb-4 flex items-center gap-2 text-lg ${strong}`}>
              <Calendar className="h-5 w-5 text-blue-500" />
              Up Next
            </h3>

            <div className="mb-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Due Today', value: stats.dueToday },
                { label: 'Due This Week', value: stats.dueThisWeek },
              ].map((d) => (
                <div key={d.label} className={`rounded-lg p-3 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${muted}`}>{d.label}</p>
                  <p className={`text-xl tabular-nums ${strong}`}>{d.value}</p>
                </div>
              ))}
            </div>

            {upNext.length === 0 ? (
              <p className={`py-4 text-center text-sm ${muted}`}>No upcoming deadlines. 🎯</p>
            ) : (
              <ul className="space-y-2">
                {upNext.map((t) => {
                  const overdue = isOverdue(t.dueDate!);
                  const today = isToday(t.dueDate!);
                  const cat = t.categoryId ? categoryById.get(t.categoryId) : undefined;
                  return (
                    <li key={t.id} className={`flex items-center gap-3 rounded-lg p-2.5 ${isDark ? 'bg-gray-700/40' : 'bg-gray-50'}`}>
                      {onToggleComplete && (
                        <Checkbox
                          checked={t.completed}
                          onCheckedChange={() => onToggleComplete(t.id)}
                          aria-label={`Mark "${t.title}" complete`}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm ${strong}`}>{t.title}</p>
                        <p className={`text-xs ${overdue ? 'text-red-500' : today ? 'text-orange-500' : muted}`}>
                          {overdue ? 'Overdue · ' : today ? 'Today · ' : ''}
                          {formatDateTime(t.dueDate!)}
                        </p>
                      </div>
                      {cat && (
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: cat.color }}
                          title={cat.name}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <motion.div {...fade(0.6)}>
          <Card className={`p-6 ${cardCls}`}>
            <h3 className={`mb-4 text-lg ${strong}`}>Tasks by Category</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, index) => {
                const count = stats.byCategory[category.id] || 0;
                const share = stats.total ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, scale: reduce ? 1 : 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: reduce ? 0 : 0.65 + index * 0.04 }}
                    className={`rounded-lg border p-4 ${innerCls}`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                      <p className={`truncate text-sm ${body}`}>{category.name}</p>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <p className={`text-2xl tabular-nums ${strong}`}>{count}</p>
                      <span className={`text-xs ${muted}`}>{share}%</span>
                    </div>
                    <div className={`mt-2 h-1 w-full overflow-hidden rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: category.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${share}%` }}
                        transition={{ duration: reduce ? 0 : 0.8, delay: 0.7 + index * 0.05 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div {...fade(0.75)} className="flex justify-center">
        <Button
          onClick={onViewTasks}
          size="lg"
          className="bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700"
        >
          View All Tasks
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.div>
    </div>
  );
}

export const Dashboard = memo(DashboardComponent);
