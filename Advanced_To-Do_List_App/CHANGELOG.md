# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project intends to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html) once tagged releases begin.

**Contents:** [Unreleased](#unreleased) · [1.0.0](#100--initial-version) · [Roadmap](#roadmap) · [Maintaining this file](#maintaining-this-file)

---

## [Unreleased]

### Changed
- **Tooling:** `package.json` cleaned of Figma Make alias entries (`"pkg@x.y.z": "npm:…"`), `react` and `react-dom` moved to `dependencies`, caret ranges adopted, and `engines` (Node ≥ 20.19) and `packageManager` (pnpm) fields added
- **Build:** `build` now runs `tsc --noEmit` before `vite build`; new `typecheck` and `clean` scripts
- **Vite config:** ES-module-safe `__dirname`, path-traversal guard on `figma:asset/` imports, dev proxy for `/api` and `/ml`, vendor chunk splitting, `console`/`debugger` stripped from production builds
- **pnpm:** `supportedArchitectures` now includes `current` so native binaries install on the developer's own machine as well as Linux targets
- **Theme:** `@custom-variant dark` added so `dark:` utilities follow the `.dark` class, `--input-background` and `--switch-background` defined for dark mode, new semantic (`success`, `warning`, `info`) and brand tokens
- **`index.html`:** theme applied before first paint (no flash), inline loader, `theme-color`, favicon, Open Graph tags, `<noscript>` fallback
- **Docs:** README, QUICKSTART and DEVELOPMENT_GUIDE rewritten with accurate Node requirements, architecture diagrams, troubleshooting and deployment notes

### Added
- Reduced-motion support (`prefers-reduced-motion` in CSS, `MotionConfig` recommended for `motion`)
- Animation utilities in the theme: `animate-rise-in`, `animate-shimmer`, `animate-pop`, `animate-float`

### Fixed
- See [BUGFIXES.md](./BUGFIXES.md) for issues found and resolved during initial development: a Radix Select empty-value error, a missing `DialogDescription` accessibility warning, and ref-forwarding warnings on `Button` / `DialogOverlay`

---

## [1.0.0] — initial version

### Added

**Tasks**
- Create, edit and delete tasks; mark complete or incomplete
- Title, description, priority, category, due date, reminder, duration and tags
- **Subtasks:** unlimited per task, individually toggleable, with a completion-percentage rollup
- **Drag-and-drop reordering** via `react-dnd` (HTML5 backend)

**Organization**
- **Priority:** High / Medium / Low, colour-coded badges, priority-first sorting
- **Categories:** four defaults (Work, Personal, Communication Skills, Health), each with a colour, filterable
- **Tags:** free-form, multiple per task, searchable
- **Search and filters:** live search across title, description and tags; filter by category, priority and status; filters combine

**Dates**
- Due date and reminder pickers
- Overdue detection, plus "due today" and "due this week" counts

**Views**
- **Dashboard:** totals, completion rate, priority breakdown, category distribution, upcoming deadlines
- **Progress:** dedicated completion-tracking page

**Platform**
- **Light/dark theme:** persisted, with animated transitions
- **Persistence:** everything auto-saved to `localStorage`
- **Responsive layout:** mobile, tablet and desktop breakpoints; sidebar collapses on mobile

---

## Roadmap

> Nothing below is implemented yet. It's a running list of ideas, not commitments.

### Near-term
- [ ] Recurring tasks
- [ ] Task templates
- [ ] Export / import (JSON, CSV), which also doubles as a backup for `localStorage` data
- [ ] Keyboard shortcuts and command palette (`cmdk` is already installed)
- [ ] Undo / redo
- [ ] Browser notifications for reminders
- [ ] Unit tests for `taskUtils` and `dateUtils`

### Medium-term
- [ ] Calendar and kanban views
- [ ] Time tracking / Pomodoro timer
- [ ] Task dependencies
- [ ] Migrate theme handling from `theme` prop branching to semantic tokens

### Long-term
- [ ] Backend with accounts and cross-device sync
- [ ] Collaboration and shared task lists
- [ ] Integrations (Google Calendar, Slack, etc.)

---
