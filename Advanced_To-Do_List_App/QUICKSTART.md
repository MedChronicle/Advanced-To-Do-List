# ⚡ Quickstart

Get the app running and create your first task in about five minutes.

**Contents:** [Install](#1-install-and-run) · [First task](#2-create-your-first-task) · [Manage](#3-manage-tasks) · [Progress](#4-check-your-progress) · [Themes](#5-switch-themes) · [Data](#where-your-data-lives) · [Troubleshooting](#troubleshooting)

---

## 1. Install and run

**You need:** Node.js **20.19+** and pnpm 10+ (npm also works). Check with `node -v`.

```bash
pnpm install
pnpm dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The app opens on the **Dashboard**.

> Using npm? Replace `pnpm` with `npm run` for scripts (`npm install`, `npm run dev`).

---

## 2. Create your first task

1. Click **New Task** (top right).
2. Fill in the form:

| Field | Required | Notes |
|---|---|---|
| **Title** | ✅ | The only required field |
| **Description** | | Free text |
| **Priority** | | High / Medium / Low |
| **Category** | | Work, Personal, Communication Skills, Health, or "None" |
| **Due date** | | Calendar picker |
| **Reminder** | | Optional |
| **Duration** | | Hours and minutes |

3. Add **subtasks**: type in the subtask field and press the add button. Each one can be checked off independently.
4. Add **tags** the same way (free-form text, one per entry).
5. Click **Create Task**.

---

## 3. Manage tasks

Open **All Tasks** in the sidebar.

| I want to… | Do this |
|---|---|
| Complete a task | Click its checkbox |
| Edit or delete | Open the task's menu |
| Reorder | Drag the task by its handle |
| Find a task | Use the search bar (title, description, tags) |
| Narrow the list | Use the sidebar filters (category, priority) and the status filter (active / completed) |

---

## 4. Check your progress

- **Dashboard:** totals, completion rate, overdue tasks, due today and this week, and a priority and category breakdown.
- **Progress:** completion trends over time.

---

## 5. Switch themes

Click the sun/moon icon in the header to toggle light and dark mode. Your choice is remembered on reload.

---

## Where your data lives

Everything is saved automatically to your browser's `localStorage`. There's nothing to save manually, but:

- Tasks **don't follow you** to another browser or device.
- Clearing site data **deletes your tasks**.
- Private/incognito windows start empty and forget everything on close.

See **Known limitations** in [README.md](./README.md) for details.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Blank page or console errors after install | Check `node -v` is 20.19 or newer, then delete `node_modules` and reinstall |
| `Cannot find module @rollup/…` or `@esbuild/…` | Reinstall after deleting `node_modules` and the lockfile (native binaries are OS-specific) |
| Port 5173 already in use | Vite will pick the next free port. Use the URL it prints |
| Tasks disappeared | You're in a different browser/profile, or site data was cleared |
| Dark mode not applying to some elements | See the `dark:` variant note in [README.md](./README.md#troubleshooting) |

---

## Next steps

- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md): modify or extend the app
- [CHANGELOG.md](./CHANGELOG.md): what's implemented today vs. the roadmap
- [CONTRIBUTING.md](./CONTRIBUTING.md): propose changes  
