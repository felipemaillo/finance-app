'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Users, Mail, User, ShieldCheck } from 'lucide-react';
import { API_URL } from '../lib/api';
import { useAppContext } from '../context/AppContext';
import ThemeLanguageSelector from '../components/ThemeLanguageSelector';
import Loading from '../components/Loading';

const translations = {
  pt: {
    title: 'Criar Conta 📝',
    subtitle: 'Cadastre-se para começar',
    name: 'Nome',
    email: 'E-mail',
    family: 'Sua Família',
    selectFamily: 'Selecione a família...',
    familyPassword: 'Senha da Família',
    familyPasswordPlaceholder: 'Senha do grupo familiar',
    password: 'Sua Senha Pessoal',
    button: 'Cadastrar',
    registering: 'Criando conta...',
    haveAccount: 'Já tem conta?',
    login: 'Faça login',
    alertFamily: 'Por favor, selecione uma família!',
    success: '✅ Usuário criado com sucesso!',
    serverError: '❌ Erro no servidor ou senha da família incorreta.',
    fetchError: 'Não foi possível carregar as famílias.',
  },
  en: {
    title: 'Create Account 📝',
    subtitle: 'Sign up to get started',
    name: 'Name',
    email: 'Email',
    family: 'Your Family',
    selectFamily: 'Select family...',
    familyPassword: 'Family Password',
    familyPasswordPlaceholder: 'Group access password',
    password: 'Your Personal Password',
    button: 'Register',
    registering: 'Creating account...',
    haveAccount: 'Already have an account?',
    login: 'Login here',
    alertFamily: 'Please select a family!',
    success: '✅ User created successfully!',
    serverError: '❌ Server error or incorrect family password.',
    fetchError: 'Could not load families.',
  },
  it: {
    title: 'Crea Account 📝',
    subtitle: 'Registrati per iniziare',
    name: 'Nome',
    email: 'E-mail',
    family: 'Tua Famiglia',
    selectFamily: 'Seleziona famiglia...',
    familyPassword: 'Password della Famiglia',
    familyPasswordPlaceholder: 'Password del gruppo',
    password: 'Tua Password Personale',
    button: 'Registrati',
    registering: 'Creazione account...',
    haveAccount: 'Hai già un account?',
    login: 'Accedi',
    alertFamily: 'Per favore, seleziona una famiglia!',
    success: '✅ Utente creato con successo!',
    serverError: '❌ Errore del server o password famiglia errata.',
    fetchError: 'Impossibile caricare le famiglie.',
  },
};

export default function Register() {
  const { language, mounted } = useAppContext();
  const t = translations[language] || translations.it;

  const [families, setFamilies] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    family_id: '',
    family_password: '',
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

    setIsSubmitting(true);
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
        alert('❌ Erro: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      alert(t.serverError);
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

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Nome */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 ml-2 uppercase tracking-[0.2em]">
              {t.name}
            </label>
            <div className="relative">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                required
                placeholder="Ex: Felipe"
                className="w-full p-4 pl-12 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
          </div>

          {/* E-mail */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 ml-2 uppercase tracking-[0.2em]">
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
                placeholder="seu@email.com"
                className="w-full p-4 pl-12 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          {/* Seleção de Família */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 ml-2 uppercase tracking-[0.2em]">
              {t.family}
            </label>
            <div className="relative">
              <Users
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <select
                required
                className="w-full p-4 pl-12 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-medium appearance-none transition-all"
                value={formData.family_id}
                onChange={(e) =>
                  setFormData({ ...formData, family_id: e.target.value })
                }
              >
                <option value="">{t.selectFamily}</option>
                {families.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SENHA DA FAMÍLIA - Aparece apenas se uma família for selecionada */}
          {formData.family_id && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black text-blue-500 dark:text-blue-400 ml-2 uppercase tracking-[0.2em]">
                {t.familyPassword}
              </label>
              <div className="relative">
                <ShieldCheck
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
                  size={18}
                />
                <input
                  type="password"
                  required
                  placeholder={t.familyPasswordPlaceholder}
                  className="w-full p-4 pl-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      family_password: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}

          {/* Senha Pessoal */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 ml-2 uppercase tracking-[0.2em]">
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
                className="w-full p-4 pl-12 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <button
            disabled={isSubmitting}
            className="w-full bg-blue-600 dark:bg-blue-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98] mt-4 text-lg flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loading /> {t.registering}
              </>
            ) : (
              t.button
            )}
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
