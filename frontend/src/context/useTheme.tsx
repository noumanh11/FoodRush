'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    theme: theme === 'system' ? systemTheme : theme,
    mounted,
    toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    setTheme,
  };
}
