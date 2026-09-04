# Advanced To-Do List App

The **Advanced To-Do List App** is a modern task management application built using **React, TypeScript, and Tailwind CSS**. It is designed to make everyday task management easier by combining simple to-do features with useful tools such as task categories, priorities, subtasks, tags, reminders, due dates, progress tracking, and drag-and-drop organization.

The application also includes a dashboard where users can quickly see their task progress and an option to switch between light and dark themes. All task information is stored locally in the browser, so users can continue using the app without creating an account or depending on a backend server.

> This project was originally exported from Figma Make. The README and supporting documentation describe how the application is actually implemented in the codebase.

## Features

### Task Management

Users can create tasks with details such as:

* Task title and description
* Priority level
* Category
* Due date
* Reminder
* Estimated time required
* Subtasks
* Tags

Tasks can be marked as **completed or incomplete**, and individual subtasks can also be managed separately. Users can rearrange tasks easily using **drag-and-drop functionality**.

### Organization

The application provides several ways to keep tasks organized.

It comes with four default categories:

* **Work**
* **Personal**
* **Communication Skills**
* **Health**

Each category has its own color to make it easier to identify tasks visually.

Users can also assign tasks a priority:

* High
* Medium
* Low

In addition, free-form tags can be added to tasks. The built-in search feature allows users to search through task titles, descriptions, and tags.

Tasks can be filtered based on:

* Category
* Priority
* Active or completed status

## Different Views

The application is divided into three main views.

### Dashboard

The dashboard gives users a quick overview of their productivity. It displays information such as:

* Total number of tasks
* Active tasks
* Completed tasks
* Overdue tasks
* Tasks due today
* Tasks due this week
* Overall completion rate
* Priority breakdown
* Category breakdown

This allows users to understand their current workload without having to go through every task individually.

### Tasks

The Tasks page contains the complete task list. Users can search, filter, sort, complete, edit, delete, and reorder tasks using drag-and-drop.

### Progress

The Progress page focuses on tracking task completion over time. It gives users a clearer picture of how consistently they are completing their work.

## User Interface and Experience

The application is designed to work smoothly across different screen sizes, including **mobile phones, tablets, and desktops**.

It supports both **light and dark themes**, and the selected theme is saved so that it remains active when the user returns to the application.

Animations and small interface interactions are handled using **Motion (Framer Motion)**, making actions such as opening dialogs, changing views, and updating tasks feel smoother.

## Technology Used

| Area          | Technology             |
| ------------- | ---------------------- |
| Framework     | React 18 + TypeScript  |
| Build Tool    | Vite 6                 |
| Styling       | Tailwind CSS v4        |
| UI Components | shadcn/ui + Radix UI   |
| Animations    | Motion (Framer Motion) |
| Drag & Drop   | react-dnd              |
| Icons         | lucide-react           |
| Charts        | Recharts               |
| Data Storage  | Browser localStorage   |

## Getting Started

To run the project locally, you need **Node.js 18 or newer** along with npm or pnpm.

First, install the required dependencies:

```bash
npm install
```

Then start the development server:

```bash
npm run dev
```

Vite will start the application and display the local address in the terminal. In most cases, it will be available at:

```text
http://localhost:5173
```

To create a production build, run:

```bash
npm run build
```

The production files will be generated inside the `dist/` folder. These files can then be deployed using services such as Vercel, Netlify, Cloudflare Pages, or GitHub Pages.

For a quick guide on using the application, refer to **QUICKSTART.md**.

## Project Structure

The project is organized into different folders so that each part of the application has a clear responsibility.

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

The main `App.tsx` file acts as the central point for the application's state. The utility files handle things such as storing data, working with dates, filtering tasks, sorting them, and calculating statistics.

## How the Application Stores Data

The application does not use a backend database. Instead, it uses the browser's **localStorage** to save information.

The main application data includes:

* Tasks
* Categories
* Theme settings

Whenever these values change, the application updates localStorage using React's `useEffect`. When the application is opened again, the saved information is loaded back into the app.

This approach makes the application simple to run because it does not require a server, database, or user account.

## Current Limitations

Although the application provides many useful features, there are a few limitations.

### No Cross-Device Synchronization

Because data is stored in localStorage, tasks are only available in the browser and device where they were created. They will not automatically appear on another computer or browser.

### No Backend

There is currently no backend server, user authentication, collaboration, or real-time synchronization.

### Browser Storage Limit

localStorage has a storage limit that is generally around **5–10 MB per website origin**. For a normal task list, this is more than enough, but it is still something to keep in mind if the application is expanded significantly in the future.

For previously fixed issues, refer to **BUGFIXES.md**. Future improvements and planned features are listed in **CHANGELOG.md**.

## Documentation

The project includes additional documentation to make development and maintenance easier.

| Document               | Purpose                                                         |
| ---------------------- | --------------------------------------------------------------- |
| `QUICKSTART.md`        | Quick guide for getting started with the application            |
| `DEVELOPMENT_GUIDE.md` | Explains the project architecture and how different files work  |
| `CONTRIBUTING.md`      | Guidelines for contributing to the project                      |
| `CHANGELOG.md`         | Version history and planned improvements                        |
| `BUGFIXES.md`          | Details about bugs that have already been fixed                 |
| `ATTRIBUTIONS.md`      | Third-party libraries, assets, and licenses used in the project |



