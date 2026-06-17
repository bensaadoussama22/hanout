export const inputStyle = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'white',
};

export function Field({ label, children }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-white/35 uppercase tracking-wide mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-[100svh] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            🏪
          </div>
          <h1 className="text-white text-2xl font-extrabold leading-tight">{title}</h1>
          {subtitle && <p className="text-white/35 text-sm mt-1">{subtitle}</p>}
        </div>

        <div
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
