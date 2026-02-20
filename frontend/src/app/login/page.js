'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Lock,
  User,
  Users,
  ShieldLock,
  UserPlus,
  ArrowLeft,
} from 'lucide-react';
import { API_URL } from '../lib/api';
import { useAppContext } from '../context/AppContext';
import ThemeLanguageSelector from '../components/ThemeLanguageSelector';
import Loading from '../components/Loading';

const translations = {
  pt: {
    title: 'Criar Conta 🚀',
    subtitle: 'Junte-se a uma família e organize-se',
    name: 'Seu Nome',
    email: 'E-mail',
    password: 'Sua Senha Pessoal',
    family: 'Sua Família',
    familyPassword: 'Senha da Família',
    selectFamily: 'Selecione uma família',
    button: 'Cadastrar',
    creating: 'Criando conta...',
    haveAccount: 'Já tem uma conta?',
    login: 'Faça login',
    success: '✅ Conta criada! Redirecionando...',
    error: '❌ Erro ao criar conta. Verifique os dados.',
    errorFamilyPass: '❌ Senha da família incorreta!',
  },
  en: {
    title: 'Create Account 🚀',
    subtitle: 'Join a family and get organized',
    name: 'Your Name',
    email: 'Email',
    password: 'Your Personal Password',
    family: 'Your Family',
    familyPassword: 'Family Password',
    selectFamily: 'Select a family',
    button: 'Sign Up',
    creating: 'Creating account...',
    haveAccount: 'Already have an account?',
    login: 'Login here',
    success: '✅ Account created! Redirecting...',
    error: '❌ Error creating account. Check your data.',
    errorFamilyPass: '❌ Incorrect family password!',
  },
  it: {
    title: 'Crea Account 🚀',
    subtitle: 'Unisciti a una famiglia e organizzati',
    name: 'Tuo Nome',
    email: 'E-mail',
    password: 'Tua Password Personale',
    family: 'Tua Famiglia',
    familyPassword: 'Password della Famiglia',
    selectFamily: 'Seleziona una famiglia',
    button: 'Registrati',
    creating: 'Creazione in corso...',
    haveAccount: 'Hai già un account?',
    login: 'Accedi qui',
    success: '✅ Account creato! Reindirizzamento...',
    error: '❌ Errore durante la creazione.',
    errorFamilyPass: '❌ Password della famiglia errata!',
  },
};

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    family_id: '',
    family_password: '',
  });
  const [families, setFamilies] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { language, mounted } = useAppContext();
  const t = translations[language] || translations.it;

  useEffect(() => {
    if (mounted) {
      fetch(`${API_URL}/families`)
        .then((res) => res.json())
        .then((data) => setFamilies(data))
        .catch((err) => console.error('Erro ao carregar famílias', err));
    }
  }, [mounted]);

  const handleRegister = async (e) => {
    e.preventDefault();
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
        alert(
          data.error === 'Senha da família incorreta.'
            ? t.errorFamilyPass
            : t.error,
        );
      }
    } catch (error) {
      alert(t.error);
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
        <Link
          href="/login"
          className="flex items-center gap-2 text-gray-400 hover:text-blue-600 mb-6 text-sm font-bold transition-colors"
        >
          <ArrowLeft size={16} /> Voltar
        </Link>

        <h1 className="text-3xl font-black text-center mb-2 text-blue-600 dark:text-blue-400 tracking-tight">
          {t.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm font-medium">
          {t.subtitle}
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Nome */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 ml-2 uppercase tracking-widest">
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
                className="w-full p-4 pl-12 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
          </div>

          {/* E-mail */}
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
                className="w-full p-4 pl-12 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          {/* Senha Pessoal */}
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
                className="w-full p-4 pl-12 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <hr className="my-2 border-gray-100 dark:border-slate-800" />

          {/* Seleção de Família */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-blue-400 ml-2 uppercase tracking-widest">
              {t.family}
            </label>
            <div className="relative">
              <Users
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <select
                required
                className="w-full p-4 pl-12 bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none cursor-pointer"
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

          {/* Senha da Família */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-blue-400 ml-2 uppercase tracking-widest">
              {t.familyPassword}
            </label>
            <div className="relative">
              <ShieldLock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="password"
                required
                placeholder="****"
                className="w-full p-4 pl-12 bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                onChange={(e) =>
                  setFormData({ ...formData, family_password: e.target.value })
                }
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
                <UserPlus size={20} /> {t.button}
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-600 dark:text-slate-400 text-sm">
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
