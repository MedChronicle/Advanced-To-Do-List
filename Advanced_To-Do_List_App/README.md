# Advanced To-Do List App

A feature-rich task management app built with React, TypeScript, and Tailwind CSS. It includes a stats dashboard, drag-and-drop reordering, subtasks, tags, categories, due dates/reminders, and a light/dark theme — all persisted locally in the browser.

> Originally exported from [Figma Make](https://www.figma.com/design/NQhncxSK8QkTD3pSh0pPvY/Advanced-To-Do-List-App). This README and the accompanying docs describe the app as it's actually implemented in this codebase.

## Features

**Task management**
- Create, edit, and delete tasks with a title, description, priority, category, due date, reminder, estimated duration, subtasks, and tags
- Mark tasks (and individual subtasks) complete/incomplete
- Reorder tasks with drag-and-drop (`react-dnd`)

**Organization**
- Four starter categories (Work, Personal, Communication Skills, Health), each with a color
- High / Medium / Low priority levels
- Free-form tags
- Live search across title, description, and tags
- Filter by category, priority, and status (active/completed)

**Views**
- **Dashboard** — total/active/completed/overdue counts, due-today and due-this-week counts, completion rate, and a priority/category breakdown
- **Tasks** — the full, filterable, reorderable task list
- **Progress** — a dedicated view for tracking completion over time

**UI/UX**
- Light and dark themes (persisted, with animated transitions)
- Responsive layout for mobile, tablet, and desktop
- Animated transitions and micro-interactions via `motion` (Framer Motion)

**Data**
- Everything (tasks, categories, theme) is stored in the browser's `localStorage` — there is no backend or account system. Data lives only in the browser it was created in.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Radix UI primitives) |
| Animation | Motion (Framer Motion) |
| Drag & drop | react-dnd (HTML5 backend) |
| Icons | lucide-react |
| Charts | Recharts |
| Persistence | Browser `localStorage` |

## Getting started

**Requirements:** Node.js 18+ and npm (or pnpm).

```bash
# install dependencies
npm install

# start the dev server (with hot reload)
npm run dev

# build for production
npm run build
```

`npm run dev` starts Vite's dev server — the terminal output will show the local URL (typically `http://localhost:5173`). `npm run build` outputs a static, production-ready bundle to `dist/`, which you can deploy to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages, etc.).

For a walkthrough of using the app once it's running, see [QUICKSTART.md](./QUICKSTART.md).

## Project structure

```
.
├── index.html                  # Vite entry HTML
├── src/
│   ├── main.tsx                 # React entry point
│   ├── styles/                  # Global CSS, theme variables, Tailwind config
│   └── app/
│       ├── App.tsx               # Root component — owns all app state
│       ├── types/index.ts        # Task, Category, Subtask, Filter, and Stats types
│       ├── utils/
│       │   ├── storage.ts        # localStorage get/save/remove helpers
│       │   ├── dateUtils.ts      # Date formatting & comparison (today/overdue/this week)
│       │   └── taskUtils.ts      # Filtering, sorting, and stats calculation
│       └── components/
│           ├── Dashboard.tsx     # Stats overview
│           ├── ProgressPage.tsx  # Progress tracking view
│           ├── Sidebar.tsx       # Navigation, quick filters, category list
│           ├── SearchBar.tsx     # Search input
│           ├── TaskList.tsx      # Filtered/sorted task list with drag-and-drop
│           ├── TaskCard.tsx      # Single task row
│           ├── TaskDialog.tsx    # Create/edit task modal
│           └── ui/               # shadcn/ui component primitives
├── guidelines/Guidelines.md     # Design/build guidelines (Figma Make convention)
├── DEVELOPMENT_GUIDE.md
├── QUICKSTART.md
├── CHANGELOG.md
├── BUGFIXES.md
├── ATTRIBUTIONS.md
└── CONTRIBUTING.md
```

## How state works

All application state (`tasks`, `categories`, `filters`, `theme`, current `view`, and dialog state) lives in `App.tsx` and is passed down to child components as props — there's no external state library. `tasks`, `categories`, and `theme` are synced to `localStorage` on every change via `useEffect`, and rehydrated from `localStorage` on load.

## Known limitations

- **Single browser, single device** — data is stored in `localStorage`, so it doesn't sync across devices or browsers and will be lost if site data is cleared.
- **No backend** — no accounts, no collaboration, no real-time sync.
- **Storage ceiling** — `localStorage` is generally capped around 5–10MB per origin, which is far more than enough for typical task lists but worth knowing about.

See [BUGFIXES.md](./BUGFIXES.md) for issues that have already been fixed, and the roadmap in [CHANGELOG.md](./CHANGELOG.md) for what's planned next.

## Documentation index

| Doc | What it covers |
|---|---|
| [QUICKSTART.md](./QUICKSTART.md) | 5-minute guide to using the app |
| [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) | Architecture, file-by-file breakdown, how to extend it |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to propose changes |
| [CHANGELOG.md](./CHANGELOG.md) | Version history and roadmap |
| [BUGFIXES.md](./BUGFIXES.md) | Notable bugs that were found and fixed |
| [ATTRIBUTIONS.md](./ATTRIBUTIONS.md) | Third-party licenses/assets used |

## License

No license file is currently included, so all rights are reserved by default. If you intend to open-source this project, add a `LICENSE` file (MIT is a common, permissive choice) — see [CONTRIBUTING.md](./CONTRIBUTING.md) for a note on this.
