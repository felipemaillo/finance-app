'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(undefined);

export function AppProvider({ children }) {
  const [language, setLanguage] = useState('it');
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('appLang') || 'it';
    const savedTheme = localStorage.getItem('appTheme') || 'light';
    setLanguage(savedLang);
    setTheme(savedTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('appTheme', theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem('appLang', language);
  }, [language, mounted]);

  const value = {
    language,
    setLanguage,
    theme,
    setTheme,
    mounted,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
