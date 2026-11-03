// src/app/App.tsx
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Toaster, toast } from 'sonner';
import { Moon, Sun, Plus, Sparkles } from 'lucide-react';
import { Button } from './components/ui/button';
import { Sidebar } from './components/Sidebar';
import { TaskList } from './components/TaskList';
import { TaskDialog } from './components/TaskDialog';
import { SearchBar } from './components/SearchBar';
import type { Task, Category, FilterState } from './types';
import { getFromStorage, saveToStorage } from './utils/storage';

// Heavy views (Recharts) load on demand
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const ProgressPage = lazy(() => import('./components/ProgressPage').then(m => ({ default: m.ProgressPage })));

type Theme = 'light' | 'dark';
type View = 'dashboard' | 'tasks' | 'progress';
type TaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Work', color: '#3b82f6' },
  { id: '2', name: 'Personal', color: '#10b981' },
  { id: '3', name: 'Communication Skills', color: '#f59e0b' },
  { id: '4', name: 'Health', color: '#ef4444' },
];

const EMPTY_FILTERS: FilterState = { search: '', category: null, priority: null, status: null };

const VIEW_META: Record<View, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Your productivity overview' },
  progress: { title: 'Progress', subtitle: 'Track your daily progress' },
  tasks: { title: 'My Tasks', subtitle: 'Manage your tasks efficiently' },
};

const VIEW_SHORTCUTS: Record<string, View> = { '1': 'dashboard', '2': 'tasks', '3': 'progress' };

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Saved choice first, then the OS preference (same logic as the inline script in index.html). */
function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* storage unavailable */ }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

