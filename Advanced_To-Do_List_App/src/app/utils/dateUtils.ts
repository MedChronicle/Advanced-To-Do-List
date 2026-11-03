// src/app/utils/dateUtils.ts

const LOCALE = 'en-US';
const MS_PER_DAY = 86_400_000;

export type DateInput = string | Date;

/* ─────────────────────────── Parsing ─────────────────────────── */

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Safe parse. Returns null for empty or invalid input instead of an "Invalid Date" object.
 * Date-only strings ("2026-11-04") are read as LOCAL midnight. `new Date("2026-11-04")`
 * means UTC midnight, which shows up as the previous day in time zones behind UTC.
 */
export function parseDate(value: DateInput | null | undefined): Date | null {
  if (!value) return null;
  let d: Date;
  if (value instanceof Date) {
    d = value;
  } else if (DATE_ONLY.test(value)) {
    const [y, m, day] = value.split('-').map(Number);
    d = new Date(y, m - 1, day);
  } else {
    d = new Date(value);
  }
  return Number.isNaN(d.getTime()) ? null : d;
}

/* ─────────────────────────── Calendar helpers ─────────────────────────── */

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

/** True if the value carries a real time of day (not local midnight). */
function hasTime(d: Date): boolean {
  return d.getHours() !== 0 || d.getMinutes() !== 0 || d.getSeconds() !== 0;
}

/** Whole calendar days from `now` to `date`: 0 = today, 1 = tomorrow, -1 = yesterday. */
export function daysUntil(date: DateInput, now: Date = new Date()): number | null {
  const d = parseDate(date);
  if (!d) return null;
  // round(), because a day is 23 or 25 hours long across a DST change
  return Math.round((startOfDay(d).getTime() - startOfDay(now).getTime()) / MS_PER_DAY);
}

/** Local YYYY-MM-DD, for <input type="date"> values. */
export function toDateInputValue(date: DateInput): string {
  const d = parseDate(date);
  if (!d) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/* ─────────────────────────── Formatting ─────────────────────────── */

// Intl formatters are expensive to build; create them once, not per call
const dateFmt = new Intl.DateTimeFormat(LOCALE, { month: 'short', day: 'numeric', year: 'numeric' });
const shortDateFmt = new Intl.DateTimeFormat(LOCALE, { month: 'short', day: 'numeric' });
const timeFmt = new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', minute: '2-digit', hour12: true });

export function formatDate(date: DateInput): string {
  const d = parseDate(date);
  return d ? dateFmt.format(d) : '';
}

export function formatTime(date: DateInput): string {
  const d = parseDate(date);
  return d ? timeFmt.format(d) : '';
}

/** "Nov 4" for date-only values, "Nov 4 at 3:30 PM" when a time is set. */
export function formatDateTime(date: DateInput): string {
  const d = parseDate(date);
  if (!d) return '';
  const dateStr = shortDateFmt.format(d);
  return hasTime(d) ? `${dateStr} at ${timeFmt.format(d)}` : dateStr;
}

export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return '0m';
  const total = Math.round(minutes);
  if (total < 60) return `${total}m`;
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
}

/* ─────────────────────────── Comparisons ─────────────────────────── */

/**
 * A date-only due date ("due Nov 4") becomes overdue only AFTER that day ends.
 * The old version flagged it overdue at 00:00 on the due day, so the task was
 * "overdue" and "due today" at the same time. A due date with a time ("3:30 PM")
 * is overdue once that moment passes.
 */
export function isOverdue(date: DateInput, now: Date = new Date()): boolean {
  const d = parseDate(date);
  if (!d) return false;
  return (hasTime(d) ? d : endOfDay(d)).getTime() < now.getTime();
}

export function isToday(date: DateInput, now: Date = new Date()): boolean {
  return daysUntil(date, now) === 0;
}

export function isTomorrow(date: DateInput, now: Date = new Date()): boolean {
  return daysUntil(date, now) === 1;
}

/**
 * Same calendar week as `now`. Defaults to Sunday-start, which matches the original.
 * Pass 1 for Monday-start (common in India and Europe).
 */
export function isThisWeek(date: DateInput, now: Date = new Date(), weekStartsOn: 0 | 1 = 0): boolean {
  const d = parseDate(date);
  if (!d) return false;

  const offset = (now.getDay() - weekStartsOn + 7) % 7;
  // Built with the Date constructor, not +/- 86,400,000 ms, so DST can't shift the boundary
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
  const nextWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset + 7);
  return d >= weekStart && d < nextWeekStart;
}

/* ─────────────────────────── Relative labels ─────────────────────────── */

/** "just now", "5m ago", "in 2h", "3d ago", or a date for anything a week or more away. */
export function getRelativeTime(date: DateInput, now: Date = new Date()): string {
  const d = parseDate(date);
  if (!d) return '';

  const diffMs = now.getTime() - d.getTime();
  const future = diffMs < 0;
  const mins = Math.floor(Math.abs(diffMs) / 60_000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return 'just now';

  let amount: string;
  if (mins < 60) amount = `${mins}m`;
  else if (hours < 24) amount = `${hours}h`;
  else if (days < 7) amount = `${days}d`;
  else return formatDate(d);

  return future ? `in ${amount}` : `${amount} ago`;
}

export type DueTone = 'overdue' | 'today' | 'soon' | 'upcoming' | 'none';

/**
 * Ready-made label and colour tone for a task's due date, so TaskCard doesn't need its own logic:
 *   const { label, tone } = getDueStatus(task.dueDate, task.completed);
 */
export function getDueStatus(
  date: DateInput | null | undefined,
  completed = false,
  now: Date = new Date()
): { label: string; tone: DueTone } {
  const d = parseDate(date);
  if (!d) return { label: '', tone: 'none' };
  if (completed) return { label: formatDate(d), tone: 'none' };

  if (isOverdue(d, now)) {
    const days = daysUntil(d, now) ?? 0;
    return { label: days < 0 ? `Overdue by ${-days}d` : 'Overdue', tone: 'overdue' };
  }

  const days = daysUntil(d, now) ?? 0;
  if (days === 0) return { label: hasTime(d) ? `Today, ${formatTime(d)}` : 'Due today', tone: 'today' };
  if (days === 1) return { label: 'Due tomorrow', tone: 'soon' };
  if (days <= 3) return { label: `Due in ${days} days`, tone: 'soon' };
  return { label: formatDate(d), tone: 'upcoming' };
}
