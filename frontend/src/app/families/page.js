'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Users, Lock, ArrowLeft, Save } from 'lucide-react';
import { API_URL } from '../lib/api';
import { useAppContext } from '../context/AppContext';
import Loading from '../components/Loading';

const translations = {
  pt: {
    title: 'Nova Família 🏠',
    subtitle: 'Crie um grupo seguro para suas finanças',
    familyName: 'Nome da Família',
    familyPassword: 'Senha da Família',
    placeholderName: 'Ex: Família Silva',
    placeholderPass: 'Defina uma senha de acesso',
    button: 'Criar Família',
    success: '✅ Família criada com sucesso!',
    error: '❌ Erro ao criar família.',
    back: 'Voltar',
    adminOnly: 'Acesso Restrito ao Administrador',
  },
  en: {
    title: 'New Family 🏠',
    subtitle: 'Create a secure group for your finances',
    familyName: 'Family Name',
    familyPassword: 'Family Password',
    placeholderName: 'e.g., Smith Family',
    placeholderPass: 'Set an access password',
    button: 'Create Family',
    success: '✅ Family created successfully!',
    error: '❌ Error creating family.',
    back: 'Back',
    adminOnly: 'Administrator Access Only',
  },
  it: {
    title: 'Nuova Famiglia 🏠',
    subtitle: 'Crea un gruppo sicuro per le tue finanze',
    familyName: 'Nome della Famiglia',
    familyPassword: 'Password della Famiglia',
    placeholderName: 'Es: Famiglia Silva',
    placeholderPass: 'Imposta una password di accesso',
    button: 'Crea Famiglia',
    success: '✅ Famiglia creata con successo!',
    error: '❌ Errore durante la creazione.',
    back: 'Indietro',
    adminOnly: "Accesso Riservato all'Amministratore",
  },
};

export default function CreateFamily() {
  const { language, mounted } = useAppContext();
  const t = translations[language] || translations.it;
  const router = useRouter();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    if (mounted) {
      const isSuper = localStorage.getItem('isSuperUser') === 'true';
      if (!isSuper) {
        router.push('/'); // Redireciona se não for super usuário
      } else {
        setIsAllowed(true);
      }
    }
  }, [mounted, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_URL}/families`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, password_hash: password }),
      });

      if (res.ok) {
        alert(t.success);
        router.push('/');
      } else {
        const errorData = await res.json();
        alert(`${t.error} ${errorData.error || ''}`);
      }
    } catch (err) {
      alert(t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || !isAllowed) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 flex items-center justify-center transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-2xl border border-gray-100 dark:border-slate-800">
        {/* Botão de Voltar */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6 font-bold text-sm"
        >
          <ArrowLeft size={18} /> {t.back}
        </button>

        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="text-blue-600 dark:text-blue-400" size={28} />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.title}
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 font-medium">
          {t.subtitle}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome da Família */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">
              {t.familyName}
            </label>
            <div className="relative">
              <Users
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                required
                placeholder={t.placeholderName}
                className="w-full p-4 pl-12 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all font-medium"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Senha da Família */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">
              {t.familyPassword}
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="password"
                required
                placeholder={t.placeholderPass}
                className="w-full p-4 pl-12 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all font-medium"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Botão Salvar */}
          <button
            disabled={isSubmitting}
            className="w-full bg-blue-600 dark:bg-blue-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 dark:hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-70 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <Loading />
            ) : (
              <>
                <Save size={20} />
                {t.button}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
