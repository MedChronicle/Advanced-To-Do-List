import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { useDrag, useDrop } from 'react-dnd';
import {
  Calendar,
  Clock,
  Edit2,
  Trash2,
  AlertCircle,
  GripVertical,
  CheckCircle2,
  Circle,
  MoreVertical,
  Timer
} from 'lucide-react';
import { Task, Category } from '../types';
import { formatDate, formatDateTime, formatTime, formatDuration, isOverdue, isToday } from '../utils/dateUtils';
import { getTaskCompletionPercentage } from '../utils/taskUtils';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

interface TaskCardProps {
  task: Task;
  categories: Category[];
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  theme: 'light' | 'dark';
  index: number;
  moveTask: (dragIndex: number, hoverIndex: number) => void;
}

const ITEM_TYPE = 'TASK';

export function TaskCard({
  task,
  categories,
  onToggleComplete,
  onEdit,
  onDelete,
  theme,
  index,
  moveTask,
}: TaskCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (item: { index: number }) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      moveTask(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  const category = categories.find(c => c.id === task.categoryId);
  const completionPercentage = getTaskCompletionPercentage(task);
  const isTaskOverdue = task.dueDate && !task.completed && isOverdue(task.dueDate);
  const isDueToday = task.dueDate && !task.completed && isToday(task.dueDate);

  const priorityColors = {
    high: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
    medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' },
    low: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  };

  const priorityColor = priorityColors[task.priority];

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card className={`group hover:shadow-lg transition-all duration-200 ${
        theme === 'dark'
          ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
          : 'bg-white border-gray-200 hover:border-gray-300'
      } ${task.completed ? 'opacity-60' : ''}`}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing ${
              theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              <GripVertical className="w-5 h-5" />
            </div>

            <div className="pt-1">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggleComplete(task.id)}
                className="w-5 h-5"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3
                  className={`text-lg leading-tight ${
                    task.completed
                      ? theme === 'dark' ? 'line-through text-gray-500' : 'line-through text-gray-400'
                      : theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {task.title}
                </h3>

                <Badge
                  variant="outline"
                  className={`${priorityColor.bg} ${priorityColor.text} ${priorityColor.border} border shrink-0`}
                >
                  {task.priority}
                </Badge>
              </div>

              {task.description && (
                <p className={`text-sm mb-3 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {task.description}
                </p>
              )}

              {task.subtasks.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {task.subtasks.filter(st => st.completed).length} of {task.subtasks.length} subtasks
                    </span>
                    <span className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {completionPercentage}%
                    </span>
                  </div>
                  <Progress value={completionPercentage} className="h-1.5" />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 text-sm">
                {category && (
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      {category.name}
                    </span>
                  </div>
                )}

                {task.dueDate && (
                  <div className={`flex items-center gap-1.5 ${
                    isTaskOverdue
                      ? 'text-red-500'
                      : isDueToday
                      ? 'text-orange-500'
                      : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDateTime(task.dueDate)}</span>
                    {isTaskOverdue && <AlertCircle className="w-3.5 h-3.5" />}
                  </div>
                )}

                {task.reminder && (
                  <div className={`flex items-center gap-1.5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDateTime(task.reminder)}</span>
                  </div>
                )}

                {task.duration && (
                  <div className={`flex items-center gap-1.5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <Timer className="w-3.5 h-3.5" />
                    <span>{formatDuration(task.duration)}</span>
                  </div>
                )}

                {task.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className={`text-xs ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(task.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </div>
  );
}