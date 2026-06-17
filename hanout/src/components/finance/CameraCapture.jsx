import { useRef, useState } from 'react';
import { Camera, X, RotateCcw, Check } from 'lucide-react';

export default function CameraCapture({ onCapture, onClose }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (preview) onCapture(preview);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-2">
          <Camera size={20} />
          <span className="font-semibold">Photo de la facture</span>
        </div>
        <button onClick={onClose} className="p-2 rounded-full bg-white/10">
          <X size={22} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
        {preview ? (
          <>
            <img
              src={preview}
              alt="Aperçu facture"
              className="max-h-64 w-full object-contain rounded-2xl"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setPreview(null); inputRef.current.value = ''; }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 text-white rounded-xl font-medium"
              >
                <RotateCcw size={18} /> Reprendre
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-medium"
              >
                <Check size={18} /> Confirmer
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center">
              <Camera size={40} className="text-white/60" />
            </div>
            <p className="text-white/60 text-sm text-center">
              Prenez une photo ou choisissez une image de la facture
            </p>
            <button
              onClick={() => inputRef.current.click()}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-semibold text-base"
            >
              Ouvrir la caméra
            </button>
            <button
              onClick={onClose}
              className="text-white/50 text-sm"
            >
              Continuer sans photo
            </button>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
