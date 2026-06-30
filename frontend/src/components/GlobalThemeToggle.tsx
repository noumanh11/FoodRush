'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/useTheme';

export default function GlobalThemeToggle() {
  const { theme, mounted, toggleTheme } = useTheme();

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="fixed left-6 bottom-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background/70 shadow-lg backdrop-blur-xl transition-all hover:border-border/80 hover:bg-secondary/80 hover:shadow-xl"
    >
      {theme === 'light' ? (
        <Moon size={20} className="text-muted-foreground transition-colors" />
      ) : (
        <Sun size={20} className="text-amber-500" />
      )}
    </button>
  );
}
