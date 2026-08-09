# Quickstart

Get the app running and create your first task in a few minutes.

## 1. Install and run

```bash
npm install
npm run dev
```

Open the URL Vite prints in your terminal (usually `http://localhost:5173`). The app loads into the **Dashboard** view.

## 2. Create your first task

1. Click **New Task** (top right).
2. Fill in:
   - **Title** — required
   - **Description** — optional
   - **Priority** — High / Medium / Low
   - **Category** — pick one of the defaults (Work, Personal, Communication Skills, Health) or leave as "None"
   - **Due date** — optional, via the calendar picker
   - **Reminder** — optional
   - **Duration** — optional, in hours/minutes
3. Add **subtasks** by typing into the subtask field and pressing the add button — each subtask can be checked off independently.
4. Add **tags** the same way — free-form text, one per entry.
5. Click **Create Task**.

## 3. Manage tasks

Switch to the **All Tasks** view (sidebar) to see everything you've created:
- Click the checkbox to mark a task complete.
- Use the task's menu to **Edit** or **Delete** it.
- Drag a task by its handle to reorder it.
- Use the **search bar** to find tasks by title, description, or tag.
- Use the **sidebar filters** to narrow by category or priority, and the status filter for active/completed.

## 4. Check your progress

- **Dashboard** — totals, completion rate, what's overdue, what's due today/this week, and a priority/category breakdown.
- **Progress** — a dedicated view for tracking completion trends.

## 5. Switch themes

Click the sun/moon icon in the header to toggle light/dark mode. Your choice is remembered on reload.

## Where your data lives

Everything you create is saved to your browser's `localStorage` automatically — there's nothing to save manually, but it also means your tasks won't follow you to a different browser or device. See the **Known limitations** section of [README.md](./README.md) for details.

## Next steps

- Read [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) if you want to modify or extend the app.
- Check [CHANGELOG.md](./CHANGELOG.md) for what's implemented today vs. what's on the roadmap.
