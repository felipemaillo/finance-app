'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Save,
  X,
  Key,
  ShieldCheck,
} from 'lucide-react';
import { API_URL } from '../lib/api';
import Loading from '../components/Loading';
import { useAppContext } from '../context/AppContext';

export default function FamiliesPage() {
  const router = useRouter();
  const { language, mounted } = useAppContext();

  const [families, setFamilies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const t = {
    pt: {
      title: 'Gestão de Famílias',
      name: 'Nome da Família',
      pass: 'Nova Senha (opcional)',
      save: 'Salvar',
      add: 'Nova Família',
      edit: 'Editar Família',
    },
    it: {
      title: 'Gestione Famiglie',
      name: 'Nome della Famiglia',
      pass: 'Nuova Password (opzionale)',
      save: 'Salva',
      add: 'Nuova Famiglia',
      edit: 'Modifica Famiglia',
    },
  }[language] || {
    title: 'Family Management',
    name: 'Family Name',
    pass: 'New Password',
    save: 'Save',
    add: 'New Family',
    edit: 'Edit Family',
  };

  const loadFamilies = async () => {
    const token = localStorage.getItem('userToken');
    try {
      const res = await fetch(`${API_URL}/families`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFamilies(data);
      }
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) loadFamilies();
  }, [mounted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('userToken');

    const url = editingFamily
      ? `${API_URL}/families/${editingFamily.id}`
      : `${API_URL}/families`;

    const method = editingFamily ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, password: password || undefined }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingFamily(null);
        setName('');
        setPassword('');
        loadFamilies();
      }
    } catch (error) {
      alert('Errore durante o salvamento');
    }
  };

  const openEdit = (family) => {
    setEditingFamily(family);
    setName(family.name);
    setPassword(''); // Senha sempre limpa por segurança
    setIsModalOpen(true);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 transition-colors">
      <div className="max-w-lg mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-800"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black flex items-center gap-2">
            <ShieldCheck className="text-blue-600" /> {t.title}
          </h1>
          <button
            onClick={() => {
              setEditingFamily(null);
              setName('');
              setPassword('');
              setIsModalOpen(true);
            }}
            className="p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
          >
            <Plus size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loading />
          </div>
        ) : (
          <div className="space-y-3">
            {families.map((family) => (
              <div
                key={family.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-[24px] border border-gray-100 dark:border-slate-800 flex justify-between items-center shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="font-black text-sm">{family.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                      ID: {family.id.slice(0, 8)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => openEdit(family)}
                  className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                >
                  <Pencil size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* MODAL DE EDIÇÃO/CRIAÇÃO */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black">
                    {editingFamily ? t.edit : t.add}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                      {t.name}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-600 transition-all font-bold"
                      placeholder="Ex: Família Silva"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                      {t.pass}
                    </label>
                    <div className="relative">
                      <Key
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 pl-12 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-600 transition-all font-bold"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    <Save size={20} /> {t.save}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
