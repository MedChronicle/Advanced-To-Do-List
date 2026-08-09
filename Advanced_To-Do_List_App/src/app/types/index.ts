
export type Priority = 'high' | 'medium' | 'low';

export type TaskStatus = 'active' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  categoryId: string | null;
  dueDate?: string;
  reminder?: string;
  duration?: number;
  subtasks: Subtask[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface FilterState {
  search: string;
  category: string | null;
  priority: Priority | null;
  status: 'all' | 'active' | 'completed' | null;
}

export interface TaskStats {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  byCategory: Record<string, number>;
  completionRate: number;
}