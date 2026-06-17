export default function Header({ title, subtitle, action }) {
  return (
    <header
      className="px-4 pt-4 pb-3 sticky top-0 z-40"
      style={{ backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', background: 'rgba(8,8,24,0.7)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </header>
  );
}
