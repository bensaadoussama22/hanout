import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Wallet, Settings } from 'lucide-react';
import { useKeyboardOffset } from '../../hooks/useKeyboardOffset';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Accueil' },
  { to: '/articles', icon: Package, label: 'Articles' },
  { to: '/finance', icon: Wallet, label: 'Finance' },
  { to: '/parametres', icon: Settings, label: 'Paramètres' },
];

export default function BottomNav() {
  const kbHeight = useKeyboardOffset();
  if (kbHeight > 120) return null;

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50"
      style={{ backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', background: 'rgba(8,8,24,0.75)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-stretch" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-white/12' : ''}`}>
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={isActive ? 'text-white' : 'text-white/35'}
                  />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-white/80' : 'text-white/35'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
