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
  ShieldCheck,
  PieChart as PieChartIcon,
} from 'lucide-react';
import TransactionForm from './components/TransactionForm';
import Loading from './components/Loading';
import { API_URL } from './lib/api';
import { useAppContext } from './context/AppContext';

// --- TRADUÇÕES ---
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
    stats: 'Estatísticas',
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
    stats: 'Statistics',
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
    stats: 'Statistiche',
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

  // Estados
  const [userName, setUserName] = useState('Utente');
  const [isSuperUser, setIsSuperUser] = useState(false);
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

  // Setup de scroll e inicialização
  useEffect(() => {
    if (mounted) {
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
      console.error('Errore:', error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (mounted) loadTransactions();
  }, [currentMonth, currentYear, mounted]);

  // Cálculos de Filtro e Totais
  const filteredTransactions = useMemo(() => {
    let list = [...transactions];
    if (selectedCategory !== 'all')
      list = list.filter((trans) => trans.category_id === selectedCategory);
    if (selectedNature !== 'all') {
      list = list.filter((trans) => {
        const isInstallment = trans.description.match(/\((\d+\/\d+)\)$/);
        return selectedNature === 'installments'
          ? !!isInstallment
          : !isInstallment;
      });
    }
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
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
      if (trans.type === 'INCOME') acc[code].income += val;
      else
        trans.is_paid ? (acc[code].expense += val) : (acc[code].pending += val);
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
      {/* HEADER DINÂMICO */}
      <header className="bg-white dark:bg-slate-900 p-6 shadow-sm border-b dark:border-slate-800 transition-colors">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <div>
            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">
              {t.welcome}
            </p>
            <h1 className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {userName}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2.5 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-yellow-400"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* ÁREA ADMIN */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl">
              {isSuperUser && (
                <button
                  onClick={() => router.push('/families')}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"
                  title={t.admin}
                >
                  <ShieldCheck size={20} />
                </button>
              )}
              <button
                onClick={() => router.push('/categories')}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-xl transition-all"
              >
                <Tag size={20} />
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  router.push('/login');
                }}
                className="p-2 text-gray-400 hover:text-red-500 rounded-xl transition-all"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* SELECTOR DE DATA (ANO E MÊS) */}
      <div className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-30 shadow-sm transition-colors">
        <div className="max-w-lg mx-auto p-4 space-y-3">
          <div
            ref={yearScrollRef}
            className="flex gap-2 overflow-x-auto no-scrollbar py-1"
          >
            {[2024, 2025, 2026].map((y) => (
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
              className="text-blue-600 dark:text-blue-400 shrink-0 mr-3"
            />
            <div
              ref={monthScrollRef}
              className="flex gap-2 overflow-x-auto no-scrollbar pb-1 cursor-grab select-none"
            >
              {t.months.map((m, i) => (
                <button
                  key={m}
                  onClick={() => setCurrentMonth(i + 1)}
                  className={`px-5 py-2 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${currentMonth === i + 1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="p-4 max-w-lg mx-auto space-y-6">
        {isLoadingTransactions ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loading />
            <p className="mt-4 text-xs text-gray-400">{t.loading}</p>
          </div>
        ) : (
          <>
            {/* DASHBOARD CARDS */}
            <div className="space-y-4">
              {Object.entries(totalsByCurrency).map(([code, data]) => (
                <div
                  key={code}
                  className="bg-blue-600 dark:bg-blue-700 p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <Wallet size={80} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">
                      {t.balanceIn} {code}
                    </p>
                    <h2 className="text-4xl font-black mb-1">
                      {data.symbol}{' '}
                      {data.balance.toLocaleString(
                        language === 'en' ? 'en-US' : 'pt-BR',
                        { minimumFractionDigits: 2 },
                      )}
                    </h2>
                    <div className="flex items-center gap-2 mb-6 text-[10px] font-bold bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10">
                      <Clock size={12} /> {t.projectedBalance}: {data.symbol}{' '}
                      {data.projected.toLocaleString(
                        language === 'en' ? 'en-US' : 'pt-BR',
                        { minimumFractionDigits: 2 },
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4 text-center">
                      <div>
                        <p className="text-[8px] font-black opacity-60 uppercase mb-1">
                          {t.income}
                        </p>
                        <p className="font-bold text-sm text-green-300">
                          +{data.income}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black opacity-60 uppercase mb-1">
                          {t.expense}
                        </p>
                        <p className="font-bold text-sm text-red-300">
                          -{data.expense}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black opacity-60 uppercase mb-1">
                          {t.pendingSummary}
                        </p>
                        <p className="font-bold text-sm text-amber-300">
                          {data.pending}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* FILTROS */}
            <section className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-2xl text-[10px] font-black border uppercase transition-all whitespace-nowrap ${selectedCategory === 'all' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500'}`}
              >
                {t.all}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-2xl text-[10px] font-black border uppercase transition-all whitespace-nowrap ${selectedCategory === cat.id ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500'}`}
                >
                  {cat.name}
                </button>
              ))}
            </section>

            {/* LISTA DE TRANSAÇÕES */}
            <div className="space-y-3">
              <h3 className="font-black text-sm uppercase tracking-widest text-gray-400 px-2">
                {t.listTitle} {t.months[currentMonth - 1]}
              </h3>
              {filteredTransactions.map((trans) => (
                <div
                  key={trans.id}
                  onClick={() => {
                    setEditingTransaction(trans);
                    setIsModalOpen(true);
                  }}
                  className={`bg-white dark:bg-slate-900 p-4 rounded-2xl flex justify-between items-center shadow-sm border border-gray-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer group ${trans.is_paid ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${trans.type === 'INCOME' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}
                    >
                      {trans.type === 'INCOME' ? (
                        <TrendingUp size={20} />
                      ) : (
                        <TrendingDown size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm dark:text-white line-clamp-1">
                        {trans.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${trans.is_paid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
                        >
                          {trans.is_paid ? t.paid : t.pending}
                        </span>
                        {trans.group_id && (
                          <Repeat size={10} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-black text-sm ${trans.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {trans.type === 'INCOME' ? '+' : '-'}{' '}
                      {trans.currency?.symbol}
                      {Number(trans.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* BOTÃO FLUTUANTE */}
      <button
        onClick={() => {
          setEditingTransaction(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-8 right-6 bg-blue-600 text-white p-5 rounded-[24px] shadow-2xl z-40 hover:scale-110 active:scale-95 transition-all"
      >
        <Plus size={32} />
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
