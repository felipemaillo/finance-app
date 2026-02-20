'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  LogOut,
  Calendar,
  Tag,
  Sun,
  Moon,
  Filter,
  CheckCircle2,
  Clock,
  Repeat,
  ShieldCheck, // Aggiunto per la gestione Famiglie
} from 'lucide-react';
import TransactionForm from './components/TransactionForm';
import Loading from './components/Loading';
import { API_URL } from './lib/api';
import { useAppContext } from './context/AppContext';

const translations = {
  pt: {
    welcome: 'Bem-vindo,',
    balanceIn: 'Saldo em',
    income: 'Ganhos',
    expense: 'Pagos',
    pending: 'Pendente',
    pendingSummary: 'A Pagar',
    projectedBalance: 'Saldo Projetado',
    paid: 'Pago',
    noTransactions: 'Nenhum lançamento encontrado.',
    listTitle: 'Lançamentos de',
    all: 'Todas',
    filterCategory: 'Filtrar Categoria',
    filterNature: 'Tipo de Lançamento',
    natureAll: 'Todos',
    natureFixed: 'Fixos',
    natureInstallments: 'Parcelados',
    userDefault: 'Usuário',
    dateLabel: 'Data:',
    yearLabel: 'Ano',
    loading: 'Carregando dados...',
    admin: 'Gerenciar Famílias',
    months: [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ],
  },
  en: {
    welcome: 'Welcome,',
    balanceIn: 'Balance in',
    income: 'Income',
    expense: 'Paid',
    pending: 'Pending',
    pendingSummary: 'To Pay',
    projectedBalance: 'Projected Balance',
    paid: 'Paid',
    noTransactions: 'No transactions found.',
    listTitle: 'Transactions of',
    all: 'All',
    filterCategory: 'Filter Category',
    filterNature: 'Transaction Type',
    natureAll: 'All',
    natureFixed: 'Fixed',
    natureInstallments: 'Installments',
    userDefault: 'User',
    dateLabel: 'Date:',
    yearLabel: 'Year',
    loading: 'Loading data...',
    admin: 'Manage Families',
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
  },
  it: {
    welcome: 'Benvenuto,',
    balanceIn: 'Saldo in',
    income: 'Entrate',
    expense: 'Pagati',
    pending: 'In attesa',
    pendingSummary: 'Da Pagare',
    projectedBalance: 'Saldo Previsto',
    paid: 'Pagato',
    noTransactions: 'Nessuna transazione trovata.',
    listTitle: 'Transazioni di',
    all: 'Tutte',
    filterCategory: 'Filtra Categoria',
    filterNature: 'Tipo di Transazione',
    natureAll: 'Tutte',
    natureFixed: 'Fissi',
    natureInstallments: 'Rateali',
    userDefault: 'Utente',
    dateLabel: 'Data:',
    yearLabel: 'Anno',
    loading: 'Caricamento dati...',
    admin: 'Gestisci Famiglie',
    months: [
      'Gennaio',
      'Febbraio',
      'Marzo',
      'Aprile',
      'Maggio',
      'Giugno',
      'Luglio',
      'Agosto',
      'Settembre',
      'Ottobre',
      'Novembre',
      'Dicembre',
    ],
  },
};

