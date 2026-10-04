# Advanced To-Do List App

The **Advanced To-Do List App** is a modern and interactive productivity application designed to help users organize tasks, manage priorities, track progress, and improve their daily workflow. The application combines traditional task management with features such as categories, subtasks, reminders, due dates, tags, task filtering, progress tracking, and drag-and-drop organization.

Built using **React, TypeScript, Tailwind CSS, and modern UI libraries**, the application provides a clean and responsive interface that works across desktops, tablets, and mobile devices.

The application is designed as a client-side productivity tool, with task information stored locally in the browser. This allows users to use the application without creating an account or configuring a backend server.

> This project was originally exported from Figma Make. The project structure and documentation are organized to explain how the application works and how it can be developed or maintained.

## Features

### Task Creation and Management

The application provides a complete task management system where users can create and manage tasks with detailed information.

Each task can contain:

* Task title
* Task description
* Priority
* Category
* Due date
* Reminder
* Estimated completion time
* Subtasks
* Tags
* Completion status

Users can create new tasks, update existing tasks, mark tasks as completed, or remove tasks when they are no longer required.

Tasks can also be reordered using **drag-and-drop interactions**, allowing users to customize the order of their workload.

### Subtask Management

Large tasks can be divided into smaller subtasks.

Users can:

* Add multiple subtasks
* Mark individual subtasks as completed
* Track subtask completion
* View progress for a task
* Manage subtasks independently

This makes it easier to break complicated activities into smaller and more manageable steps.

### Categories

Tasks can be grouped into categories to improve organization.

The application includes default categories such as:

* **Work**
* **Personal**
* **Communication Skills**
* **Health**

Each category uses a dedicated visual style so that tasks can be identified quickly.

### Priority Management

Every task can be assigned a priority level:

* **High**
* **Medium**
* **Low**

Priority information helps users identify important tasks and organize their workload according to urgency.

### Tags

Users can add custom tags to tasks.

Tags can be used to group related activities across different categories. For example:

* `College`
* `Project`
* `Exam`
* `Fitness`
* `Meeting`
* `Important`

The search functionality can also use these tags when locating tasks.

## Search, Filtering and Sorting

The application provides tools for quickly finding specific tasks.

Users can search through:

* Task titles
* Task descriptions
* Tags

Tasks can also be filtered by:

* Category
* Priority
* Active status
* Completed status

Sorting and filtering make it easier to focus on a specific section of the workload instead of viewing every task at once.

## Dashboard

The **Dashboard** provides an overview of the user's current productivity.

It displays useful statistics such as:

* Total tasks
* Active tasks
* Completed tasks
* Overdue tasks
* Tasks due today
* Tasks due this week
* Overall completion percentage
* Priority distribution
* Category distribution

The dashboard provides a quick snapshot of the user's workload and makes it easier to understand task completion patterns.

## Progress Tracking

The **Progress** section focuses on productivity and task completion.

Users can monitor:

* Completed tasks
* Remaining tasks
* Completion percentage
* Task progress
* Productivity trends
* Category progress
* Priority distribution

This section helps users understand how consistently they are completing their planned work.

## Drag-and-Drop Organization

Tasks can be rearranged using **drag-and-drop functionality**.

This allows users to:

* Change task order
* Prioritize important tasks
* Organize daily workload
* Quickly restructure the task list

The drag-and-drop system provides a more interactive experience than a traditional static task list.

## Reminders and Due Dates

Tasks can include due dates and reminders.

Due dates allow users to identify:

* Overdue tasks
* Tasks due today
* Upcoming tasks
* Tasks due during the current week

Reminder information is stored together with the task so that scheduling information remains available whenever the application is reopened.

## Themes

The application supports both:

* **Light Mode**
* **Dark Mode**

The selected theme is stored locally so that the user's preferred appearance can be restored when the application is opened again.

The interface is designed to maintain readability and consistency across both themes.

## Responsive Design

The application is designed to work across different screen sizes.

Supported environments include:

* Desktop computers
* Laptops
* Tablets
* Mobile phones

The layout automatically adapts to smaller screens while maintaining access to the main task management functionality.

## Animations and Interactions

The application uses **Motion (Framer Motion)** to provide smooth interface interactions.

Animations are used for interactions such as:

* Opening dialogs
* Closing dialogs
* Switching views
* Updating tasks
* Displaying interface elements
* Changing task states

These interactions make the application feel more responsive and polished.

## Technology Used

| Area | Technology |
| --- | --- |
| Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Component Primitives | Radix UI |
| Animations | Motion (Framer Motion) |
| Drag & Drop | react-dnd |
| Icons | lucide-react |
| Charts | Recharts |
| Data Storage | Browser localStorage |

## Getting Started

### Prerequisites

Before running the project, make sure the following software is installed:

* **Node.js 18 or newer**
* npm or pnpm

### Installation

Clone the repository and move into the project directory.

Then install the project dependencies:

```bash
npm install
```

### Development Server

Start the development server using:

```bash
npm run dev
```

After starting the server, Vite will provide a local development URL.

The application is generally available at:

```text
http://localhost:5173
```

### Production Build

To create an optimized production build, run:

```bash
npm run build
```

The generated production files will be placed inside:

```text
dist/
```

The generated files can be deployed to platforms such as:

* Vercel
* Netlify
* Cloudflare Pages
* GitHub Pages

## Project Structure

The application follows a component-based structure where different parts of the application are separated according to their responsibilities.

