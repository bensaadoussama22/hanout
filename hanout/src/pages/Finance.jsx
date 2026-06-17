import { useState, useMemo } from 'react';
import { Plus, TrendingUp, Search } from 'lucide-react';
import Header from '../components/layout/Header';
import TransactionCard from '../components/finance/TransactionCard';
import AddTransactionModal from '../components/finance/AddTransactionModal';
import { formatCurrency } from '../utils/storage';

const FILTERS = [
  { key: 'all', label: 'Tout' },
  { key: 'revenu', label: 'Revenus' },
  { key: 'depense', label: 'Dépenses' },
];

const PERIODS = [
  { key: 'all', label: 'Tout' },
  { key: 'today', label: "Auj." },
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' },
];

const activeStyle = { background: 'white', color: '#080818' };
const inactiveStyle = { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' };

export default function Finance({ transactions, onAdd, onDelete }) {
  const [showAdd, setShowAdd] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [period, setPeriod] = useState('month');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const now = new Date();
    return transactions
      .filter((t) => {
        if (typeFilter === 'revenu') return t.entree > 0;
        if (typeFilter === 'depense') return t.sortie > 0;
        return true;
      })
      .filter((t) => {
        if (period === 'all') return true;
        const d = new Date(t.date);
        if (period === 'today') return d.toDateString() === now.toDateString();
        if (period === 'week') {
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return d >= weekAgo;
        }
        if (period === 'month') {
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }
        return true;
      })
      .filter((t) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.designation && t.designation.toLowerCase().includes(q))
        );
      });
  }, [transactions, typeFilter, period, search]);

  const filteredRevenu = filtered.reduce((s, t) => s + (t.entree || 0), 0);
  const filteredDepense = filtered.reduce((s, t) => s + (t.sortie || 0), 0);
  const filteredBalance = filteredRevenu - filteredDepense;

  return (
    <div className="pb-24">
      <Header
        title="Finance"
        subtitle={`${transactions.length} transaction${transactions.length > 1 ? 's' : ''}`}
      />

      {/* Summary + filters */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Summary chips */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          <SummaryChip label="Balance" value={`${filteredBalance >= 0 ? '+' : '−'}${formatCurrency(filteredBalance)}`} bright />
          <SummaryChip label="Revenus" value={`+${formatCurrency(filteredRevenu)}`} bright />
          <SummaryChip label="Dépenses" value={`−${formatCurrency(filteredDepense)}`} />
        </div>

        {/* Period tabs */}
        <div className="flex gap-2 mt-3">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className="flex-1 py-1.5 rounded-full text-xs font-semibold transition-all text-center"
              style={period === p.key ? activeStyle : inactiveStyle}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex gap-2 mt-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setTypeFilter(f.key)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={typeFilter === f.key ? activeStyle : inactiveStyle}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full rounded-xl pl-9 pr-4 py-2 text-white placeholder-white/25 text-sm focus:outline-none focus:ring-1 focus:ring-white/30"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
            inputMode="search"
            autoComplete="off"
          />
        </div>
      </div>

      {/* List */}
      <div className="px-4 pt-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <TrendingUp size={40} className="mx-auto text-white/15 mb-3" />
            <p className="text-white/40 font-medium">Aucune transaction</p>
            <p className="text-white/25 text-sm mt-1">Appuyez sur + pour en ajouter une</p>
          </div>
        ) : (
          filtered.map((tx) => (
            <TransactionCard key={tx.id} transaction={tx} onDelete={onDelete} />
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed text-black rounded-2xl flex items-center justify-center active:scale-95 transition-transform z-40 px-5 py-3.5 gap-2"
        style={{
          right: '16px',
          bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px) + 8px)',
          background: 'white',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}
      >
        <Plus size={20} strokeWidth={2.5} />
        <span className="font-semibold text-sm">Ajouter</span>
      </button>

      {showAdd && (
        <AddTransactionModal
          onAdd={onAdd}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}

function SummaryChip({ label, value, bright }) {
  return (
    <div
      className="flex-shrink-0 rounded-xl px-3 py-2 text-center min-w-[90px]"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <p className="text-xs text-white/35">{label}</p>
      <p className={`font-bold text-sm ${bright ? 'text-white' : 'text-white/50'}`}>{value}</p>
    </div>
  );
}
