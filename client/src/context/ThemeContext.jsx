import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext();
const THEME_STORAGE_KEY = 'sentinel-drive-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const isDark = theme === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (isDark) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }

    root.dataset.theme = theme;
    body.dataset.theme = theme;
    root.style.colorScheme = theme;
    body.style.backgroundColor = isDark ? '#050505' : '#f2f4f7';

    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [isDark, theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const value = useMemo(
    () => ({ isDark, theme, toggleTheme }),
    [isDark, theme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
