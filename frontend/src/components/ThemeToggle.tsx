'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/useTheme';

export default function ThemeToggle() {
  const { theme, mounted, toggleTheme } = useTheme();

  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 text-muted-foreground shadow-sm backdrop-blur transition-colors"
        aria-label="Toggle theme"
      >
        <Sun size={18} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 text-foreground shadow-sm transition-all duration-300 hover:scale-105 hover:bg-secondary/80"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-pressed={theme === 'dark'}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
