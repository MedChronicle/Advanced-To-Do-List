// src/app/components/TaskDialog.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Calendar as CalendarIcon, Clock, Plus, Timer, Trash2, X } from 'lucide-react';
import type { Task, Category, Priority, Subtask } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';

/* ─────────────────────────── Types & constants ─────────────────────────── */

type TaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  categories: Category[];
  onSave: (task: TaskInput) => void;
  theme: 'light' | 'dark';
}

interface FormState {
  title: string;
  description: string;
  priority: Priority;
  categoryId: string;
  dueDate?: Date;          // calendar day (local midnight)
  dueTime: string;         // "" = no specific time, otherwise "HH:mm"
  reminderDate?: Date;
  reminderTime: string;
  durH: string;            // kept as strings so the inputs can be empty while typing
  durM: string;
  subtasks: Subtask[];
  newSubtask: string;
  tags: string[];
  newTag: string;
}

const NO_CATEGORY = 'none'; // Radix Select can't use "" as a value (see BUGFIXES #1)
const MAX_TITLE = 120;
const MAX_TAGS = 12;
const MAX_TAG_LENGTH = 24;
const DEFAULT_REMINDER_TIME = '09:00';
const DURATION_PRESETS = [15, 30, 60, 120];

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: '#ef4444' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'low', label: 'Low', color: '#10b981' },
];

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  priority: 'medium',
  categoryId: NO_CATEGORY,
  dueDate: undefined,
  dueTime: '',
  reminderDate: undefined,
  reminderTime: '',
  durH: '',
  durM: '',
  subtasks: [],
  newSubtask: '',
  tags: [],
  newTag: '',
};

/* ─────────────────────────── Helpers ─────────────────────────── */

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Day + optional "HH:mm" → one Date (local). No time means local midnight, i.e. "any time that day". */
function combine(day: Date | undefined, time: string): Date | undefined {
  if (!day) return undefined;
  const d = startOfDay(day);
  if (time) {
    const [h, m] = time.split(':').map(Number);
    d.setHours(h || 0, m || 0, 0, 0);
  }
  return d;
}

/** Split a stored ISO string back into the day and time fields. */
function splitDateTime(iso?: string): { day?: Date; time: string } {
  if (!iso) return { day: undefined, time: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { day: undefined, time: '' };
  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
  const time = hasTime ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : '';
  return { day: startOfDay(d), time };
}

function formToState(task: Task | null, categories: Category[]): FormState {
  if (!task) return { ...EMPTY_FORM };

  const due = splitDateTime(task.dueDate);
  const rem = splitDateTime(task.reminder);
  const h = task.duration ? Math.floor(task.duration / 60) : 0;
  const m = task.duration ? task.duration % 60 : 0;
  const categoryStillExists = task.categoryId && categories.some(c => c.id === task.categoryId);

  return {
    ...EMPTY_FORM,
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    categoryId: categoryStillExists ? task.categoryId! : NO_CATEGORY,
    dueDate: due.day,
    dueTime: due.time,
    reminderDate: rem.day,
    reminderTime: rem.time,
    durH: h ? String(h) : '',
    durM: m ? String(m) : '',
    subtasks: task.subtasks ?? [],
    tags: task.tags ?? [],
  };
}

/** Comparable snapshot, for "unsaved changes" detection. */
const snapshot = (f: FormState) =>
  JSON.stringify({ ...f, dueDate: f.dueDate?.getTime(), reminderDate: f.reminderDate?.getTime(), newSubtask: '', newTag: '' });

const dateLabel = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const durationLabel = (total: number) => {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return [h ? `${h}h` : '', m ? `${m}m` : ''].filter(Boolean).join(' ');
};

/** Enter handler that ignores IME composition (Japanese/Chinese/Korean input). */
const onEnter = (action: () => void) => (e: KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
    e.preventDefault();
    action();
  }
};

/* ─────────────────────────── Component ─────────────────────────── */

