'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '../lib/api';
import { useAppContext } from '../context/AppContext';
import ThemeLanguageSelector from '../components/ThemeLanguageSelector';

const translations = {
  pt: {
    title: 'Nosso Financeiro 🏠',
    subtitle: 'Bem-vindo de volta!',
    email: 'E-mail',
    password: 'Senha',
    button: 'Entrar',
    noAccount: 'Ainda não tem conta?',
    register: 'Cadastre-se',
    errorLogin: '❌ E-mail ou senha incorretos!',
    errorServer: '❌ Erro ao conectar com o servidor.',
  },
  en: {
    title: 'Our Finances 🏠',
    subtitle: 'Welcome back!',
    email: 'Email',
    password: 'Password',
    button: 'Login',
    noAccount: "Don't have an account?",
    register: 'Sign up here',
    errorLogin: '❌ Invalid email or password!',
    errorServer: '❌ Error connecting to the server.',
  },
  it: {
    title: 'Il Nostro Bilancio 🏠',
    subtitle: 'Bentornato!',
    email: 'E-mail',
    password: 'Password',
    button: 'Accedi',
    noAccount: 'Non hai un account?',
    register: 'Registrati',
    errorLogin: '❌ E-mail o password errati!',
    errorServer: '❌ Errore di connessione al server.',
  },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { language, mounted } = useAppContext();
  const t = translations[language];

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('familyId', data.user.familyId);
        localStorage.setItem('userId', data.user.id);

        router.push('/');
      } else {
        alert(t.errorLogin);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      alert(t.errorServer);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-slate-950 p-6 transition-colors duration-300">
      {/* Seletor de idioma */}
      <div className="mb-6">
        <ThemeLanguageSelector />
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-xl w-full max-w-md border border-gray-100 dark:border-slate-800">
        <h1 className="text-3xl font-bold text-center mb-2 text-blue-600 dark:text-blue-400">
          {t.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm font-medium">
          {t.subtitle}
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-2 uppercase tracking-wider">
              {t.email}
            </label>
            <input
              type="email"
              required
              placeholder="seu@email.com"
              className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-gray-400 font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-2 uppercase tracking-wider">
              {t.password}
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-gray-400 font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="w-full bg-blue-600 dark:bg-blue-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 dark:hover:bg-blue-600 transition-all active:scale-[0.98] mt-4 text-lg">
            {t.button}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-600 dark:text-slate-400 text-sm">
          {t.noAccount}{' '}
          <Link
            href="/register"
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            {t.register}
          </Link>
        </p>
      </div>
    </div>
  );
}
