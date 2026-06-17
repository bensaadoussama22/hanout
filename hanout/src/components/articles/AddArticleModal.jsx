import { useState } from 'react';
import { X, Package } from 'lucide-react';
import { useKeyboardOffset } from '../../hooks/useKeyboardOffset';

const inputStyle = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'white',
};

export default function AddArticleModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const kbHeight = useKeyboardOffset();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), quantity: parseInt(quantity) || 1, notes });
    onClose();
  };

  const panelMaxHeight = kbHeight > 0
    ? window.innerHeight - kbHeight - 60
    : window.innerHeight * 0.9;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        paddingBottom: kbHeight,
        transition: 'padding-bottom 0.25s cubic-bezier(0.2,0,0,1)',
      }}
      onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full rounded-t-3xl flex flex-col"
        style={{
          maxHeight: panelMaxHeight,
          overflow: 'hidden',
          background: 'rgba(14,14,30,0.95)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderTop: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        {/* Header — ne scroll pas */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <Package size={16} className="text-white/60" />
            </div>
            <h2 className="text-lg font-bold text-white">Nouvel article</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <X size={18} className="text-white/50" />
          </button>
        </div>

        {/* Champs — scrollables */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          <form id="add-article-form" onSubmit={handleSubmit} className="space-y-4">
            <Field label="Nom de l'article *">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Sucre 1kg, Huile 5L..."
                className="w-full rounded-xl px-4 py-3 placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-white/30"
                style={inputStyle}
                inputMode="text"
                autoComplete="off"
                required
              />
            </Field>

            <Field label="Quantité manquante">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => String(Math.max(1, parseInt(q) - 1)))}
                  className="w-11 h-11 rounded-xl text-xl font-bold text-white/55 active:opacity-60"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  className="flex-1 rounded-xl px-4 py-3 text-center text-white font-semibold focus:outline-none focus:ring-1 focus:ring-white/30"
                  style={inputStyle}
                  inputMode="numeric"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => String(parseInt(q) + 1))}
                  className="w-11 h-11 rounded-xl text-xl font-bold text-white/55 active:opacity-60"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  +
                </button>
              </div>
            </Field>

            <Field label="Notes">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Marque préférée, emplacement..."
                rows={2}
                className="w-full rounded-xl px-4 py-3 placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-white/30 resize-none"
                style={inputStyle}
              />
            </Field>
          </form>
        </div>

        {/* Bouton — toujours visible en bas */}
        <div className="flex-shrink-0 px-5 pt-3 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            type="submit"
            form="add-article-form"
            className="w-full py-4 rounded-2xl font-semibold text-base active:opacity-80 transition-opacity"
            style={{ background: 'white', color: '#080818' }}
          >
            Ajouter à la liste
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-white/35 uppercase tracking-wide mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  );
}
