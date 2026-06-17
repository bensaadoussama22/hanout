import { useState, useMemo } from 'react';
import { X, TrendingUp, TrendingDown, Camera, Trash2 } from 'lucide-react';
import { TX_GROUPS, getGroup, buildDesignation } from '../../constants/txGroups';
import CameraCapture from './CameraCapture';
import { useKeyboardOffset } from '../../hooks/useKeyboardOffset';

const inputStyle = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'white',
};

export default function AddTransactionModal({ onAdd, onClose }) {
  const [type, setType] = useState('sortie'); // 'entree' | 'sortie'
  const [amount, setAmount] = useState('');
  const [group, setGroup] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [photoData, setPhotoData] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const kbHeight = useKeyboardOffset();

  const groupDef = group ? getGroup(group) : null;
  const needsName = groupDef && !groupDef.fixedName;

  // Une "entrée" ne peut être qu'une recette (CA) ou une catégorie libre ("Autre").
  // Toutes les autres catégories (achats, charges, dettes...) sont des sorties.
  const availableGroups = useMemo(
    () => TX_GROUPS.filter((g) => (type === 'entree' ? g.id === 'ca' || g.id === 'autre' : g.id !== 'ca')),
    [type]
  );

  const handleTypeChange = (newType) => {
    setType(newType);
    const stillValid = newType === 'entree' ? group === 'ca' || group === 'autre' : group !== 'ca';
    if (!stillValid) {
      setGroup('');
      setName('');
    }
  };

  const designationPreview = useMemo(() => {
    if (!groupDef) return null;
    return buildDesignation(group, name);
  }, [group, name, groupDef]);

  const handleCapture = (base64) => {
    setPhotoData(base64);
    setShowCamera(false);
  };

  const isValid = amount && group && (!needsName || name.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    try {
      await onAdd({
        group,
        name: needsName ? name.trim() : '',
        entree: type === 'entree' ? parseFloat(amount) : 0,
        sortie: type === 'sortie' ? parseFloat(amount) : 0,
        description,
        date: new Date(date).toISOString(),
        hasPhoto: !!photoData,
        photo: photoData,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (showCamera) {
    return <CameraCapture onCapture={handleCapture} onClose={() => setShowCamera(false)} />;
  }

  const panelMaxHeight = kbHeight > 0
    ? window.innerHeight - kbHeight - 60
    : window.innerHeight * 0.95;

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
        {/* Header + type toggle — ne scroll pas */}
        <div
          className="flex-shrink-0 px-5 pt-5 pb-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Nouvelle transaction</h2>
            <button onClick={onClose} className="p-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <X size={18} className="text-white/50" />
            </button>
          </div>

          <div className="flex rounded-2xl p-1" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              type="button"
              onClick={() => handleTypeChange('sortie')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all"
              style={type === 'sortie'
                ? { background: 'rgba(255,255,255,0.12)', color: 'white' }
                : { color: 'rgba(255,255,255,0.35)' }}
            >
              <TrendingDown size={16} /> Sortie
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('entree')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all"
              style={type === 'entree'
                ? { background: 'rgba(255,255,255,0.12)', color: 'white' }
                : { color: 'rgba(255,255,255,0.35)' }}
            >
              <TrendingUp size={16} /> Entrée
            </button>
          </div>
        </div>

        {/* Champs — scrollables */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          <form id="add-transaction-form" onSubmit={handleSubmit} className="space-y-4">
            <Field label="Montant (DA) *">
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="1"
                  required
                  inputMode="decimal"
                  className="w-full rounded-xl px-4 py-3 pr-16 placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-white/30 text-2xl font-bold"
                  style={inputStyle}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 font-semibold text-sm">DA</span>
              </div>
            </Field>

            <Field label="Catégorie (Désignation) *">
              <div className="grid grid-cols-2 gap-2">
                {availableGroups.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGroup(g.id)}
                    className="flex items-center gap-2 p-3 rounded-xl text-left transition-all active:opacity-70"
                    style={
                      group === g.id
                        ? { background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.25)', color: 'white' }
                        : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }
                    }
                  >
                    <span className="text-lg">{g.emoji}</span>
                    <span className="text-xs font-medium leading-tight">{g.label}</span>
                  </button>
                ))}
              </div>
            </Field>

            {needsName && (
              <Field label={`${groupDef.nameLabel} *`}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={groupDef.placeholder}
                  className="w-full rounded-xl px-4 py-3 placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-white/30"
                  style={inputStyle}
                  inputMode="text"
                  autoComplete="off"
                  required
                />
              </Field>
            )}

            {designationPreview && (
              <div
                className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg text-white/50"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                Désignation : <span className="font-semibold text-white/75">{designationPreview}</span>
              </div>
            )}

            <Field label="Description">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Détails de la transaction..."
                className="w-full rounded-xl px-4 py-3 placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-white/30"
                style={inputStyle}
                inputMode="text"
                autoComplete="off"
              />
            </Field>

            <Field label="Date">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-white/30"
                style={inputStyle}
              />
            </Field>

            <Field label="Photo de la facture (optionnel)">
              {photoData ? (
                <div className="relative">
                  <img src={photoData} alt="Facture" className="w-full h-32 object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => setPhotoData(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.6)' }}
                  >
                    <Trash2 size={14} className="text-white" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white/35 text-sm font-medium active:opacity-60 transition-opacity"
                  style={{ border: '2px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}
                >
                  <Camera size={20} />
                  Prendre une photo
                </button>
              )}
            </Field>
          </form>
        </div>

        {/* Bouton — toujours visible en bas */}
        <div className="flex-shrink-0 px-5 pt-3 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            type="submit"
            form="add-transaction-form"
            disabled={!isValid || submitting}
            className="w-full py-4 rounded-2xl font-semibold text-base transition-opacity active:opacity-80"
            style={
              !isValid || submitting
                ? { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)' }
                : { background: 'white', color: '#080818' }
            }
          >
            {submitting
              ? 'Enregistrement...'
              : type === 'sortie' ? '− Enregistrer la sortie' : '+ Enregistrer l\'entrée'}
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
