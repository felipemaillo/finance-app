'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Tag, Trash2, Edit2, Check, X } from 'lucide-react';
import { API_URL } from '../lib/api';
import { useAppContext } from '../context/AppContext';
import ThemeLanguageSelector from '../components/ThemeLanguageSelector';
import Loading from '../components/Loading';

const translations = {
  pt: {
    title: 'Gerenciar Categorias',
    createNew: 'Criar nova',
    placeholder: 'Ex: Mercado, Lazer...',
    yourCategories: 'Suas Categorias',
    empty: 'Nenhuma categoria encontrada.',
    confirmDelete: 'Deseja excluir esta categoria?',
    errorDelete: 'Não foi possível excluir. Talvez ela esteja em uso?',
    errorAdd: 'Erro ao adicionar',
    errorEdit: 'Erro ao editar',
    loading: 'Carregando categorias...',
    adding: 'Adicionando...',
    deleting: 'Excluindo...',
    saving: 'Salvando...',
  },
  en: {
    title: 'Manage Categories',
    createNew: 'Create new',
    placeholder: 'Ex: Groceries, Fun...',
    yourCategories: 'Your Categories',
    empty: 'No categories found.',
    confirmDelete: 'Do you want to delete this category?',
    errorDelete: 'Could not delete. Is it being used?',
    errorAdd: 'Error adding',
    errorEdit: 'Error editing',
    loading: 'Loading categories...',
    adding: 'Adding...',
    deleting: 'Deleting...',
    saving: 'Saving...',
  },
  it: {
    title: 'Gestisci Categorie',
    createNew: 'Crea nuova',
    placeholder: 'Es: Spesa, Svago...',
    yourCategories: 'Le tue Categorie',
    empty: 'Nessuna categoria trovata.',
    confirmDelete: 'Vuoi eliminare questa categoria?',
    errorDelete: 'Impossibile eliminare. Forse è in uso?',
    errorAdd: "Errore durante l'aggiunta",
    errorEdit: 'Errore durante la modifica',
    loading: 'Caricamento categorie...',
    adding: 'Aggiunta in corso...',
    deleting: 'Eliminazione...',
    saving: 'Salvataggio...',
  },
};

export default function CategoriesPage() {
  const router = useRouter();
  const { language, mounted } = useAppContext();
  const t = translations[language] || translations.it;

  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [actionId, setActionId] = useState(null);

  const refreshList = useCallback(
    async (showFullLoading = false) => {
      if (!mounted) return;
      if (showFullLoading) setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [mounted],
  );

  useEffect(() => {
    refreshList(true);
  }, [refreshList]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim() || isAdding) return;

    setIsAdding(true);
    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) throw new Error();
      setNewName('');
      await refreshList();
    } catch (e) {
      alert(t.errorAdd);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm(t.confirmDelete)) {
      setActionId(id);
      try {
        const res = await fetch(`${API_URL}/categories/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error();
        await refreshList();
      } catch (e) {
        alert(t.errorDelete);
      } finally {
        setActionId(null);
      }
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const saveEdit = async (id) => {
    setActionId(id);
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      });
      if (!res.ok) throw new Error();
      setEditingId(null);
      await refreshList();
    } catch (e) {
      alert(t.errorEdit);
    } finally {
      setActionId(null);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-10 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 p-6 shadow-sm flex items-center justify-between sticky top-0 z-10 transition-colors">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="dark:text-slate-100" />
          </button>
          <h1 className="text-xl font-bold dark:text-white">{t.title}</h1>
        </div>
        <ThemeLanguageSelector />
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-6">
        {/* Card Adicionar */}
        <section className="bg-white dark:bg-slate-900 p-5 rounded-[28px] shadow-sm border border-gray-100 dark:border-slate-800">
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-widest ml-1">
            {t.createNew}
          </p>
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              disabled={isAdding}
              className="flex-1 bg-gray-50 dark:bg-slate-800 p-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white disabled:opacity-50"
              placeholder={isAdding ? t.adding : t.placeholder}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button
              type="submit"
              disabled={isAdding || !newName.trim()}
              className="bg-blue-600 dark:bg-blue-500 text-white p-3 rounded-2xl shadow-md hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
            >
              {isAdding ? (
                <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Plus size={24} />
              )}
            </button>
          </form>
        </section>

        {/* Lista */}
        <section className="space-y-3">
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest ml-1">
            {t.yourCategories}
          </p>

          {isLoading ? (
            <div className="flex flex-col items-center py-20 bg-white dark:bg-slate-900 rounded-[28px] shadow-sm border border-gray-100 dark:border-slate-800">
              <Loading />
              <p className="text-sm text-gray-400 mt-4">{t.loading}</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-white dark:bg-slate-900 rounded-[28px] border border-dashed dark:border-slate-700">
              {t.empty}
            </div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className={`bg-white dark:bg-slate-900 p-4 rounded-2xl flex justify-between items-center shadow-sm border transition-all ${actionId === cat.id ? 'opacity-60 border-blue-200 dark:border-blue-900' : 'border-gray-100 dark:border-slate-800'}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Tag size={18} />
                  </div>
                  {editingId === cat.id ? (
                    <input
                      autoFocus
                      disabled={actionId === cat.id}
                      className="flex-1 bg-gray-50 dark:bg-slate-800 p-2 rounded-lg outline-none border-b-2 border-blue-500 font-bold text-blue-600 dark:text-blue-400"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  ) : (
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {cat.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 ml-4">
                  {actionId === cat.id ? (
                    <div className="p-2">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                    </div>
                  ) : editingId === cat.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(cat.id)}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                      >
                        <Check size={20} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg"
                      >
                        <X size={20} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-2 text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-gray-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
