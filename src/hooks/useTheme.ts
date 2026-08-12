import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
const THEME_KEY = 'sourcingly_theme';
const THEME_EVENT = 'sourcingly:theme';

function applyTheme(theme: Theme) {
  if (theme === 'dark') document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = (localStorage.getItem(THEME_KEY) as Theme) ?? 'light';
    applyTheme(stored);
    return stored;
  });

  useEffect(() => {
    const handle = () => {
      const stored = (localStorage.getItem(THEME_KEY) as Theme) ?? 'light';
      setTheme(stored);
    };
    window.addEventListener(THEME_EVENT, handle);
    return () => window.removeEventListener(THEME_EVENT, handle);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
    setTheme(next);
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return { theme, toggleTheme };
}
