import { Task, TaskStats, FilterState, Category } from '../types';
import { isToday, isThisWeek, isOverdue } from './dateUtils';

export function calculateTaskStats(tasks: Task[], categories: Category[]): TaskStats {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active = total - completed;

  const overdue = tasks.filter(
    t => !t.completed && t.dueDate && isOverdue(t.dueDate)
  ).length;

  const dueToday = tasks.filter(
    t => !t.completed && t.dueDate && isToday(t.dueDate)
  ).length;

  const dueThisWeek = tasks.filter(
    t => !t.completed && t.dueDate && isThisWeek(t.dueDate)
  ).length;

  const byPriority = {
    high: tasks.filter(t => !t.completed && t.priority === 'high').length,
    medium: tasks.filter(t => !t.completed && t.priority === 'medium').length,
    low: tasks.filter(t => !t.completed && t.priority === 'low').length,
  };

  const byCategory: Record<string, number> = {};
  categories.forEach(cat => {
    byCategory[cat.id] = tasks.filter(t => !t.completed && t.categoryId === cat.id).length;
  });

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    active,
    overdue,
    dueToday,
    dueThisWeek,
    byPriority,
    byCategory,
    completionRate,
  };
}

export function filterTasks(tasks: Task[], filters: FilterState): Task[] {
  return tasks.filter(task => {

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(searchLower);
      const matchesDescription = task.description?.toLowerCase().includes(searchLower);
      const matchesTags = task.tags.some(tag => tag.toLowerCase().includes(searchLower));

      if (!matchesTitle && !matchesDescription && !matchesTags) {
        return false;
      }
    }

    if (filters.category && task.categoryId !== filters.category) {
      return false;
    }

    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }

    if (filters.status === 'completed' && !task.completed) {
      return false;
    }
    if (filters.status === 'active' && task.completed) {
      return false;
    }

    return true;
  });
}

export function sortTasks(tasks: Task[]): Task[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  return [...tasks].sort((a, b) => {

    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getTaskCompletionPercentage(task: Task): number {
  if (task.subtasks.length === 0) {
    return task.completed ? 100 : 0;
  }

  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  return Math.round((completedSubtasks / task.subtasks.length) * 100);
}
