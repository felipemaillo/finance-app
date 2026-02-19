'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '../lib/api';
import { useAppContext } from '../context/AppContext';
import ThemeLanguageSelector from '../components/ThemeLanguageSelector';

const translations = {
  pt: {
    title: 'Criar Conta 📝',
    subtitle: 'Cadastre-se para começar',
    name: 'Nome',
    email: 'E-mail',
    family: 'Sua Família',
    selectFamily: 'Selecione a família...',
    password: 'Senha',
    button: 'Cadastrar',
    haveAccount: 'Já tem conta?',
    login: 'Faça login',
    alertFamily: 'Por favor, selecione uma família!',
    success: '✅ Usuário criado com sucesso!',
    serverError: '❌ Servidor offline.',
    fetchError: 'Não foi possível carregar as famílias.',
  },
  en: {
    title: 'Create Account 📝',
    subtitle: 'Sign up to get started',
    name: 'Name',
    email: 'Email',
    family: 'Your Family',
    selectFamily: 'Select family...',
    password: 'Password',
    button: 'Register',
    haveAccount: 'Already have an account?',
    login: 'Login here',
    alertFamily: 'Please select a family!',
    success: '✅ User created successfully!',
    serverError: '❌ Server offline.',
    fetchError: 'Could not load families.',
  },
  it: {
    title: 'Crea Account 📝',
    subtitle: 'Registrati per iniziare',
    name: 'Nome',
    email: 'E-mail',
    family: 'Tua Famiglia',
    selectFamily: 'Seleziona famiglia...',
    password: 'Password',
    button: 'Registrati',
    haveAccount: 'Hai già un account?',
    login: 'Accedi',
    alertFamily: 'Per favore, seleziona una famiglia!',
    success: '✅ Utente creato con successo!',
    serverError: '❌ Server offline.',
    fetchError: 'Impossibile caricare le famiglie.',
  },
};

export default function Register() {
  const { language, mounted } = useAppContext();
  const t = translations[language];

  const [families, setFamilies] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    family_id: '',
  });
  const router = useRouter();

  useEffect(() => {
    if (!mounted) return;

    fetch(`${API_URL}/families`)
      .then((res) => {
        if (!res.ok) throw new Error('Erro na rede');
        return res.json();
      })
      .then((data) => setFamilies(data))
      .catch((err) => {
        console.error('Erro:', err);
        alert(t.fetchError);
      });
  }, [mounted, t.fetchError]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.family_id) {
      alert(t.alertFamily);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        alert(t.success);
        router.push('/login');
      } else {
        alert('❌ Erro: ' + data.error);
      }
    } catch (error) {
      alert(t.serverError);
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

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Nome */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-2 uppercase tracking-wider">
              {t.name}
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Felipe"
              className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-gray-400 font-medium"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* E-mail */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-2 uppercase tracking-wider">
              {t.email}
            </label>
            <input
              type="email"
              required
              placeholder="seu@email.com"
              className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-gray-400 font-medium"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          {/* Família */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-2 uppercase tracking-wider">
              {t.family}
            </label>
            <select
              required
              className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 font-medium appearance-none"
              value={formData.family_id}
              onChange={(e) =>
                setFormData({ ...formData, family_id: e.target.value })
              }
            >
              <option value="">{t.selectFamily}</option>
              {families.map((f) => (
                <option key={f.id} value={f.id} className="dark:bg-slate-800">
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Senha */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-2 uppercase tracking-wider">
              {t.password}
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-gray-400 font-medium"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <button className="w-full bg-blue-600 dark:bg-blue-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 dark:hover:bg-blue-600 transition-all active:scale-[0.98] mt-4 text-lg">
            {t.button}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-600 dark:text-slate-400 text-sm">
          {t.haveAccount}{' '}
          <Link
            href="/login"
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            {t.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
