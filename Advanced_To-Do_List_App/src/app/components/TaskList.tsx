import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Category, FilterState } from '../types';
import { filterTasks, sortTasks } from '../utils/taskUtils';
import { TaskCard } from './TaskCard';
import { Filter, SortAsc } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  filters: FilterState;
  onToggleComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onReorderTasks: (tasks: Task[]) => void;
  theme: 'light' | 'dark';
}

export function TaskList({
  tasks,
  categories,
  filters,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onReorderTasks,
  theme,
}: TaskListProps) {
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'created'>('priority');
  const [groupBy, setGroupBy] = useState<'none' | 'priority' | 'category'>('none');

  const filteredTasks = filterTasks(tasks, filters);

  const sortedTasks = sortTasks(filteredTasks);

  const groupedTasks = React.useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Tasks': sortedTasks };
    }

    if (groupBy === 'priority') {
      return {
        'High Priority': sortedTasks.filter(t => t.priority === 'high'),
        'Medium Priority': sortedTasks.filter(t => t.priority === 'medium'),
        'Low Priority': sortedTasks.filter(t => t.priority === 'low'),
      };
    }

    if (groupBy === 'category') {
      const groups: Record<string, Task[]> = { 'Uncategorized': [] };

      categories.forEach(cat => {
        groups[cat.name] = sortedTasks.filter(t => t.categoryId === cat.id);
      });

      groups['Uncategorized'] = sortedTasks.filter(t => !t.categoryId);

      Object.keys(groups).forEach(key => {
        if (groups[key].length === 0) delete groups[key];
      });

      return groups;
    }

    return { 'All Tasks': sortedTasks };
  }, [groupBy, sortedTasks, categories]);

  const moveTask = (dragIndex: number, hoverIndex: number) => {
    const dragTask = sortedTasks[dragIndex];
    const newTasks = [...sortedTasks];
    newTasks.splice(dragIndex, 1);
    newTasks.splice(hoverIndex, 0, dragTask);
    onReorderTasks(newTasks);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {filters.category
              ? categories.find(c => c.id === filters.category)?.name
              : filters.priority
              ? `${filters.priority.charAt(0).toUpperCase() + filters.priority.slice(1)} Priority Tasks`
              : 'All Tasks'}
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''}
              >
                <Filter className="w-4 h-4 mr-2" />
                Group By
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setGroupBy('none')}>
                None
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGroupBy('priority')}>
                Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGroupBy('category')}>
                Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center py-12 ${
            theme === 'dark'
              ? 'bg-gray-800/30 border-gray-700'
              : 'bg-gray-50 border-gray-200'
          } rounded-xl border-2 border-dashed`}
        >
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {filters.search || filters.category || filters.priority
              ? 'No tasks match your filters'
              : 'No tasks yet. Create your first task!'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTasks).map(([groupName, groupTasks]) => {
            if (groupTasks.length === 0) return null;

            return (
              <div key={groupName}>
                {groupBy !== 'none' && (
                  <h3 className={`text-lg mb-4 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {groupName} ({groupTasks.length})
                  </h3>
                )}

                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {groupTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TaskCard
                          task={task}
                          categories={categories}
                          onToggleComplete={onToggleComplete}
                          onEdit={onEditTask}
                          onDelete={onDeleteTask}
                          theme={theme}
                          index={index}
                          moveTask={moveTask}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
