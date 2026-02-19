'use client';
import { useState, useEffect } from 'react';
import { X, Trash2, CheckCircle2, Circle, Repeat, Hash } from 'lucide-react';
import { API_URL } from '../lib/api';
import { useAppContext } from '../context/AppContext';

const translations = {
  pt: {
    editTitle: 'Editar Lançamento',
    newTitle: 'Novo Lançamento',
    expense: 'Gasto',
    income: 'Ganho',
    currency: 'Moeda',
    category: 'Categoria',
    none: 'Nenhuma',
    description: 'Descrição',
    amount: 'Valor',
    date: 'Data',
    save: 'Salvar Lançamento',
    update: 'Atualizar Lançamento',
    delete: 'Excluir Lançamento',
    confirmDelete: 'Deseja realmente excluir este lançamento?',
    isPaidExpense: 'Gasto já pago',
    isPaidIncome: 'Ganho já recebido',
    errorSave: '❌ Falha ao salvar',
    errorDelete: 'Erro ao excluir lançamento.',
    errorConn: '❌ Erro ao conectar ao servidor.',
    recurring: 'Fixo',
    installments: 'Parcelas',
  },
  en: {
    editTitle: 'Edit Transaction',
    newTitle: 'New Transaction',
    expense: 'Expense',
    income: 'Income',
    currency: 'Currency',
    category: 'Category',
    none: 'None',
    description: 'Description',
    amount: 'Amount',
    date: 'Date',
    save: 'Save Transaction',
    update: 'Update Transaction',
    delete: 'Delete Transaction',
    confirmDelete: 'Are you sure you want to delete this transaction?',
    isPaidExpense: 'Already paid',
    isPaidIncome: 'Already received',
    errorSave: '❌ Save failed',
    errorDelete: 'Error deleting transaction.',
    errorConn: '❌ Error connecting to server.',
    recurring: 'Fixed',
    installments: 'Installments',
  },
  it: {
    editTitle: 'Modifica Transazione',
    newTitle: 'Nuova Transazione',
    expense: 'Uscita',
    income: 'Entrata',
    currency: 'Valuta',
    category: 'Categoria',
    none: 'Nessuna',
    description: 'Descrizione',
    amount: 'Importo',
    date: 'Data',
    save: 'Salva Transazione',
    update: 'Aggiorna Transazione',
    delete: 'Elimina Transazione',
    confirmDelete: 'Vuoi davvero eliminare questa transazione?',
    isPaidExpense: 'Già pagato',
    isPaidIncome: 'Già ricevuto',
    errorSave: '❌ Salvataggio fallito',
    errorDelete: "Errore durante l'eliminazione.",
    errorConn: '❌ Errore di connessione al server.',
    recurring: 'Fisso',
    installments: 'Rate',
  },
};

