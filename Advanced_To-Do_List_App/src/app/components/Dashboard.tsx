import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Star,
  ArrowRight
} from 'lucide-react';
import { Task, Category } from '../types';
import { calculateTaskStats } from '../utils/taskUtils';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface DashboardProps {
  tasks: Task[];
  categories: Category[];
  onViewTasks: () => void;
  theme: 'light' | 'dark';
}

export function Dashboard({ tasks, categories, onViewTasks, theme }: DashboardProps) {
  const stats = calculateTaskStats(tasks, categories);

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: 'blue',
      bgColor: theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Active Tasks',
      value: stats.active,
      icon: <Clock className="w-6 h-6" />,
      color: 'purple',
      bgColor: theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-50',
      iconColor: 'text-purple-500',
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: 'green',
      bgColor: theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50',
      iconColor: 'text-green-500',
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'red',
      bgColor: theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50',
      iconColor: 'text-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-blue-600 to-purple-600'
            : 'bg-gradient-to-r from-blue-500 to-purple-500'
        } text-white`}
      >
        <h2 className="text-3xl mb-2">Welcome back!</h2>
        <p className="opacity-90">
          You have {stats.active} active tasks. Let's get things done! 🚀
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-6 ${
              theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <div className={stat.iconColor}>{stat.icon}</div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                  className={`text-3xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                >
                  {stat.value}
                </motion.div>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.title}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className={`p-6 ${
          theme === 'dark'
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Overall Progress
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Your completion rate
              </p>
            </div>
            <div className={`text-3xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {stats.completionRate}%
            </div>
          </div>
          <Progress value={stats.completionRate} className="h-3" />
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className={`p-6 ${
            theme === 'dark'
              ? 'bg-gray-800/50 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg mb-4 flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Star className="w-5 h-5 text-yellow-500" />
              Priority Breakdown
            </h3>
            <div className="space-y-4">
              <PriorityItem
                label="High Priority"
                value={stats.byPriority.high}
                color="red"
                theme={theme}
              />
              <PriorityItem
                label="Medium Priority"
                value={stats.byPriority.medium}
                color="yellow"
                theme={theme}
              />
              <PriorityItem
                label="Low Priority"
                value={stats.byPriority.low}
                color="green"
                theme={theme}
              />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className={`p-6 ${
            theme === 'dark'
              ? 'bg-gray-800/50 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg mb-4 flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Calendar className="w-5 h-5 text-blue-500" />
              Upcoming Deadlines
            </h3>
            <div className="space-y-3">
              <DeadlineItem
                label="Due Today"
                value={stats.dueToday}
                theme={theme}
              />
              <DeadlineItem
                label="Due This Week"
                value={stats.dueThisWeek}
                theme={theme}
              />
            </div>
          </Card>
        </motion.div>
      </div>

      {categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className={`p-6 ${
            theme === 'dark'
              ? 'bg-gray-800/50 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Tasks by Category
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className={`p-4 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {category.name}
                    </p>
                  </div>
                  <p className={`text-2xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {stats.byCategory[category.id] || 0}
                  </p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center"
      >
        <Button
          onClick={onViewTasks}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
        >
          View All Tasks
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}

function PriorityItem({
  label,
  value,
  color,
  theme
}: {
  label: string;
  value: number;
  color: string;
  theme: 'light' | 'dark';
}) {
  const colorClasses = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`} />
        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </span>
      </div>
      <span className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  );
}

function DeadlineItem({
  label,
  value,
  theme
}: {
  label: string;
  value: number;
  theme: 'light' | 'dark';
}) {
  return (
    <div className={`p-3 rounded-lg ${
      theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
    }`}>
      <div className="flex items-center justify-between">
        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </span>
        <span className={`text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </span>
      </div>
    </div>
  );
}
