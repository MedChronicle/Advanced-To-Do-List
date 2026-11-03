import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import {
  Calendar,
  Clock,
  Edit2,
  Trash2,
  AlertCircle,
  GripVertical,
  MoreVertical,
  Timer,
  ChevronDown,
  Copy,
  Flag,
  Repeat,
} from 'lucide-react';
import { Task, Category } from '../types';
import { formatDateTime, formatDuration, isOverdue, isToday } from '../utils/dateUtils';
import { getTaskCompletionPercentage } from '../utils/taskUtils';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

type Priority = 'high' | 'medium' | 'low';

interface TaskCardProps {
  task: Task;
  categories: Category[];
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  /** Optional advanced actions – the card hides the UI for any that aren't provided. */
  onDuplicate?: (task: Task) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onChangePriority?: (taskId: string, priority: Priority) => void;
  theme: 'light' | 'dark';
  index: number;
  moveTask: (dragIndex: number, hoverIndex: number) => void;
}

const ITEM_TYPE = 'TASK';

interface DragItem {
  index: number;
  id: string;
}

const PRIORITY_STYLES: Record<Priority, { bg: string; text: string; border: string; bar: string }> = {
  high: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', bar: 'bg-red-500' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20', bar: 'bg-yellow-500' },
  low: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20', bar: 'bg-green-500' },
};

/** Human friendly "in 3 days" / "2 hours ago" label. */
function relativeTime(date: Date | string | number): string {
  const target = new Date(date).getTime();
  const diffMs = target - Date.now();
  const abs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['day', 86_400_000],
    ['hour', 3_600_000],
    ['minute', 60_000],
  ];
  for (const [unit, ms] of units) {
    if (abs >= ms) return rtf.format(Math.round(diffMs / ms), unit);
  }
  return 'just now';
}

