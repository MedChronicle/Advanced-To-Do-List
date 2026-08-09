# Changelog

All notable changes to this project are documented here. The format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project intends to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html) once tagged releases begin.

## [Unreleased]

### Fixed
See [BUGFIXES.md](./BUGFIXES.md) for details on issues found and resolved during initial development (a Radix Select empty-value error, a missing `DialogDescription` accessibility warning, and ref-forwarding warnings on `Button`/`DialogOverlay`).

## [1.0.0] — initial version

### Added
- **Task management** — create, edit, delete; mark complete/incomplete; title, description, and rich metadata (priority, category, due date, reminder, duration, tags)
- **Subtasks** — unlimited subtasks per task, each independently toggleable, with a completion-percentage rollup
- **Priority** — High/Medium/Low, with color-coded badges and priority-first sorting
- **Categories** — four defaults (Work, Personal, Communication Skills, Health), each with a color; filterable
- **Tags** — free-form, multiple per task, searchable
- **Dates** — due date and reminder pickers, overdue detection, "due today" and "due this week" counts
- **Search & filters** — live search across title/description/tags; filter by category, priority, and status; filters combine
- **Drag-and-drop reordering** — via `react-dnd` with the HTML5 backend
- **Dashboard** — totals, completion rate, priority breakdown, category distribution, upcoming deadlines
- **Progress view** — dedicated completion-tracking page
- **Light/dark theme** — persisted, with animated transitions
- **Persistence** — all data auto-saved to `localStorage`
- **Responsive layout** — mobile, tablet, and desktop breakpoints; sidebar collapses on mobile

## Roadmap

Nothing below is implemented yet — this is a running list of ideas, not commitments.

**Near-term**
- Recurring tasks
- Task templates
- Export/import (JSON/CSV)
- Keyboard shortcuts
- Undo/redo

**Medium-term**
- Calendar and kanban views
- Time tracking / Pomodoro timer
- Task dependencies

**Long-term**
- A real backend with accounts and cross-device sync
- Collaboration/shared task lists
- Integrations (Google Calendar, Slack, etc.)