export default function TransactionForm({ onClose, initialData }) {
  const { language, mounted } = useAppContext();
  const t = translations[language];

  const [currencies, setCurrencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [numInstallments, setNumInstallments] = useState(1);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'EXPENSE',
    currency_id: '',
    category_id: '',
    is_paid: false,
  });

  useEffect(() => {
    if (!mounted) return;
    const loadOptions = async () => {
      try {
        const [resCur, resCat] = await Promise.all([
          fetch(`${API_URL}/currencies`),
          fetch(`${API_URL}/categories`),
        ]);
        const currenciesData = await resCur.json();
        const categoriesData = await resCat.json();
        setCurrencies(currenciesData);
        setCategories(categoriesData);

        if (initialData) {
          setFormData({
            description: initialData.description,
            amount: initialData.amount,
            date: new Date(initialData.date).toISOString().split('T')[0],
            type: initialData.type,
            currency_id: initialData.currency_id,
            category_id: initialData.category_id || '',
            is_paid: initialData.is_paid || false,
          });
        } else if (currenciesData.length > 0) {
          setFormData((prev) => ({
            ...prev,
            currency_id: currenciesData[0].id,
          }));
        }
      } catch (err) {
        console.error('Erro ao carregar opções:', err);
      }
    };
    loadOptions();
  }, [initialData, mounted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const family_id = localStorage.getItem('familyId');
    const user_id = localStorage.getItem('userId');

    let iterations = 1;
    if (!initialData) {
      if (isRecurring) iterations = 12;
      else if (numInstallments > 1) iterations = numInstallments;
    }

    try {
      for (let i = 0; i < iterations; i++) {
        const adjustedDate = new Date(formData.date + 'T12:00:00');
        adjustedDate.setMonth(adjustedDate.getMonth() + i);

        const finalDescription =
          numInstallments > 1 && !isRecurring
            ? `${formData.description} (${i + 1}/${numInstallments})`
            : formData.description;

        const payload = {
          description: finalDescription,
          amount: parseFloat(formData.amount),
          date: adjustedDate.toISOString(),
          type: formData.type,
          currency_id: String(formData.currency_id),
          category_id: formData.category_id
            ? String(formData.category_id)
            : null,
          is_paid: i === 0 ? formData.is_paid : false,
          family_id,
          user_id,
        };

        const method = initialData ? 'PUT' : 'POST';
        const url = initialData?.id
          ? `${API_URL}/transactions/${initialData.id}`
          : `${API_URL}/transactions`;

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error();
        if (initialData) break;
      }
      onClose();
    } catch (error) {
      alert(t.errorSave);
    }
  };

  const handleDelete = async () => {
    if (confirm(t.confirmDelete)) {
      try {
        const response = await fetch(
          `${API_URL}/transactions/${initialData.id}`,
          { method: 'DELETE' },
        );
        if (response.ok) onClose();
        else alert(t.errorDelete);
      } catch (error) {
        alert(t.errorConn);
      }
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4 overflow-y-auto transition-all">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[32px] md:rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 border border-gray-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-white">
            {initialData ? t.editTitle : t.newTitle}
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seletor Tipo */}
          <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
              className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${formData.type === 'EXPENSE' ? 'bg-white dark:bg-slate-600 shadow-sm text-red-600 dark:text-red-400' : 'text-gray-500'}`}
            >
              {t.expense}
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'INCOME' })}
              className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${formData.type === 'INCOME' ? 'bg-white dark:bg-slate-600 shadow-sm text-green-600 dark:text-green-400' : 'text-gray-500'}`}
            >
              {t.income}
            </button>
          </div>

          {/* CONTROLES DE RECORRÊNCIA E PARCELAMENTO (Exclusivo na Criação) */}
          {!initialData && (
            <div className="flex gap-4 items-end">
              {/* Opção Fixo */}
              <div className="flex-1">
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1 ml-1 tracking-widest">
                  {t.recurring}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsRecurring(!isRecurring);
                    setNumInstallments(1);
                  }}
                  className={`w-full flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all font-bold text-xs h-[46px] ${
                    isRecurring
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                      : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500'
                  }`}
                >
                  <Repeat size={16} />
                  {isRecurring ? 'Ativado' : 'Não'}
                </button>
              </div>

              {/* Opção Parcelas */}
              <div className="flex-1">
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1 ml-1 tracking-widest">
                  {t.installments}
                </label>
                <div
                  className={`flex items-center gap-2 p-1.5 rounded-2xl border transition-all h-[46px] ${
                    numInstallments > 1 && !isRecurring
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="number"
                    min="1"
                    max="72"
                    disabled={isRecurring}
                    value={numInstallments}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setNumInstallments(val);
                      if (val > 1) setIsRecurring(false);
                    }}
                    className={`w-full bg-transparent px-2 outline-none font-bold text-sm text-center ${
                      numInstallments > 1 && !isRecurring
                        ? 'text-white'
                        : 'dark:text-white text-gray-700'
                    } ${isRecurring ? 'opacity-30' : 'opacity-100'}`}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1 ml-1 tracking-widest">
                {t.currency}
              </label>
              <select
                required
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-colors"
                value={formData.currency_id}
                onChange={(e) =>
                  setFormData({ ...formData, currency_id: e.target.value })
                }
              >
                {currencies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.symbol} - {c.code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1 ml-1 tracking-widest">
                {t.category}
              </label>
              <select
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-colors"
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
              >
                <option value="">{t.none}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STATUS DE PAGAMENTO */}
          <div
            onClick={() =>
              setFormData({ ...formData, is_paid: !formData.is_paid })
            }
            className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${formData.is_paid ? 'bg-green-500/10 border-green-500/20' : 'bg-gray-50 border-gray-200 dark:bg-slate-800 dark:border-slate-700'}`}
          >
            <div className="flex items-center gap-3">
              {formData.is_paid ? (
                <CheckCircle2
                  className="text-green-600 dark:text-green-400"
                  size={24}
                />
              ) : (
                <Circle className="text-gray-400" size={24} />
              )}
              <span
                className={`text-sm font-bold ${formData.is_paid ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`}
              >
                {formData.type === 'EXPENSE' ? t.isPaidExpense : t.isPaidIncome}
              </span>
            </div>
            <div
              className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.is_paid ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'}`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full transition-transform ${formData.is_paid ? 'translate-x-4' : 'translate-x-0'}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1 ml-1 tracking-widest">
              {t.description}
            </label>
            <input
              type="text"
              required
              className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-colors"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1 ml-1 tracking-widest">
                {t.amount}
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-colors"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1 ml-1 tracking-widest">
                {t.date}
              </label>
              <input
                type="date"
                required
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-colors"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 dark:bg-blue-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-all active:scale-95"
            >
              {initialData ? t.update : t.save}
            </button>
            {initialData && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full flex items-center justify-center gap-2 text-red-500 font-bold py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              >
                <Trash2 size={18} /> {t.delete}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