export function TaskDialog({ open, onOpenChange, task, categories, onSave, theme }: TaskDialogProps) {
  const dark = theme === 'dark';
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const initialSnapshot = useRef(snapshot(EMPTY_FORM));
  const titleRef = useRef<HTMLInputElement>(null);

  const patch = useCallback((p: Partial<FormState>) => setForm(f => ({ ...f, ...p })), []);

  // Load the form each time the dialog OPENS (not when it closes, which flashed an empty form mid-animation)
  useEffect(() => {
    if (!open) return;
    const next = formToState(task, categories);
    setForm(next);
    setSubmitted(false);
    initialSnapshot.current = snapshot(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task]);

  const dirty = useMemo(() => snapshot(form) !== initialSnapshot.current, [form]);

  /* ───────── Derived values ───────── */
  const totalDuration = (parseInt(form.durH, 10) || 0) * 60 + (parseInt(form.durM, 10) || 0);
  const due = combine(form.dueDate, form.dueTime);
  const reminder = combine(form.reminderDate, form.reminderTime || DEFAULT_REMINDER_TIME);

  const titleError = submitted && !form.title.trim() ? 'Please enter a title.' : '';
  const reminderWarning =
    reminder && due && reminder > due
      ? 'This reminder is after the due date.'
      : reminder && !task && reminder < new Date()
      ? 'This reminder is in the past, so it won’t fire.'
      : '';

  /* ───────── Closing (asks before discarding edits) ───────── */
  const requestClose = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && dirty && !window.confirm('Discard your changes?')) return;
      onOpenChange(nextOpen);
    },
    [dirty, onOpenChange]
  );

  /* ───────── Submit ───────── */
  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    setSubmitted(true);

    const title = form.title.trim();
    if (!title) {
      titleRef.current?.focus();
      return;
    }

    onSave({
      title,
      description: form.description.trim() || undefined,
      priority: form.priority,
      categoryId: form.categoryId === NO_CATEGORY ? null : form.categoryId,
      dueDate: due?.toISOString(),
      reminder: reminder?.toISOString(),
      duration: totalDuration > 0 ? totalDuration : undefined,
      subtasks: form.subtasks,
      tags: form.tags,
      completed: task?.completed ?? false,
      completedAt: task?.completedAt,
    });
  };

  // Ctrl/Cmd + Enter saves from anywhere in the form
  const handleFormKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit();
  };

  /* ───────── Dates ───────── */
  const setDueDay = (d: Date | undefined) => patch({ dueDate: d, dueTime: d ? form.dueTime : '' });
  const setReminderDay = (d: Date | undefined) =>
    patch({ reminderDate: d, reminderTime: d ? form.reminderTime || DEFAULT_REMINDER_TIME : '' });

  const quickDue = (daysAhead: number) => {
    const d = startOfDay(new Date());
    d.setDate(d.getDate() + daysAhead);
    setDueDay(d);
  };

  /* ───────── Duration ───────── */
  const setPresetDuration = (minutes: number) =>
    patch({ durH: minutes >= 60 ? String(Math.floor(minutes / 60)) : '', durM: minutes % 60 ? String(minutes % 60) : '' });

  /* ───────── Subtasks ───────── */
  const addSubtask = () => {
    const title = form.newSubtask.trim();
    if (!title) return;
    patch({ subtasks: [...form.subtasks, { id: newId(), title, completed: false }], newSubtask: '' });
  };
  const toggleSubtask = (id: string) =>
    patch({ subtasks: form.subtasks.map(s => (s.id === id ? { ...s, completed: !s.completed } : s)) });
  const deleteSubtask = (id: string) => patch({ subtasks: form.subtasks.filter(s => s.id !== id) });

  /* ───────── Tags (comma or Enter adds; pasting "a, b, c" adds all three) ───────── */
  const addTags = (raw: string) => {
    const incoming = raw.split(',').map(t => t.trim().slice(0, MAX_TAG_LENGTH)).filter(Boolean);
    if (!incoming.length) return;
    const seen = new Set(form.tags.map(t => t.toLowerCase()));
    const merged = [...form.tags];
    for (const t of incoming) {
      if (merged.length >= MAX_TAGS) break;
      if (!seen.has(t.toLowerCase())) {
        seen.add(t.toLowerCase());
        merged.push(t);
      }
    }
    patch({ tags: merged, newTag: '' });
  };
  const removeTag = (tag: string) => patch({ tags: form.tags.filter(t => t !== tag) });

  /* ───────── Styling ───────── */
  const field = dark ? 'bg-gray-700 border-gray-600 text-white' : '';
  const label = dark ? 'text-gray-300' : '';
  const muted = dark ? 'text-gray-400' : 'text-gray-500';
  const pickerBtn = `w-full justify-start text-left ${dark ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : ''}`;
  const chip = `rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
    dark ? 'border-gray-600 text-gray-300 hover:bg-gray-600' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
  }`;

  const doneSubtasks = form.subtasks.filter(s => s.completed).length;

  return (
    <Dialog open={open} onOpenChange={requestClose}>
      <DialogContent
        onOpenAutoFocus={e => {
          e.preventDefault();
          titleRef.current?.focus();
        }}
        className={`max-h-[90vh] max-w-2xl overflow-y-auto ${dark ? 'border-gray-700 bg-gray-800' : 'bg-white'}`}
      >
        <DialogHeader>
          <DialogTitle className={dark ? 'text-white' : 'text-gray-900'}>
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription className={dark ? 'text-gray-300' : 'text-gray-500'}>
            {task ? 'Edit the details of your task.' : 'Add a new task to your list.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-6" noValidate>
          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="title" className={label}>Task Title *</Label>
              <span className={`text-xs tabular-nums ${muted}`}>{form.title.length}/{MAX_TITLE}</span>
            </div>
            <Input
              id="title"
              ref={titleRef}
              value={form.title}
              maxLength={MAX_TITLE}
              onChange={e => patch({ title: e.target.value })}
              placeholder="Enter task title..."
              aria-invalid={!!titleError}
              aria-describedby={titleError ? 'title-error' : undefined}
              className={`${field} ${titleError ? 'border-red-500' : ''}`}
            />
            {titleError && (
              <p id="title-error" role="alert" className="flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-3.5 w-3.5" /> {titleError}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className={label}>Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={e => patch({ description: e.target.value })}
              placeholder="Add a description..."
              rows={3}
              className={field}
            />
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priority" className={label}>Priority</Label>
              <Select value={form.priority} onValueChange={v => patch({ priority: v as Priority })}>
                <SelectTrigger id="priority" className={field}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
                        {p.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className={label}>Category</Label>
              <Select value={form.categoryId} onValueChange={v => patch({ categoryId: v })}>
                <SelectTrigger id="category" className={field}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY}>No category</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due date */}
          <div className="space-y-2">
            <Label className={label}>Due Date & Time</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className={pickerBtn}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.dueDate ? dateLabel(form.dueDate) : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={form.dueDate} onSelect={setDueDay} />
                </PopoverContent>
              </Popover>

              <div className="flex gap-2">
                <Input
                  type="time"
                  aria-label="Due time"
                  value={form.dueTime}
                  onChange={e => patch({ dueTime: e.target.value })}
                  disabled={!form.dueDate}
                  className={field}
                />
                {form.dueDate && (
                  <Button type="button" variant="ghost" size="icon" aria-label="Clear due date" onClick={() => setDueDay(undefined)} className="shrink-0">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={chip} onClick={() => quickDue(0)}>Today</button>
              <button type="button" className={chip} onClick={() => quickDue(1)}>Tomorrow</button>
              <button type="button" className={chip} onClick={() => quickDue(7)}>Next week</button>
              {form.dueDate && !form.dueTime && <span className={`text-xs ${muted}`}>No time set, so it’s due any time that day.</span>}
            </div>
          </div>

          {/* Reminder */}
          <div className="space-y-2">
            <Label className={label}>Reminder Date & Time</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className={pickerBtn}>
                    <Clock className="mr-2 h-4 w-4" />
                    {form.reminderDate ? dateLabel(form.reminderDate) : 'Set reminder'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={form.reminderDate} onSelect={setReminderDay} />
                </PopoverContent>
              </Popover>

              <div className="flex gap-2">
                <Input
                  type="time"
                  aria-label="Reminder time"
                  value={form.reminderTime}
                  onChange={e => patch({ reminderTime: e.target.value })}
                  disabled={!form.reminderDate}
                  className={field}
                />
                {form.reminderDate && (
                  <Button type="button" variant="ghost" size="icon" aria-label="Clear reminder" onClick={() => setReminderDay(undefined)} className="shrink-0">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {reminderWarning && (
              <p role="status" className="flex items-center gap-1 text-sm text-amber-500">
                <AlertCircle className="h-3.5 w-3.5" /> {reminderWarning}
              </p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label className={label}>Estimated Duration</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="duration-hours" className={`text-xs ${muted}`}>Hours</Label>
                <Input
                  id="duration-hours"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={999}
                  value={form.durH}
                  onChange={e => patch({ durH: e.target.value === '' ? '' : String(Math.min(999, Math.max(0, parseInt(e.target.value, 10) || 0))) })}
                  placeholder="0"
                  className={field}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="duration-minutes" className={`text-xs ${muted}`}>Minutes</Label>
                <Input
                  id="duration-minutes"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={59}
                  value={form.durM}
                  onChange={e => patch({ durM: e.target.value === '' ? '' : String(Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0))) })}
                  placeholder="0"
                  className={field}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {DURATION_PRESETS.map(m => (
                <button key={m} type="button" className={chip} onClick={() => setPresetDuration(m)}>
                  {durationLabel(m)}
                </button>
              ))}
              {totalDuration > 0 && (
                <>
                  <button type="button" className={chip} onClick={() => patch({ durH: '', durM: '' })}>Clear</button>
                  <span className={`flex items-center gap-1.5 text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Timer className="h-3.5 w-3.5" /> Should take {durationLabel(totalDuration)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Subtasks */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label className={label}>Subtasks</Label>
              {form.subtasks.length > 0 && (
                <span className={`text-xs tabular-nums ${muted}`}>{doneSubtasks}/{form.subtasks.length} done</span>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={form.newSubtask}
                onChange={e => patch({ newSubtask: e.target.value })}
                onKeyDown={onEnter(addSubtask)}
                placeholder="Add a subtask..."
                className={field}
              />
              <Button type="button" onClick={addSubtask} size="icon" aria-label="Add subtask">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <AnimatePresence initial={false}>
              {form.subtasks.length > 0 && (
                <div className="mt-3 space-y-2">
                  {form.subtasks.map(s => (
                    <motion.div
                      key={s.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className={`flex items-center gap-2 rounded-lg p-2 ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <Checkbox checked={s.completed} onCheckedChange={() => toggleSubtask(s.id)} aria-label={`Mark “${s.title}” done`} />
                      <span
                        className={`flex-1 text-sm ${
                          s.completed
                            ? dark ? 'text-gray-500 line-through' : 'text-gray-400 line-through'
                            : dark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {s.title}
                      </span>
                      <Button type="button" variant="ghost" size="icon" aria-label={`Delete “${s.title}”`} onClick={() => deleteSubtask(s.id)} className="h-8 w-8">
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label className={label}>Tags</Label>
              <span className={`text-xs tabular-nums ${muted}`}>{form.tags.length}/{MAX_TAGS}</span>
            </div>

            <div className="flex gap-2">
              <Input
                value={form.newTag}
                onChange={e => {
                  const v = e.target.value;
                  // typing or pasting a comma commits what came before it
                  if (v.includes(',')) addTags(v);
                  else patch({ newTag: v });
                }}
                onKeyDown={onEnter(() => addTags(form.newTag))}
                placeholder="Add a tag (Enter or comma)..."
                disabled={form.tags.length >= MAX_TAGS}
                maxLength={MAX_TAG_LENGTH * 4}
                className={field}
              />
              <Button type="button" onClick={() => addTags(form.newTag)} size="icon" aria-label="Add tag" disabled={form.tags.length >= MAX_TAGS}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {form.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {form.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className={`flex items-center gap-1 ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    {tag}
                    <button type="button" aria-label={`Remove tag ${tag}`} onClick={() => removeTag(tag)} className="rounded-full hover:opacity-70">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-4">
            <span className={`hidden text-xs sm:block ${muted}`}>Tip: Ctrl/⌘ + Enter to save</span>
            <div className="ml-auto flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => requestClose(false)}
                className={dark ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : ''}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                {task ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