```text
.
├── index.html
├── src/
│   ├── main.tsx
│   ├── styles/
│   └── app/
│       ├── App.tsx
│       ├── types/
│       │   └── index.ts
│       ├── utils/
│       │   ├── storage.ts
│       │   ├── dateUtils.ts
│       │   └── taskUtils.ts
│       └── components/
│           ├── Dashboard.tsx
│           ├── ProgressPage.tsx
│           ├── Sidebar.tsx
│           ├── SearchBar.tsx
│           ├── TaskList.tsx
│           ├── TaskCard.tsx
│           ├── TaskDialog.tsx
│           └── ui/
├── guidelines/
│   └── Guidelines.md
├── DEVELOPMENT_GUIDE.md
├── QUICKSTART.md
├── CHANGELOG.md
├── BUGFIXES.md
├── ATTRIBUTIONS.md
└── CONTRIBUTING.md
```

### Application Entry Point

`main.tsx` is responsible for starting the React application and mounting it to the main HTML document.

### Main Application

`App.tsx` acts as the central component of the application.

It manages major application state such as:

* Tasks
* Categories
* Theme
* Current view
* Filters
* Task operations

### Components

The components directory contains reusable interface elements.

Important components include:

* `Dashboard.tsx` — productivity overview
* `ProgressPage.tsx` — progress and statistics
* `Sidebar.tsx` — application navigation
* `SearchBar.tsx` — task searching
* `TaskList.tsx` — task collection and organization
* `TaskCard.tsx` — individual task display
* `TaskDialog.tsx` — task creation and editing interface

The `ui/` directory contains reusable UI components used throughout the application.

### Utility Functions

The utility directory contains logic that is shared across different components.

```text
storage.ts
dateUtils.ts
taskUtils.ts
```

These utilities are responsible for functionality such as:

* Saving and loading application data
* Date calculations
* Task filtering
* Task sorting
* Task statistics
* Task-related operations

## Data Storage

The application uses the browser's **localStorage API** instead of a backend database.

The following information can be stored locally:

* Tasks
* Categories
* Theme preferences
* Task-related settings

When application data changes, React updates the stored information.

When the application starts again, the stored information is loaded from the browser and restored into the application.

This architecture keeps the project lightweight and eliminates the need for:

* Backend hosting
* Database configuration
* Authentication
* API endpoints
* Server-side infrastructure

## Application Workflow

The general task workflow is:

```text
Create Task
     ↓
Add Task Details
     ↓
Assign Category
     ↓
Set Priority
     ↓
Add Due Date / Reminder
     ↓
Add Subtasks / Tags
     ↓
Save Task
     ↓
Organize Task
     ↓
Complete Task
     ↓
Track Progress
```

The dashboard and progress sections use the stored task information to generate productivity statistics.

## Performance and Usability

The application is designed to remain simple and responsive by keeping most task operations on the client side.

Since task data is stored locally:

* Tasks can be accessed quickly
* No network request is required for normal task operations
* The application can work without a backend
* Basic functionality remains available without an internet connection after the application is loaded

The component-based React architecture also makes individual features easier to maintain and modify.

## Current Limitations

### Local Storage Only

Task information is stored in the browser's localStorage.

As a result, data is not automatically synchronized between different:

* Devices
* Browsers
* Computers

A task created on one device will not automatically appear on another device.

### No Authentication

The current version does not provide:

* User registration
* Login
* Password management
* User profiles
* Account recovery

### No Backend

There is currently no server-side database or API layer.

The application therefore does not support:

* Real-time synchronization
* Multi-user collaboration
* Server-side data processing
* Centralized backups

### Browser Storage Limit

Browser localStorage has a limited storage capacity, generally around **5–10 MB per website origin**, depending on the browser and environment.

For normal task management this capacity is more than sufficient, but a larger application with extensive historical data or attachments would require a more scalable storage solution.

## Future Enhancements

Possible future improvements include:

* Cloud synchronization
* User authentication
* Cross-device task synchronization
* Calendar integration
* Recurring tasks
* Browser notifications
* Advanced productivity analytics
* Pomodoro focus mode
* Time tracking
* Kanban board
* Task templates
* Data export and import
* Task backup and restore
* Collaborative task management
* Progressive Web App support

These features can be introduced gradually without changing the core task-management architecture.

## Documentation

The project includes supporting documentation for development and maintenance.

| Document | Purpose |
| --- | --- |
| `QUICKSTART.md` | Quick instructions for running and using the application |
| `DEVELOPMENT_GUIDE.md` | Explanation of project architecture and development workflow |
| `CONTRIBUTING.md` | Guidelines for contributing to the project |
| `CHANGELOG.md` | Version history and planned improvements |
| `BUGFIXES.md` | Previously identified issues and their fixes |
| `ATTRIBUTIONS.md` | Third-party libraries, assets, and licenses |

## Deployment

After creating a production build:

```bash
npm run build
```

the contents of the `dist/` directory can be deployed to a static hosting platform.

Common deployment platforms include:

* **Vercel**
* **Netlify**
* **Cloudflare Pages**
* **GitHub Pages**

Because the current application does not require a backend server, it can be deployed as a static web application.

## Conclusion

The **Advanced To-Do List App** provides a complete client-side productivity experience by combining task management, organization, scheduling, progress tracking, filtering, drag-and-drop interactions, and responsive design in a single application.

Its modular React architecture makes it suitable for further development, while localStorage keeps the initial setup simple and eliminates the need for backend infrastructure.

The project also provides a strong foundation for future improvements such as cloud synchronization, authentication, collaborative workspaces, advanced analytics, calendar integration, and AI-assisted productivity features.
