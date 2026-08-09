import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Moon, Sun, Plus, LayoutDashboard, CheckSquare, Sparkles } from 'lucide-react';
import { Button } from './components/ui/button';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TaskList } from './components/TaskList';
import { TaskDialog } from './components/TaskDialog';
import { SearchBar } from './components/SearchBar';
import { ProgressPage } from './components/ProgressPage';
import { Task, Category, FilterState } from './types';
import { getFromStorage, saveToStorage } from './utils/storage';

export default function App() {

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const [tasks, setTasks] = useState<Task[]>(() => getFromStorage('tasks', []));

  const [categories, setCategories] = useState<Category[]>(() =>
    getFromStorage('categories', [
      { id: '1', name: 'Work', color: '#3b82f6' },
      { id: '2', name: 'Personal', color: '#10b981' },
      { id: '3', name: 'Communication Skills', color: '#f59e0b' },
      { id: '4', name: 'Health', color: '#ef4444' },
    ])
  );

  const [view, setView] = useState<'dashboard' | 'tasks' | 'progress'>('dashboard');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: null,
    priority: null,
    status: null,
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveToStorage('tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    saveToStorage('categories', categories);
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleAddTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleReorderTasks = (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks);
  };

  const handleToggleComplete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    handleUpdateTask(taskId, {
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : undefined,
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsTaskDialogOpen(false);
    setEditingTask(null);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`min-h-screen transition-colors duration-500 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-[#1a1a1a] via-[#252525] to-[#1a1a1a]'
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }`}>
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

          <div className="flex-1 flex flex-col overflow-hidden">
            <header className={`border-b transition-all duration-300 ${
              theme === 'dark' ? 'bg-[#1a1a1a]/80 border-[#2a2a2a] shadow-xl shadow-black/20' : 'bg-white/80 border-gray-200 shadow-lg shadow-gray-200/50'
            } backdrop-blur-xl`}>
              <div className="px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ rotate: 180, scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Sparkles className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    </motion.div>
                    <div>
                      <h1 className={`text-2xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {view === 'dashboard' ? 'Dashboard' : view === 'progress' ? 'Progress' : 'My Tasks'}
                      </h1>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {view === 'dashboard'
                          ? 'Your productivity overview'
                          : view === 'progress'
                          ? 'Track your daily progress'
                          : 'Manage your tasks efficiently'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {view === 'tasks' && (
                      <div className="hidden sm:block">
                        <SearchBar
                          value={filters.search}
                          onChange={(value) => setFilters({ ...filters, search: value })}
                          theme={theme}
                        />
                      </div>
                    )}

                    <Button
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      variant="outline"
                      size="icon"
                      className={`transition-all duration-300 ${
                        theme === 'dark'
                          ? 'bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#353535] shadow-lg shadow-black/30'
                          : 'bg-white border-gray-300 hover:bg-gray-50 shadow-md shadow-gray-200/50'
                      }`}
                    >
                      {theme === 'dark' ? (
                        <Sun className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <Moon className="w-5 h-5 text-gray-700" />
                      )}
                    </Button>

                    <Button
                      onClick={() => setIsTaskDialogOpen(true)}
                      className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-xl shadow-blue-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      <span className="hidden sm:inline">New Task</span>
                    </Button>
                  </div>
                </div>

                {view === 'tasks' && (
                  <div className="mt-4 sm:hidden">
                    <SearchBar
                      value={filters.search}
                      onChange={(value) => setFilters({ ...filters, search: value })}
                      theme={theme}
                    />
                  </div>
                )}
              </div>
            </header>

            <main className="flex-1 overflow-y-auto">
              <div className="px-4 sm:px-6 lg:px-8 py-6">
                <AnimatePresence mode="wait">
                  {view === 'dashboard' ? (
                    <motion.div
                      key="dashboard"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Dashboard
                        tasks={tasks}
                        categories={categories}
                        onViewTasks={() => setView('tasks')}
                        theme={theme}
                      />
                    </motion.div>
                  ) : view === 'progress' ? (
                    <motion.div
                      key="progress"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProgressPage
                        tasks={tasks}
                        theme={theme}
                        categories={categories}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="tasks"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </main>
          </div>
        </div>

        <TaskDialog
          open={isTaskDialogOpen}
          onOpenChange={handleCloseDialog}
          task={editingTask}
          categories={categories}
          onSave={(taskData) => {
            if (editingTask) {
              handleUpdateTask(editingTask.id, taskData);
            } else {
              handleAddTask(taskData);
            }
            handleCloseDialog();
          }}
          theme={theme}
        />
      </div>
    </DndProvider>
  );
}