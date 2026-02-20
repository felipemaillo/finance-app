'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { API_URL } from '../lib/api';
import { useAppContext } from '../context/AppContext';
import ThemeLanguageSelector from '../components/ThemeLanguageSelector';
import Loading from '../components/Loading';

const translations = {
  pt: {
    title: 'Bem-vindo de volta! 👋',
    subtitle: 'Acesse sua conta para gerenciar suas finanças',
    email: 'E-mail',
    password: 'Sua Senha',
    button: 'Entrar',
    noAccount: 'Não tem uma conta?',
    register: 'Cadastre-se aqui',
    error: '❌ E-mail ou senha incorretos.',
    loading: 'Autenticando...',
  },
  en: {
    title: 'Welcome back! 👋',
    subtitle: 'Log in to manage your finances',
    email: 'Email',
    password: 'Your Password',
    button: 'Login',
    noAccount: "Don't have an account?",
    register: 'Sign up here',
    error: '❌ Invalid email or password.',
    loading: 'Authenticating...',
  },
  it: {
    title: 'Bentornato! 👋',
    subtitle: 'Accedi per gestire as tue finanze',
    email: 'E-mail',
    password: 'Tua Password',
    button: 'Accedi',
    noAccount: 'Non hai un account?',
    register: 'Registrati qui',
    error: '❌ Email o password errati.',
    loading: 'Autenticazione...',
  },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { language, mounted } = useAppContext();
  const t = translations[language] || translations.it;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // --- ARMAZENAMENTO DAS CREDENCIAIS ---
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('familyId', data.user.familyId);

        // Esta é a linha crucial para o botão de Admin aparecer na Home:
        localStorage.setItem(
          'isSuperUser',
          data.user.isSuperUser ? 'true' : 'false',
        );

        router.push('/');
      } else {
        alert(t.error);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro ao conectar com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 p-6 transition-colors duration-300">
      <div className="mb-6">
        <ThemeLanguageSelector />
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-2xl w-full max-w-md border border-gray-100 dark:border-slate-800 transition-all">
        <h1 className="text-3xl font-black text-center mb-2 text-blue-600 dark:text-blue-400 tracking-tight">
          {t.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm font-medium">
          {t.subtitle}
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 ml-2 uppercase tracking-widest">
              {t.email}
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="email"
                required
                placeholder="exemplo@email.com"
                className="w-full p-4 pl-12 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 ml-2 uppercase tracking-widest">
              {t.password}
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full p-4 pl-12 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            disabled={isSubmitting}
            className="w-full bg-blue-600 dark:bg-blue-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loading />
            ) : (
              <>
                <LogIn size={20} /> {t.button}
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-600 dark:text-slate-400 text-sm">
          {t.noAccount}{' '}
          <Link
            href="/register"
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
          >
            <UserPlus size={16} /> {t.register}
          </Link>
        </p>
      </div>
    </div>
  );
}
