'use client';
import { Sun, Moon, Globe } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const languages = [
  { code: 'pt', name: 'Português' },
  { code: 'en', name: 'English' },
  { code: 'it', name: 'Italiano' },
];

export default function ThemeLanguageSelector() {
  const { language, setLanguage, theme, setTheme } = useAppContext();

  return (
    <div className="flex items-center gap-2">
      {/* Seletor de Idioma */}
      <div className="relative group">
        <button className="p-2.5 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-blue-400 transition-all flex items-center gap-1">
          <Globe size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
            {language.toUpperCase()}
          </span>
        </button>
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 hidden group-hover:block z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${
                language === lang.code
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
              } ${lang.code === 'en' ? 'border-t dark:border-slate-700' : ''}`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Seletor de Tema */}
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="p-2.5 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-yellow-400 transition-all"
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>
    </div>
  );
}
