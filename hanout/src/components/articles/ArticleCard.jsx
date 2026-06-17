import { useState } from 'react';
import { ShoppingCart, CheckCircle, Trash2, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDateTime } from '../../utils/storage';

export default function ArticleCard({ article, onStatusChange, onDelete, onMarkInStore }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isFini = article.status === 'fini';
  const isAchete = article.status === 'achete';

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Status icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            {isAchete
              ? <CheckCircle size={20} className="text-white/70" />
              : <Package size={20} className="text-white/50" />
            }
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-white/90 text-sm leading-tight truncate">
                {article.name}
              </h3>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: isAchete ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.45)',
                }}
              >
                {isAchete ? 'Acheté' : 'Fini'}
              </span>
            </div>
            {article.quantity > 1 && (
              <p className="text-xs text-white/30 mt-0.5">Quantité: {article.quantity}</p>
            )}
            {article.barcode && (
              <p className="text-xs text-white/25 mt-0.5 font-mono">{article.barcode}</p>
            )}
          </div>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1 text-white/20 active:text-white/50"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          {isFini && (
            <button
              onClick={() => onStatusChange(article.id, 'achete')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold active:opacity-70 transition-opacity"
              style={{ background: 'rgba(220,60,60,0.18)', border: '1px solid rgba(220,60,60,0.3)', color: 'rgba(255,120,120,0.9)' }}
            >
              <ShoppingCart size={15} />
              Acheté
            </button>
          )}
          {isAchete && (
            <button
              onClick={() => onMarkInStore(article.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold active:opacity-70 transition-opacity"
              style={{ background: 'rgba(40,180,80,0.18)', border: '1px solid rgba(40,180,80,0.3)', color: 'rgba(80,220,120,0.9)' }}
            >
              <CheckCircle size={15} />
              En magasin ✓
            </button>
          )}
          {confirmDelete ? (
            <div className="flex gap-1">
              <button
                onClick={() => onDelete(article.id)}
                className="px-3 py-2.5 rounded-xl text-xs font-semibold text-white"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                Confirmer
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-2.5 rounded-xl text-xs text-white/40"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-2.5 rounded-xl text-white/20 active:text-white/50 transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div
          className="px-4 pb-4 pt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {article.notes && (
            <p className="text-xs text-white/40 mb-1">
              <span className="font-medium text-white/60">Notes:</span> {article.notes}
            </p>
          )}
          <p className="text-xs text-white/25">
            Ajouté le {formatDateTime(article.createdAt)}
          </p>
        </div>
      )}
    </div>
  );
}
