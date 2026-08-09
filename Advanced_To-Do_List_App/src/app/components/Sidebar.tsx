import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  CheckSquare,
  Tag,
  AlertCircle,
  Calendar,
  Star,
  Filter,
  X,
  TrendingUp
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Category, FilterState, Task } from '../types';
import { Badge } from './ui/badge';

interface SidebarProps {
  view: 'dashboard' | 'tasks' | 'progress';
  onViewChange: (view: 'dashboard' | 'tasks' | 'progress') => void;
  categories: Category[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  tasks: Task[];
  theme: 'light' | 'dark';
}

export function Sidebar({
  view,
  onViewChange,
  categories,
  filters,
  onFilterChange,
  tasks,
  theme,
}: SidebarProps) {
  const activeTasksCount = tasks.filter(t => !t.completed).length;
  const highPriorityCount = tasks.filter(t => !t.completed && t.priority === 'high').length;

  const getCategoryCount = (categoryId: string) => {
    return tasks.filter(t => !t.completed && t.categoryId === categoryId).length;
  };

  return (
    <aside className={`w-64 border-r flex-shrink-0 transition-all duration-300 ${
      theme === 'dark'
        ? 'bg-[#1a1a1a]/90 border-[#2a2a2a] shadow-2xl shadow-black/30'
        : 'bg-white/90 border-gray-200 shadow-lg shadow-gray-200/50'
    } backdrop-blur-xl hidden md:block`}>
      <div className="h-full flex flex-col">
        <div className="p-6">
          <h2 className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Navigation
          </h2>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <NavItem
            icon={<LayoutDashboard className="w-5 h-5" />}
            label="Dashboard"
            active={view === 'dashboard'}
            onClick={() => onViewChange('dashboard')}
            theme={theme}
          />

          <NavItem
            icon={<CheckSquare className="w-5 h-5" />}
            label="All Tasks"
            active={view === 'tasks' && !filters.category && !filters.priority}
            onClick={() => {
              onViewChange('tasks');
              onFilterChange({ ...filters, category: null, priority: null, status: null });
            }}
            count={activeTasksCount}
            theme={theme}
          />

          <NavItem
            icon={<TrendingUp className="w-5 h-5" />}
            label="Progress"
            active={view === 'progress'}
            onClick={() => onViewChange('progress')}
            theme={theme}
          />

          <Separator className={`my-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />

          <div className="px-3 mb-2">
            <p className={`text-xs uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Quick Filters
            </p>
          </div>

          <NavItem
            icon={<Star className="w-5 h-5" />}
            label="High Priority"
            active={view === 'tasks' && filters.priority === 'high'}
            onClick={() => {
              onViewChange('tasks');
              onFilterChange({ ...filters, priority: 'high', category: null });
            }}
            count={highPriorityCount}
            theme={theme}
          />

          <NavItem
            icon={<Calendar className="w-5 h-5" />}
            label="Today"
            active={false}
            onClick={() => {
              onViewChange('tasks');

            }}
            theme={theme}
          />

          <Separator className={`my-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />

          <div className="px-3 mb-2 flex items-center justify-between">
            <p className={`text-xs uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Categories
            </p>
          </div>

          {categories.map(category => (
            <NavItem
              key={category.id}
              icon={
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              }
              label={category.name}
              active={view === 'tasks' && filters.category === category.id}
              onClick={() => {
                onViewChange('tasks');
                onFilterChange({ ...filters, category: category.id, priority: null });
              }}
              count={getCategoryCount(category.id)}
              theme={theme}
            />
          ))}

          {(filters.search || filters.priority || filters.category) && (
            <>
              <Separator className={`my-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <div className="px-3 mb-2">
                <p className={`text-xs uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Active Filters
                </p>
              </div>

              <div className="px-3 space-y-2">
                {filters.search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <span className="truncate max-w-[150px]">Search: {filters.search}</span>
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => onFilterChange({ ...filters, search: '' })}
                    />
                  </Badge>
                )}
                {filters.priority && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <span>Priority: {filters.priority}</span>
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => onFilterChange({ ...filters, priority: null })}
                    />
                  </Badge>
                )}
              </div>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>{tasks.length} total tasks</p>
            <p>{tasks.filter(t => t.completed).length} completed</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
  theme: 'light' | 'dark';
}

function NavItem({ icon, label, active, onClick, count, theme }: NavItemProps) {
  return (
    <motion.button
      whileHover={{ x: 4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300 ${
        active
          ? theme === 'dark'
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
            : 'bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-md shadow-blue-400/30'
          : theme === 'dark'
          ? 'text-gray-300 hover:bg-[#2a2a2a] hover:shadow-md hover:shadow-black/20'
          : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <Badge
          variant={active ? "secondary" : "outline"}
          className={`${active ? 'bg-white/20 text-white border-white/30' : ''}`}
        >
          {count}
        </Badge>
      )}
    </motion.button>
  );
}