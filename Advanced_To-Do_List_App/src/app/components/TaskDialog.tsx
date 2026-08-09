import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Calendar as CalendarIcon, Clock, Timer } from 'lucide-react';
import { Task, Category, Priority, Subtask } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  categories: Category[];
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  theme: 'light' | 'dark';
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  categories,
  onSave,
  theme,
}: TaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [categoryId, setCategoryId] = useState<string>('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [reminder, setReminder] = useState<Date | undefined>(undefined);
  const [durationHours, setDurationHours] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Initialize form with task data if editing
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setCategoryId(task.categoryId || 'none');
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      setReminder(task.reminder ? new Date(task.reminder) : undefined);

      if (task.duration) {
        const hours = Math.floor(task.duration / 60);
        const minutes = task.duration % 60;
        setDurationHours(hours);
        setDurationMinutes(minutes);
      } else {
        setDurationHours(0);
        setDurationMinutes(0);
      }

      setSubtasks(task.subtasks);
      setTags(task.tags);
    } else {
      resetForm();
    }
  }, [task, open]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategoryId('none');
    setDueDate(undefined);
    setReminder(undefined);
    setDurationHours(0);
    setDurationMinutes(0);
    setSubtasks([]);
    setNewSubtask('');
    setTags([]);
    setNewTag('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    // Calculate total duration in minutes
    const totalDuration = (durationHours * 60) + durationMinutes;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      categoryId: categoryId === 'none' ? null : categoryId || null,
      dueDate: dueDate?.toISOString(),
      reminder: reminder?.toISOString(),
      duration: totalDuration > 0 ? totalDuration : undefined,
      subtasks,
      tags,
      completed: task?.completed || false,
      completedAt: task?.completedAt,
    });

    resetForm();
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;

    setSubtasks([
      ...subtasks,
      {
        id: Date.now().toString(),
        title: newSubtask.trim(),
        completed: false,
      },
    ]);
    setNewSubtask('');
  };

  const toggleSubtask = (subtaskId: string) => {
    setSubtasks(
      subtasks.map(st =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      )
    );
  };

  const deleteSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter(st => st.id !== subtaskId));
  };

  const addTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return;

    setTags([...tags, newTag.trim()]);
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
      }`}>
        <DialogHeader>
          <DialogTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription className={theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}>
            {task ? 'Edit the details of your task.' : 'Add a new task to your list.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className={theme === 'dark' ? 'text-gray-300' : ''}>
              Task Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className={theme === 'dark' ? 'text-gray-300' : ''}>
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}
            />
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority" className={theme === 'dark' ? 'text-gray-300' : ''}>
                Priority
              </Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
                <SelectTrigger
                  id="priority"
                  className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className={theme === 'dark' ? 'text-gray-300' : ''}>
                Category
              </Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger
                  id="category"
                  className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date and Reminder */}
          <div className="space-y-4">
            {/* Due Date */}
            <div className="space-y-2">
              <Label className={theme === 'dark' ? 'text-gray-300' : ''}>
                Due Date & Time
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : ''
                      }`}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {dueDate ? dueDate.toLocaleDateString() : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex gap-2">
                  <Input
                    type="time"
                    value={dueDate ? dueDate.toTimeString().slice(0, 5) : ''}
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      const newDate = dueDate ? new Date(dueDate) : new Date();
                      newDate.setHours(hours, minutes, 0, 0);
                      setDueDate(newDate);
                    }}
                    className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}
                    disabled={!dueDate}
                  />
                  {dueDate && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setDueDate(undefined)}
                      className="shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Reminder */}
            <div className="space-y-2">
              <Label className={theme === 'dark' ? 'text-gray-300' : ''}>
                Reminder Date & Time
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : ''
                      }`}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      {reminder ? reminder.toLocaleDateString() : 'Set reminder'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={reminder}
                      onSelect={setReminder}
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex gap-2">
                  <Input
                    type="time"
                    value={reminder ? reminder.toTimeString().slice(0, 5) : ''}
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      const newDate = reminder ? new Date(reminder) : new Date();
                      newDate.setHours(hours, minutes, 0, 0);
                      setReminder(newDate);
                    }}
                    className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}
                    disabled={!reminder}
                  />
                  {reminder && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setReminder(undefined)}
                      className="shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Duration / Time Limit */}
            <div className="space-y-2">
              <Label className={theme === 'dark' ? 'text-gray-300' : ''}>
                Estimated Duration
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="duration-hours" className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Hours
                  </Label>
                  <Input
                    id="duration-hours"
                    type="number"
                    min="0"
                    max="999"
                    value={durationHours || ''}
                    onChange={(e) => setDurationHours(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="duration-minutes" className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Minutes
                  </Label>
                  <Input
                    id="duration-minutes"
                    type="number"
                    min="0"
                    max="59"
                    value={durationMinutes || ''}
                    onChange={(e) => setDurationMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    placeholder="0"
                    className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}
                  />
                </div>
              </div>
              {(durationHours > 0 || durationMinutes > 0) && (
                <div className={`flex items-center gap-1.5 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Timer className="w-3.5 h-3.5" />
                  <span>
                    Task should take{' '}
                    {durationHours > 0 && `${durationHours}h `}
                    {durationMinutes > 0 && `${durationMinutes}m`}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className={theme === 'dark' ? 'text-gray-300' : ''}>
              Subtasks
            </Label>

            <div className="flex gap-2">
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                placeholder="Add a subtask..."
                className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
              <Button type="button" onClick={addSubtask} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <AnimatePresence>
              {subtasks.length > 0 && (
                <div className="space-y-2 mt-3">
                  {subtasks.map(subtask => (
                    <motion.div
                      key={subtask.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className={`flex items-center gap-2 p-2 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                      }`}
                    >
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={() => toggleSubtask(subtask.id)}
                      />
                      <span className={`flex-1 text-sm ${
                        subtask.completed
                          ? theme === 'dark' ? 'line-through text-gray-500' : 'line-through text-gray-400'
                          : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {subtask.title}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSubtask(subtask.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className={theme === 'dark' ? 'text-gray-300' : ''}>
              Tags
            </Label>

            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}
              />
              <Button type="button" onClick={addTag} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className={`flex items-center gap-1 ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className={theme === 'dark' ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : ''}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}