function TaskCardComponent({
  task,
  categories,
  onToggleComplete,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleSubtask,
  onChangePriority,
  theme,
  index,
  moveTask,
}: TaskCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isDark = theme === 'dark';
  const muted = isDark ? 'text-gray-400' : 'text-gray-600';

  /* ---------------- Drag & drop ---------------- */
  const [{ isDragging }, drag, preview] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: ITEM_TYPE,
    item: { index, id: task.id },
    // Only the grip handle starts a drag, so text selection & clicks still work.
    canDrag: () => !task.completed || true,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: ITEM_TYPE,
    collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) }),
    hover: (item, monitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      // Only reorder once the cursor crosses the midpoint – prevents flicker.
      const rect = ref.current.getBoundingClientRect();
      const middleY = (rect.bottom - rect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverY = clientOffset.y - rect.top;

      if (dragIndex < hoverIndex && hoverY < middleY) return;
      if (dragIndex > hoverIndex && hoverY > middleY) return;

      moveTask(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drop(ref);
  drag(handleRef);
  // Use the whole card as the drag preview.
  preview(ref);

  /* ---------------- Derived state ---------------- */
  const category = useMemo(
    () => categories.find((c) => c.id === task.categoryId),
    [categories, task.categoryId],
  );
  const completionPercentage = useMemo(() => getTaskCompletionPercentage(task), [task]);
  const completedSubtasks = useMemo(
    () => task.subtasks.filter((st) => st.completed).length,
    [task.subtasks],
  );

  const isTaskOverdue = !!task.dueDate && !task.completed && isOverdue(task.dueDate);
  const isDueToday = !!task.dueDate && !task.completed && isToday(task.dueDate);
  const priority = PRIORITY_STYLES[task.priority as Priority];

  const dueTone = isTaskOverdue
    ? 'text-red-500'
    : isDueToday
    ? 'text-orange-500'
    : muted;

  /* ---------------- Handlers ---------------- */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Ignore keys coming from nested interactive elements.
      if (e.target !== e.currentTarget) return;
      if (e.key === ' ') {
        e.preventDefault();
        onToggleComplete(task.id);
      } else if (e.key === 'Enter' || e.key.toLowerCase() === 'e') {
        onEdit(task);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        setConfirmingDelete(true);
      } else if (e.key === 'ArrowUp' && e.altKey && index > 0) {
        e.preventDefault();
        moveTask(index, index - 1);
      } else if (e.key === 'ArrowDown' && e.altKey) {
        e.preventDefault();
        moveTask(index, index + 1);
      }
    },
    [index, moveTask, onEdit, onToggleComplete, task],
  );

  const confirmDelete = useCallback(() => {
    setConfirmingDelete(false);
    onDelete(task.id);
  }, [onDelete, task.id]);

  /* ---------------- Render ---------------- */
  return (
    <motion.div
      ref={ref}
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0, scale: isDragging ? 0.98 : 1 }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      tabIndex={0}
      role="listitem"
      aria-label={`${task.title}, ${task.priority} priority${task.completed ? ', completed' : ''}`}
      onKeyDown={handleKeyDown}
      className={`relative rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 ${
        isOver && !isDragging ? 'ring-2 ring-blue-500/40' : ''
      }`}
    >
      <Card
        className={`group relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
          isDark
            ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
            : 'bg-white border-gray-200 hover:border-gray-300'
        } ${task.completed ? 'opacity-60' : ''}`}
      >
        {/* Priority accent bar */}
        <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${priority.bar}`} />

        <div className="p-4 pl-5">
          <div className="flex items-start gap-3">
            <div
              ref={handleRef}
              aria-label="Drag to reorder (Alt + ↑/↓ on keyboard)"
              className={`cursor-grab touch-none pt-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 active:cursor-grabbing ${
                isDark ? 'text-gray-600' : 'text-gray-400'
              }`}
            >
              <GripVertical className="h-5 w-5" />
            </div>

            <div className="pt-1">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggleComplete(task.id)}
                aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
                className="h-5 w-5"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3
                  className={`text-lg leading-tight transition-colors ${
                    task.completed
                      ? `line-through ${isDark ? 'text-gray-500' : 'text-gray-400'}`
                      : isDark
                      ? 'text-white'
                      : 'text-gray-900'
                  }`}
                >
                  {task.title}
                </h3>

                <Badge
                  variant="outline"
                  className={`${priority.bg} ${priority.text} ${priority.border} shrink-0 border capitalize`}
                >
                  {task.priority}
                </Badge>
              </div>

              {task.description && (
                <p className={`mb-3 line-clamp-2 text-sm ${muted}`}>{task.description}</p>
              )}

              {task.subtasks.length > 0 && (
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    aria-expanded={expanded}
                    className={`mb-1 flex w-full items-center justify-between text-xs ${muted} hover:opacity-80`}
                  >
                    <span className="flex items-center gap-1">
                      <motion.span animate={{ rotate: expanded ? 180 : 0 }} className="inline-flex">
                        <ChevronDown className="h-3.5 w-3.5" />
                      </motion.span>
                      {completedSubtasks} of {task.subtasks.length} subtasks
                    </span>
                    <span>{completionPercentage}%</span>
                  </button>
                  <Progress value={completionPercentage} className="h-1.5" />

                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 space-y-1.5 overflow-hidden"
                      >
                        {task.subtasks.map((st) => (
                          <li key={st.id} className="flex items-center gap-2">
                            <Checkbox
                              checked={st.completed}
                              disabled={!onToggleSubtask}
                              onCheckedChange={() => onToggleSubtask?.(task.id, st.id)}
                              aria-label={`Toggle subtask ${(st as any).title ?? ''}`}
                              className="h-4 w-4"
                            />
                            <span
                              className={`text-sm ${
                                st.completed
                                  ? `line-through ${isDark ? 'text-gray-500' : 'text-gray-400'}`
                                  : isDark
                                  ? 'text-gray-200'
                                  : 'text-gray-800'
                              }`}
                            >
                              {(st as any).title ?? (st as any).text ?? ''}
                            </span>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 text-sm">
                {category && (
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className={muted}>{category.name}</span>
                  </div>
                )}

                {task.dueDate && (
                  <div
                    className={`flex items-center gap-1.5 ${dueTone}`}
                    title={formatDateTime(task.dueDate)}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDateTime(task.dueDate)}</span>
                    {!task.completed && (
                      <span className="text-xs opacity-80">({relativeTime(task.dueDate)})</span>
                    )}
                    {isTaskOverdue && <AlertCircle className="h-3.5 w-3.5" />}
                  </div>
                )}

                {task.reminder && (
                  <div className={`flex items-center gap-1.5 ${muted}`}>
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatDateTime(task.reminder)}</span>
                  </div>
                )}

                {task.duration && (
                  <div className={`flex items-center gap-1.5 ${muted}`}>
                    <Timer className="h-3.5 w-3.5" />
                    <span>{formatDuration(task.duration)}</span>
                  </div>
                )}

                {(task as any).recurrence && (
                  <div className={`flex items-center gap-1.5 ${muted}`}>
                    <Repeat className="h-3.5 w-3.5" />
                  </div>
                )}

                {task.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className={`text-xs ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Task actions"
                  className={`shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>

                {onDuplicate && (
                  <DropdownMenuItem onClick={() => onDuplicate(task)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                )}

                {onChangePriority && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs">Priority</DropdownMenuLabel>
                    {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                      <DropdownMenuItem
                        key={p}
                        disabled={task.priority === p}
                        onClick={() => onChangePriority(task.id, p)}
                      >
                        <Flag className={`mr-2 h-4 w-4 ${PRIORITY_STYLES[p].text}`} />
                        <span className="capitalize">{p}</span>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setConfirmingDelete(true)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Inline delete confirmation (no modal needed) */}
        <AnimatePresence>
          {confirmingDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              role="alertdialog"
              aria-label="Confirm delete"
              className={`absolute inset-0 flex items-center justify-between gap-3 px-5 backdrop-blur-sm ${
                isDark ? 'bg-gray-900/85' : 'bg-white/90'
              }`}
            >
              <span className={`truncate text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                Delete “{task.title}”?
              </span>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="ghost" onClick={() => setConfirmingDelete(false)} autoFocus>
                  Cancel
                </Button>
                <Button size="sm" variant="destructive" onClick={confirmDelete}>
                  Delete
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

/** Memoised so dragging one card doesn't re-render the whole list. */
export const TaskCard = memo(TaskCardComponent);
