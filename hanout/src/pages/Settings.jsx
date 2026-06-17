import { useState } from 'react';
import { Settings as SettingsIcon, Trash2, Download, ChevronRight, AlertCircle, FileSpreadsheet, User, LogOut } from 'lucide-react';
import Header from '../components/layout/Header';
import { storage } from '../utils/storage';
import { downloadExcelReport } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Settings({ articles, transactions }) {
  const { user, logout } = useAuth();
  const [confirmClear, setConfirmClear] = useState('');

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  const handleExcelExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      await downloadExcelReport();
    } catch (err) {
      setExportError(err.message || "Erreur lors de l'export.");
    } finally {
      setExporting(false);
    }
  };

  const clearArticles = () => {
    if (confirmClear !== 'articles') return;
    storage.setArticles([]);
    window.location.reload();
  };

  const clearTransactions = () => {
    if (confirmClear !== 'transactions') return;
    storage.setTransactions([]);
    window.location.reload();
  };

  return (
    <div className="pb-24">
      <Header title="Paramètres" subtitle="Configuration du magasin" />

      <div className="px-4 pt-4 space-y-4">
        {/* Compte */}
        <Section title="Compte" icon={<User size={16} />}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white/80">{user?.name || '—'}</p>
              <p className="text-xs text-white/35">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold active:opacity-70"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
            >
              <LogOut size={15} /> Déconnexion
            </button>
          </div>
        </Section>

        {/* Export */}
        <Section title="Exporter les données" icon={<Download size={16} />}>
          <button
            onClick={handleExcelExport}
            disabled={exporting}
            className="w-full flex items-center justify-between py-3 px-4 rounded-xl active:opacity-70 transition-opacity disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={16} className="text-white/40" />
              <div className="text-left">
                <p className="text-sm font-medium text-white/80">
                  {exporting ? 'Génération en cours...' : 'Rapport de gestion (Excel)'}
                </p>
                <p className="text-xs text-white/30">
                  {transactions.length} transactions · 3 feuilles
                </p>
              </div>
            </div>
            {exporting
              ? <span className="text-white/30 text-xs animate-spin">⟳</span>
              : <ChevronRight size={16} className="text-white/20" />
            }
          </button>
          {exportError && (
            <div
              className="flex items-center gap-2 text-xs px-3 py-2 mt-3 rounded-lg text-white/60"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <AlertCircle size={14} /> {exportError}
            </div>
          )}
        </Section>

        {/* Stats */}
        <Section title="Statistiques" icon={<SettingsIcon size={16} />}>
          <div className="space-y-2">
            {[
              { label: 'Articles en liste', value: articles.length },
              { label: 'Transactions totales', value: transactions.length },
              { label: 'Taille des données', value: `~${Math.round(JSON.stringify({ articles, transactions }).length / 1024)} Ko` },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex justify-between items-center py-2"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <span className="text-sm text-white/40">{stat.label}</span>
                <span className="text-sm font-semibold text-white/70">{stat.value}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Danger zone */}
        <Section title="Zone dangereuse" icon={<Trash2 size={16} className="text-white/50" />} danger>
          <div className="space-y-3">
            <p className="text-xs text-white/35">Ces actions sont irréversibles.</p>
            <div className="space-y-2">
              {confirmClear === 'articles' ? (
                <div className="flex gap-2">
                  <button
                    onClick={clearArticles}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold"
                    style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
                  >
                    Confirmer la suppression
                  </button>
                  <button
                    onClick={() => setConfirmClear('')}
                    className="px-4 py-2 rounded-xl text-sm text-white/40"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear('articles')}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-white/50 active:opacity-70"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
                >
                  Vider la liste des articles
                </button>
              )}
              {confirmClear === 'transactions' ? (
                <div className="flex gap-2">
                  <button
                    onClick={clearTransactions}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold"
                    style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
                  >
                    Confirmer la suppression
                  </button>
                  <button
                    onClick={() => setConfirmClear('')}
                    className="px-4 py-2 rounded-xl text-sm text-white/40"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear('transactions')}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-white/50 active:opacity-70"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
                >
                  Vider toutes les transactions
                </button>
              )}
            </div>
          </div>
        </Section>

        <p className="text-center text-xs text-white/20 pb-4">
          Bensaad Article Ménage & Gâteau — v1.0
        </p>
      </div>
    </div>
  );
}

function Section({ title, icon, children, danger }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: danger ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="text-white/35">{icon}</span>
        <h3 className="font-bold text-sm text-white/70">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
