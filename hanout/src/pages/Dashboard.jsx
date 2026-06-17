import { useMemo } from 'react';
import { Package, Wallet, TrendingUp, TrendingDown, ShoppingCart, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/storage';

export default function Dashboard({ articles, transactions, stats }) {
  const pendingArticles = articles.filter((a) => a.status === 'fini');
  const boughtArticles = articles.filter((a) => a.status === 'achete');

  const recentTransactions = useMemo(
    () => [...transactions].slice(0, 5),
    [transactions]
  );

  const monthName = new Date().toLocaleDateString('fr-DZ', { month: 'long', year: 'numeric' });

  return (
    <div className="pb-24">
      {/* Hero header */}
      <div
        className="px-5 pt-14 pb-10"
        style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, transparent 100%)' }}
      >
        <p className="text-white/35 text-[11px] font-semibold uppercase tracking-widest mb-1">
          Tableau de bord
        </p>
        <h1 className="text-white text-2xl font-extrabold leading-tight">Bensaad</h1>
        <p className="text-white/35 text-sm mt-0.5">Article ménage & Gâteau</p>

        {/* Balance glass card */}
        <div
          className="mt-5 rounded-2xl p-5"
          style={{
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <p className="text-white/35 text-xs font-medium">Balance du mois — {monthName}</p>
          <p className="text-white text-3xl font-extrabold mt-1">
            {stats.monthTotal >= 0 ? '+' : '−'}{formatCurrency(stats.monthTotal)}
          </p>
          <div className="flex gap-5 mt-3">
            <div>
              <p className="text-white/35 text-xs">Revenus</p>
              <p className="text-white font-bold text-sm">+{formatCurrency(stats.monthRevenu)}</p>
            </div>
            <div>
              <p className="text-white/35 text-xs">Dépenses</p>
              <p className="text-white/50 font-bold text-sm">−{formatCurrency(stats.monthDepense)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Today stats */}
        <div className="grid grid-cols-2 gap-3">
          <GlassCard>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <TrendingUp size={14} className="text-white/70" />
              </div>
              <span className="text-xs font-semibold text-white/35">Aujourd'hui entrée</span>
            </div>
            <p className="text-xl font-extrabold text-white">+{formatCurrency(stats.todayRevenu)}</p>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <TrendingDown size={14} className="text-white/70" />
              </div>
              <span className="text-xs font-semibold text-white/35">Aujourd'hui sortie</span>
            </div>
            <p className="text-xl font-extrabold text-white/55">−{formatCurrency(stats.todayDepense)}</p>
          </GlassCard>
        </div>

        {/* Stock status */}
        <GlassCard noPad>
          <div className="px-4 py-3 border-b border-white/6">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-white/35" />
              <h2 className="font-bold text-white/70 text-sm">État du stock</h2>
            </div>
          </div>
          <div className="flex divide-x divide-white/6">
            <div className="flex-1 p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <AlertCircle size={13} className="text-white/50" />
                <span className="text-[10px] text-white/30 font-medium">À acheter</span>
              </div>
              <p className="text-2xl font-extrabold text-white/80">{pendingArticles.length}</p>
            </div>
            <div className="flex-1 p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ShoppingCart size={13} className="text-white/50" />
                <span className="text-[10px] text-white/30 font-medium">Acheté</span>
              </div>
              <p className="text-2xl font-extrabold text-white">{boughtArticles.length}</p>
            </div>
            <div className="flex-1 p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Package size={13} className="text-white/30" />
                <span className="text-[10px] text-white/30 font-medium">Total liste</span>
              </div>
              <p className="text-2xl font-extrabold text-white/50">{articles.length}</p>
            </div>
          </div>
        </GlassCard>

        {/* Pending articles alert */}
        {pendingArticles.length > 0 && (
          <div
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={17} className="text-white/60 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white/80">Articles à acheter</p>
                <p className="text-xs text-white/40 mt-0.5">
                  {pendingArticles.slice(0, 3).map((a) => a.name).join(', ')}
                  {pendingArticles.length > 3 && ` et ${pendingArticles.length - 3} autres`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent transactions */}
        {recentTransactions.length > 0 && (
          <GlassCard noPad>
            <div className="px-4 py-3 border-b border-white/6">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-white/35" />
                <h2 className="font-bold text-white/70 text-sm">Transactions récentes</h2>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {recentTransactions.map((tx) => {
                const isPositive = tx.entree > 0;
                const amount = isPositive ? tx.entree : tx.sortie;
                return (
                  <div key={tx.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/80">
                        {tx.designation}
                      </p>
                      <p className="text-xs text-white/25">
                        {new Date(tx.date).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                    <span className={`font-bold text-sm ${isPositive ? 'text-white' : 'text-white/50'}`}>
                      {isPositive ? '+' : '−'}{formatCurrency(amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        )}

        {articles.length === 0 && transactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🏪</p>
            <p className="text-white/55 font-medium">Bienvenue dans votre gestionnaire de magasin!</p>
            <p className="text-white/25 text-sm mt-1">Commencez par ajouter des articles ou des transactions.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GlassCard({ children, noPad }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden ${noPad ? '' : 'p-4'}`}
      style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {children}
    </div>
  );
}
