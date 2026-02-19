'use client';
import { useAppContext } from '../context/AppContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeLanguageSelector() {
  const { language, setLanguage, theme, setTheme } = useAppContext();

  return (
    <div className="flex items-center gap-4">
      {/* Botão de Tema */}
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-yellow-400 transition-colors"
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {/* Bandeiras */}
      <div className="flex gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-full">
        {['pt', 'en', 'it'].map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
              language === lang
                ? 'bg-white dark:bg-slate-600 shadow-md scale-110'
                : 'opacity-40'
            }`}
          >
            {lang === 'pt' ? '🇧🇷' : lang === 'en' ? '🇺🇸' : '🇮🇹'}
          </button>
        ))}
      </div>
    </div>
  );
}
