import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from './ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  theme: 'light' | 'dark';
  placeholder?: string;
  /** Delay (ms) before onChange fires while typing. Set 0 to disable. */
  debounceMs?: number;
  /** Optional number of matches, shown as a small badge. */
  resultCount?: number;
  /** Focus the input with "/" or Ctrl/Cmd+K. */
  enableShortcut?: boolean;
  autoFocus?: boolean;
}

function SearchBarComponent({
  value,
  onChange,
  theme,
  placeholder = 'Search tasks...',
  debounceMs = 250,
  resultCount,
  enableShortcut = true,
  autoFocus = false,
}: SearchBarProps) {
  const isDark = theme === 'dark';
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const [local, setLocal] = useState(value);
  const [pending, setPending] = useState(false);

  // Sync when the parent changes the value externally (e.g. "clear filters").
  useEffect(() => {
    setLocal(value);
    setPending(false);
  }, [value]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Global shortcut: "/" or Ctrl/Cmd + K focuses the search box.
  useEffect(() => {
    if (!enableShortcut) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      const isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';
      if (isCmdK || (e.key === '/' && !typing)) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enableShortcut]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      setLocal(next);
      clearTimeout(timerRef.current);
      if (debounceMs <= 0) {
        onChange(next);
        return;
      }
      setPending(true);
      timerRef.current = setTimeout(() => {
        onChange(next);
        setPending(false);
      }, debounceMs);
    },
    [debounceMs, onChange],
  );

  const clear = useCallback(() => {
    clearTimeout(timerRef.current);
    setLocal('');
    setPending(false);
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (local) clear();
      else inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      // Flush the debounce immediately.
      clearTimeout(timerRef.current);
      setPending(false);
      onChange(local);
    }
  };

  const iconColor = isDark ? 'text-gray-400' : 'text-gray-500';
  const kbdStyle = isDark
    ? 'border-gray-600 text-gray-400 bg-gray-800'
    : 'border-gray-300 text-gray-500 bg-gray-50';

  return (
    <div className="relative" role="search">
      <Search
        aria-hidden
        className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${iconColor}`}
      />

      <Input
        ref={inputRef}
        type="text"
        role="searchbox"
        aria-label="Search tasks"
        autoComplete="off"
        spellCheck={false}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={local}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={`pl-10 pr-20 ${
          isDark
            ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
            : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
        }`}
      />

      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
        <AnimatePresence mode="wait" initial={false}>
          {pending ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={iconColor}
              aria-hidden
            >
              <Loader2 className="h-4 w-4 animate-spin" />
            </motion.span>
          ) : local && typeof resultCount === 'number' ? (
            <motion.span
              key="count"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              aria-live="polite"
              className={`text-xs tabular-nums ${iconColor}`}
            >
              {resultCount} {resultCount === 1 ? 'result' : 'results'}
            </motion.span>
          ) : null}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {local ? (
            <motion.button
              key="clear"
              type="button"
              onClick={clear}
              aria-label="Clear search"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.12 }}
              className={`rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 ${
                isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <X className="h-4 w-4" />
            </motion.button>
          ) : enableShortcut ? (
            <motion.kbd
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-hidden
              className={`hidden rounded border px-1.5 py-0.5 font-sans text-[10px] sm:inline-block ${kbdStyle}`}
            >
              /
            </motion.kbd>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export const SearchBar = memo(SearchBarComponent);