export default function Home() {
  const router = useRouter();
  const { language, setLanguage, theme, setTheme, mounted } = useAppContext();
  const t = translations[language] || translations.it;

  const monthScrollRef = useRef(null);
  const categoryScrollRef = useRef(null);
  const yearScrollRef = useRef(null);

  const [userName, setUserName] = useState('Utente');
  const [isSuperUser, setIsSuperUser] = useState(false); // Stato per il permesso admin
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedNature, setSelectedNature] = useState('all');
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  const availableYears = useMemo(() => {
    const startYear = 2024;
    const endYear = now.getFullYear() + 1;
    const years = [];
    for (let y = startYear; y <= endYear; y++) years.push(y);
    return years;
  }, [now]);

  // Logica Drag Scroll (invariata)
  const setupDragScroll = (ref) => {
    const element = ref.current;
    if (!element) return;
    let isDown = false;
    let startX;
    let scrollLeft;
    const onMouseDown = (e) => {
      isDown = true;
      element.classList.add('cursor-grabbing');
      startX = e.pageX - element.offsetLeft;
      scrollLeft = element.scrollLeft;
    };
    const onMouseLeave = () => {
      isDown = false;
      element.classList.remove('cursor-grabbing');
    };
    const onMouseUp = () => {
      isDown = false;
      element.classList.remove('cursor-grabbing');
    };
    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - element.offsetLeft;
      const walk = (x - startX) * 2;
      element.scrollLeft = scrollLeft - walk;
    };
    element.addEventListener('mousedown', onMouseDown);
    element.addEventListener('mouseleave', onMouseLeave);
    element.addEventListener('mouseup', onMouseUp);
    element.addEventListener('mousemove', onMouseMove);
    return () => {
      element.removeEventListener('mousedown', onMouseDown);
      element.removeEventListener('mouseleave', onMouseLeave);
      element.removeEventListener('mouseup', onMouseUp);
      element.removeEventListener('mousemove', onMouseMove);
    };
  };

  useEffect(() => {
    if (mounted) {
      setupDragScroll(monthScrollRef);
      setupDragScroll(categoryScrollRef);
      setupDragScroll(yearScrollRef);

      // Carica info utente e permessi
      setUserName(localStorage.getItem('userName') || t.userDefault);
      setIsSuperUser(localStorage.getItem('isSuperUser') === 'true');

      fetch(`${API_URL}/categories`)
        .then((res) => res.json())
        .then(setCategories)
        .catch(console.error);
    }
  }, [mounted, t.userDefault]);

  const loadTransactions = async () => {
    const token = localStorage.getItem('userToken');
    const familyId = localStorage.getItem('familyId');
    if (!token || !familyId) {
      router.push('/login');
      return;
    }

    setIsLoadingTransactions(true);
    try {
      const res = await fetch(
        `${API_URL}/transactions/${familyId}?month=${currentMonth}&year=${currentYear}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Errore caricamento:', error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (mounted) loadTransactions();
  }, [currentMonth, currentYear, mounted]);

  // Logica filtri (invariata)
  const filteredTransactions = useMemo(() => {
    let list = [...transactions];
    if (selectedCategory !== 'all') {
      list = list.filter((trans) => trans.category_id === selectedCategory);
    }
    if (selectedNature !== 'all') {
      list = list.filter((trans) => {
        const isInstallment = trans.description.match(/\((\d+\/\d+)\)$/);
        if (selectedNature === 'installments') return !!isInstallment;
        if (selectedNature === 'fixed') return !isInstallment;
        return true;
      });
    }
    return list.sort((a, b) => {
      const currA = a.currency?.code || '';
      const currB = b.currency?.code || '';
      if (currA !== currB) return currA.localeCompare(currB);
      if (a.type !== b.type) return a.type === 'INCOME' ? -1 : 1;
      return new Date(b.date) - new Date(a.date);
    });
  }, [transactions, selectedCategory, selectedNature]);

  const totalsByCurrency = useMemo(() => {
    return filteredTransactions.reduce((acc, trans) => {
      const code = trans.currency?.code || '???';
      if (!acc[code])
        acc[code] = {
          symbol: trans.currency?.symbol || '$',
          income: 0,
          expense: 0,
          pending: 0,
          balance: 0,
          projected: 0,
        };
      const val = Number(trans.amount);
      if (trans.type === 'INCOME') {
        acc[code].income += val;
      } else {
        if (trans.is_paid) acc[code].expense += val;
        else acc[code].pending += val;
      }
      acc[code].balance = acc[code].income - acc[code].expense;
      acc[code].projected =
        acc[code].income - acc[code].expense - acc[code].pending;
      return acc;
    }, {});
  }, [filteredTransactions]);

  if (!mounted)
    return <div className="min-h-screen bg-gray-50 dark:bg-slate-950" />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors">
        <div className="w-full sm:w-auto">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {t.welcome}
          </p>
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {userName}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-yellow-400"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-full">
            {['pt', 'en', 'it'].map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${language === l ? 'bg-white dark:bg-slate-600 shadow-md scale-110' : 'opacity-40'}`}
              >
                {l === 'pt' ? '🇧🇷' : l === 'en' ? '🇺🇸' : '🇮🇹'}
              </button>
            ))}
          </div>

          <div className="flex gap-2 border-l pl-4 dark:border-slate-800">
            {/* PULSANTE ADMIN - Visibile solo per Super User */}
            {isSuperUser && (
              <button
                onClick={() => router.push('/families')}
                className="p-2 text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform"
                title={t.admin}
              >
                <ShieldCheck size={24} />
              </button>
            )}

            <button
              onClick={() => router.push('/categories')}
              className="p-2 text-gray-400 hover:text-blue-600"
            >
              <Tag size={22} />
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                router.push('/login');
              }}
              className="p-2 text-gray-400 hover:text-red-500"
            >
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Resto del codice rimane uguale per filtri, dashboard e lista... */}
      <div className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-30 shadow-sm transition-colors">
        <div className="max-w-lg mx-auto p-4 space-y-3">
          <div
            ref={yearScrollRef}
            className="flex gap-2 overflow-x-auto no-scrollbar py-1"
          >
            {availableYears.map((y) => (
              <button
                key={y}
                onClick={() => setCurrentYear(y)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all border ${currentYear === y ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-gray-100 dark:bg-slate-800 border-transparent text-gray-500'}`}
              >
                {y}
              </button>
            ))}
          </div>
          <div className="flex items-center">
            <Calendar
              size={18}
              className="text-blue-600 dark:text-blue-400 shrink-0 mr-3 mb-1"
            />
            <div
              ref={monthScrollRef}
              className="flex gap-2 overflow-x-auto no-scrollbar pb-1 scroll-smooth cursor-grab select-none"
            >
              {t.months.map((m, i) => (
                <button
                  key={m}
                  onClick={() => setCurrentMonth(i + 1)}
                  className={`px-5 py-2 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${currentMonth === i + 1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-gray-200'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="p-4 max-w-lg mx-auto space-y-6 mt-2">
        {isLoadingTransactions ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loading />
            <p className="mt-4 text-sm text-gray-400 animate-pulse">
              {t.loading}
            </p>
          </div>
        ) : (
          <>
            {/* Categorie e Natura filtri */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 px-2 text-gray-400 uppercase tracking-widest text-[10px] font-black">
                <Filter size={14} /> <span>{t.filterCategory}</span>
              </div>
              <div
                ref={categoryScrollRef}
                className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1 cursor-grab select-none"
              >
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full text-xs font-bold border whitespace-nowrap ${selectedCategory === 'all' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500'}`}
                >
                  {t.all}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold border whitespace-nowrap ${selectedCategory === cat.id ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 px-2 text-gray-400 uppercase tracking-widest text-[10px] font-black">
                <Filter size={14} /> <span>{t.filterNature}</span>
              </div>
              <div className="flex gap-2 px-1">
                {[
                  { id: 'all', label: t.natureAll },
                  { id: 'fixed', label: t.natureFixed },
                  { id: 'installments', label: t.natureInstallments },
                ].map((nature) => (
                  <button
                    key={nature.id}
                    onClick={() => setSelectedNature(nature.id)}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black border ${selectedNature === nature.id ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-md' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500'}`}
                  >
                    {nature.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Totali e Lista */}
            <div className="space-y-4">
              {Object.entries(totalsByCurrency).length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-dashed dark:border-slate-800 flex flex-col items-center text-center text-gray-400">
                  <Wallet size={32} />
                  <p className="font-medium text-sm">{t.noTransactions}</p>
                </div>
              ) : (
                Object.entries(totalsByCurrency).map(([code, data]) => (
                  <div
                    key={code}
                    className="bg-blue-600 dark:bg-blue-700 p-6 rounded-4xl text-white shadow-xl transition-all"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2 opacity-80 text-sm font-medium">
                        <Wallet size={18} /> {t.balanceIn} {code}
                      </div>
                    </div>
                    <h2
                      className={`text-4xl font-black mb-1 ${data.balance < 0 ? 'text-red-400' : 'text-white'}`}
                    >
                      {data.symbol}{' '}
                      {data.balance.toLocaleString(
                        language === 'en' ? 'en-US' : 'pt-BR',
                        { minimumFractionDigits: 2 },
                      )}
                    </h2>
                    <div
                      className={`flex items-center gap-2 mb-6 border-t border-white/10 pt-1 w-fit ${data.projected < 0 ? 'animate-pulse' : ''}`}
                    >
                      <p className="text-[9px] uppercase font-bold tracking-wider">
                        {t.projectedBalance}:
                      </p>
                      <p
                        className={`font-black text-sm ${data.projected < 0 ? 'text-red-400' : 'text-white'}`}
                      >
                        {data.symbol}{' '}
                        {data.projected.toLocaleString(
                          language === 'en' ? 'en-US' : 'pt-BR',
                          { minimumFractionDigits: 2 },
                        )}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 text-center">
                      <div>
                        <p className="text-[9px] uppercase font-bold opacity-70 mb-1">
                          {t.income}
                        </p>
                        <p className="font-black text-sm text-green-400">
                          {data.symbol}{' '}
                          {data.income.toLocaleString(
                            language === 'en' ? 'en-US' : 'pt-BR',
                            { minimumFractionDigits: 2 },
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold opacity-70 mb-1">
                          {t.expense}
                        </p>
                        <p className="font-black text-sm text-red-400">
                          {data.symbol}{' '}
                          {data.expense.toLocaleString(
                            language === 'en' ? 'en-US' : 'pt-BR',
                            { minimumFractionDigits: 2 },
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold opacity-70 mb-1">
                          {t.pendingSummary}
                        </p>
                        <p className="font-black text-sm text-amber-400">
                          {data.symbol}{' '}
                          {data.pending.toLocaleString(
                            language === 'en' ? 'en-US' : 'pt-BR',
                            { minimumFractionDigits: 2 },
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg px-2">
                {t.listTitle} {t.months[currentMonth - 1]} {currentYear}
              </h3>
              {filteredTransactions.map((trans) => (
                <div
                  key={trans.id}
                  onClick={() => {
                    setEditingTransaction(trans);
                    setIsModalOpen(true);
                  }}
                  className={`bg-white dark:bg-slate-900 p-4 rounded-2xl flex justify-between items-center shadow-sm border border-gray-100 dark:border-slate-800 active:scale-[0.98] cursor-pointer ${trans.is_paid ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl ${trans.type === 'INCOME' ? 'bg-green-50 dark:bg-green-900/30 text-green-600' : 'bg-red-50 dark:bg-red-900/30 text-red-600'}`}
                    >
                      {trans.type === 'INCOME' ? (
                        <TrendingUp size={20} />
                      ) : (
                        <TrendingDown size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm truncate max-w-37.5">
                        {trans.description}
                      </p>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase border ${trans.is_paid ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}
                      >
                        {trans.is_paid ? t.paid : t.pending}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${trans.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {trans.type === 'INCOME' ? '+' : '-'}{' '}
                      {trans.currency?.symbol}{' '}
                      {Number(trans.amount).toLocaleString(
                        language === 'en' ? 'en-US' : 'pt-BR',
                        { minimumFractionDigits: 2 },
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <button
        onClick={() => {
          setEditingTransaction(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-8 right-6 bg-blue-600 dark:bg-blue-500 text-white p-5 rounded-2xl shadow-2xl z-40 active:scale-95 transition-all"
      >
        <Plus size={28} />
      </button>

      {isModalOpen && (
        <TransactionForm
          initialData={editingTransaction}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTransaction(null);
            loadTransactions();
          }}
        />
      )}
    </div>
  );
}
