import { useState } from 'react';
import { User, Bell, Link, Shield, Trash2, CheckCircle } from 'lucide-react';
import { getStoredUser, updateUser } from '@/lib/auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { User as UserType } from '@/types';

type Tab = 'profile' | 'notifications' | 'integrations' | 'security';

const Settings = () => {
  const [tab, setTab] = useState<Tab>('profile');
  const [user, setUser] = useState<UserType | null>(getStoredUser);
  const [name, setName] = useState(user?.name ?? '');
  const [notifications, setNotifications] = useState({ weeklyReport: true, creditAlerts: true, newFeatures: false, marketing: false });
  const [shopifyConnected, setShopifyConnected] = useState(false);

  const saveProfile = () => {
    const updated = updateUser({ name });
    setUser(updated);
    toast.success('Profile updated');
  };

  const tabs: { id: Tab; icon: typeof User; label: string }[] = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'integrations', icon: Link, label: 'Integrations' },
    { id: 'security', icon: Shield, label: 'Security' },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <div className="px-8 py-6 border-b border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account preferences and integrations.</p>
      </div>
      <div className="flex">
        <aside className="w-56 border-r border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 p-4 min-h-screen">
          <nav className="space-y-1">
            {tabs.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setTab(id)}
                className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all', tab === id ? 'bg-[#A3C9A8]/15 text-[#2d6a4f] dark:text-[#A3C9A8]' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800')}>
                <Icon size={16} />{label}
              </button>
            ))}
          </nav>
        </aside>
        <div className="flex-1 p-8 max-w-2xl">
          {tab === 'profile' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-slate-800 dark:text-white">Profile Information</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#A3C9A8]/40" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <input value={user.email} disabled className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-500 cursor-not-allowed" />
                <p className="text-xs text-slate-400 mt-1">Email cannot be changed once set.</p>
              </div>
              <button onClick={saveProfile} className="px-6 py-2.5 bg-[#A3C9A8] hover:bg-[#8ab89f] text-slate-800 font-semibold rounded-xl text-sm transition-all hover:shadow-md">Save Changes</button>
            </div>
          )}
          {tab === 'notifications' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-slate-800 dark:text-white">Notification Preferences</h2>
              {Object.entries(notifications).map(([key, val]) => {
                const labels: Record<string, { title: string; desc: string }> = {
                  weeklyReport: { title: 'Weekly Performance Report', desc: 'Summary of your scans, margins, and top products.' },
                  creditAlerts: { title: 'Credit Alerts', desc: 'Notify when you have fewer than 3 credits remaining.' },
                  newFeatures: { title: 'New Features', desc: 'Updates about new Sourcingly platform features.' },
                  marketing: { title: 'Marketing & Tips', desc: 'Dropshipping tips and promotional content.' },
                };
                const { title, desc } = labels[key];
                return (
                  <div key={key} className="flex items-center justify-between p-4 bg-white/60 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white text-sm">{title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                    <button onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                      className={cn('w-11 h-6 rounded-full transition-all relative', val ? 'bg-[#A3C9A8]' : 'bg-slate-200 dark:bg-slate-700')}>
                      <div className={cn('w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm', val ? 'left-6' : 'left-1')} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {tab === 'integrations' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-slate-800 dark:text-white">Platform Integrations</h2>
              <div className="p-5 bg-white/60 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#96bf48]/15 flex items-center justify-center"><span className="font-bold text-[#96bf48] text-sm">S</span></div>
                    <div><p className="font-semibold text-slate-800 dark:text-white text-sm">Shopify</p><p className="text-xs text-slate-500">Connect your Shopify store</p></div>
                  </div>
                  {shopifyConnected && <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium"><CheckCircle size={13} /> Connected</div>}
                </div>
                <button onClick={() => { setShopifyConnected(!shopifyConnected); toast.success(shopifyConnected ? 'Shopify disconnected' : 'Shopify connected (demo mode)'); }}
                  className={cn('w-full py-2.5 rounded-xl text-sm font-semibold transition-all', shopifyConnected ? 'border border-red-200 text-red-500 hover:bg-red-50' : 'bg-[#A3C9A8] hover:bg-[#8ab89f] text-slate-800 hover:shadow-md')}>
                  {shopifyConnected ? 'Disconnect Shopify' : 'Connect Shopify Store'}
                </button>
              </div>
            </div>
          )}
          {tab === 'security' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-slate-800 dark:text-white">Account Security</h2>
              <div className="p-5 bg-white/60 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="font-medium text-slate-800 dark:text-white text-sm mb-1">Sign-in Method</p>
                <p className="text-xs text-slate-500 mb-4">You sign in using a one-time code sent to your email. No password required.</p>
                <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium"><CheckCircle size={14} /> Passwordless authentication enabled</div>
              </div>
              <div className="p-5 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/30">
                <div className="flex items-center gap-2 mb-2"><Trash2 size={16} className="text-red-500" /><p className="font-semibold text-red-700 dark:text-red-400 text-sm">Danger Zone</p></div>
                <p className="text-xs text-slate-500 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
                <button onClick={() => toast.error('Account deletion requires contacting support at support@sourcingly.io')} className="px-4 py-2 border border-red-300 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
