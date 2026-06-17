import { useState } from 'react';
import { Camera, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { getGroup } from '../../constants/txGroups';
import { formatDate, formatCurrency } from '../../utils/storage';
import { apiFetch } from '../../utils/api';

export default function TransactionCard({ transaction, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);

  const isPositive = transaction.entree > 0;
  const amount = isPositive ? transaction.entree : transaction.sortie;
  const groupDef = getGroup(transaction.group);

  const toggleExpanded = async () => {
    if (!expanded && transaction.hasPhoto && !photo) {
      setLoadingPhoto(true);
      try {
        const data = await apiFetch(`/transactions/${transaction.id}/photo`);
        setPhoto(data?.photo || null);
      } catch {
        setPhoto(null);
      } finally {
        setLoadingPhoto(false);
      }
    }
    setExpanded((v) => !v);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.09)',
      }}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            {groupDef.emoji}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white/85 truncate">
                  {transaction.designation}
                </p>
                {transaction.description && (
                  <p className="text-xs text-white/35 truncate">{transaction.description}</p>
                )}
                <p className="text-xs text-white/20 mt-0.5">{formatDate(transaction.date)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {transaction.hasPhoto && (
                  <Camera size={14} className="text-white/20" />
                )}
                <span className={`font-bold text-sm ${isPositive ? 'text-white' : 'text-white/50'}`}>
                  {isPositive ? '+' : '−'}{formatCurrency(amount)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={toggleExpanded}
            className="p-1 text-white/20 active:text-white/50 flex-shrink-0"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Delete */}
        <div className="flex justify-end mt-2">
          {confirmDelete ? (
            <div className="flex gap-2">
              <button
                onClick={() => onDelete(transaction.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ background: 'rgba(255,255,255,0.18)' }}
              >
                Supprimer
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-white/40"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 text-white/15 active:text-white/50 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Photo preview */}
      {expanded && transaction.hasPhoto && (
        <div
          className="px-4 pb-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs text-white/30 mb-2 pt-3">Photo de la facture</p>
          {loadingPhoto ? (
            <p className="text-xs text-white/30">Chargement...</p>
          ) : photo ? (
            <img src={photo} alt="Facture" className="w-full rounded-xl object-cover max-h-48" />
          ) : (
            <p className="text-xs text-white/30">Photo indisponible</p>
          )}
        </div>
      )}
    </div>
  );
}