function ViewFallback({ theme }: { theme: Theme }) {
  return (
    <div className="grid place-items-center py-24" role="status" aria-label="Loading view">
      <div
        className={`h-8 w-8 animate-spin rounded-full border-2 border-t-transparent ${
          theme === 'dark' ? 'border-blue-400' : 'border-blue-600'
        }`}
      />
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [tasks, setTasks] = useState<Task[]>(() => getFromStorage<Task[]>('tasks', []));
  const [categories, setCategories] = useState<Category[]>(() =>
    getFromStorage<Category[]>('categories', DEFAULT_CATEGORIES)
  );
  const [view, setView] = useState<View>('dashboard');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  // Latest tasks for handlers that need to read state without re-creating themselves
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  // ───────── Persistence ─────────
  useEffect(() => { saveToStorage('tasks', tasks); }, [tasks]);
  useEffect(() => { saveToStorage('categories', categories); }, [categories]);
  useEffect(() => {
    try { localStorage.setItem('theme', theme); } catch { /* ignore */ }
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    root.classList.add('theme-transition'); // smooth colour fade, defined in the theme CSS
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
    window.setTimeout(() => root.classList.remove('theme-transition'), 350);
  }, []);

  // ───────── Task handlers (functional updates: never act on stale state) ─────────
  const handleAddTask = useCallback((task: TaskInput) => {
    const now = new Date().toISOString();
    setTasks(prev => [{ ...task, id: newId(), createdAt: now, updatedAt: now }, ...prev]);
  }, []);

  const handleUpdateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    const now = new Date().toISOString();
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, ...updates, updatedAt: now } : t)));
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    const index = tasksRef.current.findIndex(t => t.id === taskId);
    if (index === -1) return;
    const removed = tasksRef.current[index];

    setTasks(prev => prev.filter(t => t.id !== taskId));

    toast(`Deleted “${removed.title}”`, {
      action: {
        label: 'Undo',
        onClick: () =>
          setTasks(prev => {
            const next = [...prev];
            next.splice(Math.min(index, next.length), 0, removed);
            return next;
          }),
      },
    });
  }, []);

  const handleReorderTasks = useCallback((reordered: Task[]) => setTasks(reordered), []);

  const handleToggleComplete = useCallback((taskId: string) => {
    const task = tasksRef.current.find(t => t.id === taskId);
    if (!task) return;
    const completing = !task.completed;

    handleUpdateTask(taskId, {
      completed: completing,
      completedAt: completing ? new Date().toISOString() : undefined,
    });

    // Small celebration, loaded on demand and skipped for reduced-motion users
    if (completing && !prefersReducedMotion()) {
      import('canvas-confetti')
        .then(m => m.default({ particleCount: 60, spread: 70, origin: { y: 0.7 }, disableForReducedMotion: true }))
        .catch(() => { /* non-critical */ });
    }
  }, [handleUpdateTask]);

  // ───────── Dialog ─────────
  const openNewTask = useCallback(() => {
    setEditingTask(null);
    setIsTaskDialogOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsTaskDialogOpen(false);
    setEditingTask(null);
  }, []);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => { if (!open) handleCloseDialog(); },
    [handleCloseDialog]
  );

  const handleSave = useCallback((taskData: TaskInput) => {
    if (editingTask) handleUpdateTask(editingTask.id, taskData);
    else handleAddTask(taskData);
    handleCloseDialog();
  }, [editingTask, handleUpdateTask, handleAddTask, handleCloseDialog]);

  // ───────── Keyboard shortcuts: N = new task, 1/2/3 = switch view ─────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target) || isTaskDialogOpen) return;
      if (e.key.toLowerCase() === 'n') { e.preventDefault(); openNewTask(); }
      else if (VIEW_SHORTCUTS[e.key]) setView(VIEW_SHORTCUTS[e.key]);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isTaskDialogOpen, openNewTask]);

  // ───────── Derived UI ─────────
  const dark = theme === 'dark';
  const meta = VIEW_META[view];
  const handleSearch = useCallback((search: string) => setFilters(f => ({ ...f, search })), []);

  const searchBar = useMemo(
    () => <SearchBar value={filters.search} onChange={handleSearch} theme={theme} />,
    [filters.search, handleSearch, theme]
  );

  let content: React.ReactNode;
  if (view === 'dashboard') {
    content = <Dashboard tasks={tasks} categories={categories} onViewTasks={() => setView('tasks')} theme={theme} />;
  } else if (view === 'progress') {
    content = <ProgressPage tasks={tasks} categories={categories} theme={theme} />;
  } else {
    content = (
      <TaskList
        tasks={tasks}
        categories={categories}
        filters={filters}
        onToggleComplete={handleToggleComplete}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onReorderTasks={handleReorderTasks}
        theme={theme}
      />
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={`min-h-screen transition-colors duration-500 ${
          dark
            ? 'bg-gradient-to-br from-[#1a1a1a] via-[#252525] to-[#1a1a1a]'
            : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
        }`}
      >
        <div className="flex h-screen overflow-hidden">
          <Sidebar
            view={view}
            onViewChange={setView}
            categories={categories}
            filters={filters}
            onFilterChange={setFilters}
            tasks={tasks}
            theme={theme}
          />

          <div className="flex flex-1 flex-col overflow-hidden">
            <header
              className={`border-b backdrop-blur-xl transition-all duration-300 ${
                dark
                  ? 'border-[#2a2a2a] bg-[#1a1a1a]/80 shadow-xl shadow-black/20'
                  : 'border-gray-200 bg-white/80 shadow-lg shadow-gray-200/50'
              }`}
            >
              <div className="px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <motion.div whileHover={{ rotate: 180, scale: 1.1 }} transition={{ duration: 0.3 }}>
                      <Sparkles className={`h-8 w-8 ${dark ? 'text-blue-400' : 'text-blue-600'}`} />
                    </motion.div>
                    <div>
                      <h1 className={`text-2xl ${dark ? 'text-white' : 'text-gray-900'}`}>{meta.title}</h1>
                      <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{meta.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {view === 'tasks' && <div className="hidden sm:block">{searchBar}</div>}

                    <Button
                      onClick={toggleTheme}
                      variant="outline"
                      size="icon"
                      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
                      className={`transition-all duration-300 ${
                        dark
                          ? 'border-[#3a3a3a] bg-[#2a2a2a] shadow-lg shadow-black/30 hover:bg-[#353535]'
                          : 'border-gray-300 bg-white shadow-md shadow-gray-200/50 hover:bg-gray-50'
                      }`}
                    >
                      {dark ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-700" />}
                    </Button>

                    <Button
                      onClick={openNewTask}
                      title="New task (N)"
                      className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-xl shadow-blue-500/40 transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-blue-600 hover:shadow-2xl hover:shadow-blue-500/50"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      <span className="hidden sm:inline">New Task</span>
                    </Button>
                  </div>
                </div>

                {view === 'tasks' && <div className="mt-4 sm:hidden">{searchBar}</div>}
              </div>
            </header>

            <main className="flex-1 overflow-y-auto">
              <div className="px-4 py-6 sm:px-6 lg:px-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Suspense fallback={<ViewFallback theme={theme} />}>{content}</Suspense>
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          </div>
        </div>

        <TaskDialog
          open={isTaskDialogOpen}
          onOpenChange={handleDialogOpenChange}
          task={editingTask}
          categories={categories}
          onSave={handleSave}
          theme={theme}
        />

        <Toaster theme={theme} position="bottom-right" closeButton />
      </div>
    </DndProvider>
  );
}
