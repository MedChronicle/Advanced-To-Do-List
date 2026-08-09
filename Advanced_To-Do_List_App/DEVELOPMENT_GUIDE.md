# Development Guide

## Architecture overview

```
App (root — owns all state)
├── Sidebar          (navigation, quick filters, category list)
├── Header            (title, search bar, theme toggle, "New Task" button)
├── Dashboard          (stats view)
├── ProgressPage        (progress tracking view)
├── TaskList             (filtered/sorted tasks, drag-and-drop)
│   └── TaskCard           (single task, subtask progress, quick actions)
└── TaskDialog            (modal — create/edit task, subtasks, tags, dates)
```

### Data flow

1. `App.tsx` holds all state: `tasks`, `categories`, `filters`, `theme`, `view`, and dialog open/edit state.
2. State and handlers (`onAddTask`, `onToggleComplete`, etc.) are passed down as props — there is no context or external state library.
3. Handlers update state in `App.tsx`, which re-renders children and triggers the `localStorage`-sync `useEffect`s.

## File-by-file reference

### `src/app/types/index.ts`
TypeScript types for the whole app:
- `Task` — id, title, description, completed, priority, categoryId, dueDate, reminder, duration (minutes), subtasks, tags, createdAt/updatedAt/completedAt
- `Subtask` — id, title, completed
- `Category` — id, name, color
- `Priority` — `'high' | 'medium' | 'low'`
- `FilterState` — search, category, priority, status
- `TaskStats` — the shape consumed by the Dashboard

### `src/app/utils/storage.ts`
Thin wrappers around `localStorage`, all with try/catch so a full or unavailable storage doesn't crash the app:
- `getFromStorage<T>(key, defaultValue)`
- `saveToStorage<T>(key, value)`
- `removeFromStorage(key)`

### `src/app/utils/dateUtils.ts`
Date formatting/comparison helpers used across the Dashboard and task cards: `isToday`, `isOverdue`, `isThisWeek`, `formatDate`, `formatDateTime`, `formatTime`, and relative-time formatting.

### `src/app/utils/taskUtils.ts`
- `calculateTaskStats(tasks, categories)` — builds the `TaskStats` object for the Dashboard (totals, overdue/due-today/due-this-week counts, priority and category breakdowns, completion rate).
- `filterTasks(tasks, filters)` — applies search + category/priority/status filters.
- `sortTasks(tasks)` — completed tasks last, then by priority, then by due date, then by creation date.
- `getTaskCompletionPercentage(task)` — subtask completion percentage for a single task.

### `src/app/components/`
| Component | Responsibility |
|---|---|
| `Dashboard.tsx` | Stat cards, completion rate, priority/category breakdown |
| `ProgressPage.tsx` | Progress-over-time view |
| `Sidebar.tsx` | View switcher, quick filters (High Priority, Today), category list |
| `SearchBar.tsx` | Controlled search input |
| `TaskList.tsx` | Applies `filterTasks`/`sortTasks`, renders `TaskCard`s, owns drag-and-drop reordering |
| `TaskCard.tsx` | Single task row: checkbox, priority/category badges, subtask progress, drag handle, edit/delete menu |
| `TaskDialog.tsx` | Create/edit form — title, description, priority, category, due date, reminder, duration, subtasks, tags |
| `components/ui/` | shadcn/ui primitives (button, dialog, select, calendar, etc.) — generally shouldn't need edits |

## Styling

Tailwind CSS v4, configured via the `@tailwindcss/vite` plugin (see `vite.config.ts`) rather than a `tailwind.config.js`. Theme tokens and CSS variables live in `src/styles/`.

The app doesn't use Tailwind's `dark:` variant — instead, most components branch on the `theme` prop directly:

```tsx
className={theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
```

Responsive utilities follow standard Tailwind breakpoints, e.g. `hidden sm:block`, `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.

## Animation

Via `motion` (the current package name for Framer Motion), imported as `from 'motion/react'`:

```tsx
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} />
<AnimatePresence mode="wait">{condition && <motion.div exit={{ opacity: 0 }} />}</AnimatePresence>
<motion.div whileHover={{ scale: 1.05 }} />
```

## Common extension tasks

**Add a field to Task**
1. Add it to the `Task` interface in `types/index.ts`.
2. Add form state + a form control for it in `TaskDialog.tsx`, and include it in the object passed to `onSave`.
3. Display it in `TaskCard.tsx`.

**Add a filter**
1. Add the field to `FilterState` in `types/index.ts`.
2. Add the UI control (e.g. in `Sidebar.tsx`).
3. Add the matching condition in `filterTasks()` in `taskUtils.ts`.

**Add a view**
1. Extend the `view` union type in `App.tsx` (currently `'dashboard' | 'tasks' | 'progress'`).
2. Create the component and render it in `App.tsx`'s content area.
3. Add navigation for it in `Sidebar.tsx`.

## Performance notes

`filterTasks`/`sortTasks` currently run on every render of `TaskList`. For larger task lists, wrapping the derived list in `useMemo` (keyed on `tasks` and `filters`) is a straightforward win if it becomes noticeable.

## Debugging tips

- **Tasks not saving** — check that `localStorage` is enabled and not full (there's a soft ~5–10MB per-origin cap); check the console for JSON errors from `storage.ts`.
- **Drag-and-drop not working** — confirm the tree is still wrapped in `<DndProvider backend={HTML5Backend}>` (set up once, in `App.tsx`).
- **Theme not persisting** — confirm `localStorage.setItem('theme', ...)` is firing and that the `dark` class is being toggled on `document.documentElement`.

## Building and deploying

```bash
npm run build     # outputs a static build to dist/
```

There's no `npm start`/`npm run preview` script defined by default — add one (`"preview": "vite preview"`) if you want to smoke-test the production build locally. The output in `dist/` is a static site and can be deployed to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages, etc.) with no server-side requirements.

## Testing

No test setup is included currently. If you add one, Vitest (pairs naturally with Vite) + React Testing Library is a reasonable default for unit/component tests; Playwright is a reasonable choice for end-to-end coverage of flows like create → edit → complete → delete.

## Further reading

- [React docs](https://react.dev)
- [TypeScript handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS docs](https://tailwindcss.com/docs)
- [Motion docs](https://motion.dev)
- [react-dnd docs](https://react-dnd.github.io/react-dnd/)
- [shadcn/ui](https://ui.shadcn.com/)

See [CONTRIBUTING.md](./CONTRIBUTING.md) for PR/commit conventions.
