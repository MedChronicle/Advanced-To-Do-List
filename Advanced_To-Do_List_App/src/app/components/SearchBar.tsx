import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  theme: 'light' | 'dark';
}

export function SearchBar({ value, onChange, theme }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`} />
      <Input
        type="text"
        placeholder="Search tasks..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`pl-10 pr-10 ${
          theme === 'dark'
            ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
            : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
        }`}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className={`absolute right-3 top-1/2 -translate-y-1/2 ${
            theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
