import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanSearch,
  Wallet,
  BookOpen,
  MessageSquare,
  Settings,
  Sun,
  Moon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { clearStoredUser, getStoredUser, updateUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import logo from '@/assets/logo.png';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', tourId: 'nav-dashboard' },
  { path: '/scanner', icon: ScanSearch, label: 'Product Scanner', tourId: 'nav-scanner' },
  { path: '/wallet', icon: Wallet, label: 'Credit Wallet', tourId: 'nav-wallet' },
  { path: '/library', icon: BookOpen, label: 'Product Library', tourId: 'nav-library' },
  { path: '/support', icon: MessageSquare, label: 'AI Support', tourId: 'nav-support' },
  { path: '/settings', icon: Settings, label: 'Settings', tourId: 'nav-settings' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const user = getStoredUser();
  const [liveCredits, setLiveCredits] = useState(() => user?.credits ?? 0);
  const realtimeRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Realtime subscription for instant credit balance updates in sidebar
  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) return;

    const channel = supabase
      .channel(`sidebar-credits-${stored.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${stored.id}` },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const newCredits = row.credits as number;
          updateUser({ credits: newCredits });
          setLiveCredits(newCredits);
        },
      )
      .subscribe();

    realtimeRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, []);

  const handleLogout = () => {
    realtimeRef.current?.unsubscribe();
    clearStoredUser();
    navigate('/auth');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300',
        'border-r border-slate-200 dark:border-slate-800',
        'bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center p-4 h-16 border-b border-slate-200 dark:border-slate-800',
          collapsed ? 'justify-center' : 'gap-2',
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <img src={logo} alt="Sourcingly" className="w-7 h-7 rounded-lg object-contain shrink-0" />
            <span className="font-bold text-slate-800 dark:text-white text-base truncate">Sourcingly</span>
          </div>
        )}
        {collapsed && (
          <img src={logo} alt="Sourcingly" className="w-7 h-7 rounded-lg object-contain" />
        )}
        <button
          onClick={onToggle}
          className={cn(
            'p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors shrink-0',
            collapsed ? 'hidden' : '',
          )}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {collapsed && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-5 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-sm text-slate-500"
        >
          <ChevronRight size={12} />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ path, icon: Icon, label, tourId }) => (
          <button
            key={path}
            id={tourId}
            onClick={() => navigate(path)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium',
              pathname === path
                ? 'bg-[#A3C9A8]/15 text-[#2d6a4f] dark:text-[#A3C9A8] border border-[#A3C9A8]/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200',
              collapsed ? 'justify-center px-2' : '',
            )}
            title={collapsed ? label : undefined}
          >
            <Icon size={17} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
            {/* Live credit pill on wallet link */}
            {!collapsed && path === '/wallet' && (
              <span className="ml-auto flex items-center gap-0.5 bg-[#A3C9A8]/20 text-[#2d6a4f] dark:text-[#A3C9A8] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                <Zap size={9} />{liveCredits}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Customer Care */}
      {!collapsed && (
        <div className="mx-3 mb-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Customer Care</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Mail size={11} />
            <span>support@sourcingly.io</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <Phone size={11} />
            <span>+1 (800) 555-0190</span>
          </div>
        </div>
      )}

      {/* Bottom */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-0.5">
        <button
          onClick={toggleTheme}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
            collapsed ? 'justify-center px-2' : '',
          )}
          title={collapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        <button
          onClick={() => navigate('/profile')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
            collapsed ? 'justify-center px-2' : '',
          )}
          title={collapsed ? user?.name : undefined}
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#A3C9A8] to-[#6fa08a] flex items-center justify-center text-xs font-bold text-white shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user?.plan} plan · {liveCredits} credits</p>
            </div>
          )}
        </button>

        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors',
            collapsed ? 'justify-center px-2' : '',
          )}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={17} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
