import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanSearch, ArrowRight } from 'lucide-react';
import { getStoredUser, updateUser } from '@/lib/auth';
import { updateProfileDb, getScansFromDb } from '@/lib/database';
import { MOCK_RECENT_SCANS } from '@/lib/mockData';
import { StatsRow } from '@/components/features/dashboard/StatsRow';
import { RecentScans } from '@/components/features/dashboard/RecentScans';
import { CreditBalance } from '@/components/features/wallet/CreditBalance';
import { OnboardingModal } from '@/components/features/onboarding/OnboardingModal';
import type { User, ExperienceLevel, ScanResult } from '@/types';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [recentScans, setRecentScans] = useState<ScanResult[]>(MOCK_RECENT_SCANS.slice(0, 5));

  useEffect(() => {
    if (!user) return;
    getScansFromDb(user.id, 8).then((dbScans) => {
      if (dbScans.length > 0) setRecentScans(dbScans);
    }).catch(console.error);
  }, [user?.id]);

  const handleOnboardingComplete = async (data: { experience: ExperienceLevel; niche: string; monthlyGoal: string }) => {
    const updated = updateUser({
      experience: data.experience,
      niche: data.niche,
      monthlyGoal: parseInt(data.monthlyGoal),
      onboardingComplete: true,
    });
    setUser(updated);
    if (updated) {
      updateProfileDb(updated.id, {
        experience: updated.experience,
        niche: updated.niche,
        monthlyGoal: updated.monthlyGoal,
        onboardingComplete: true,
      }).catch(console.error);
    }
    setTimeout(() => window.dispatchEvent(new CustomEvent('sourcingly:start-tour')), 600);
  };

  if (!user) return null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen">
      <OnboardingModal isOpen={!user.onboardingComplete} onComplete={handleOnboardingComplete} />

      <div className="px-8 py-6 border-b border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{greeting}, {user.name.split(' ')[0]}</h1>
            <p className="text-sm text-slate-500 mt-0.5 capitalize">{user.plan} plan · {user.credits} credits remaining</p>
          </div>
          <button onClick={() => navigate('/scanner')}
            className="flex items-center gap-2 bg-[#A3C9A8] hover:bg-[#8ab89f] text-slate-800 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-md">
            <ScanSearch size={16} /> Scan a Product
          </button>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <StatsRow user={user} />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentScans scans={recentScans} />
          </div>
          <div className="space-y-4">
            <CreditBalance user={user} />
            <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm border border-white/60 dark:border-slate-700/50 rounded-2xl p-5">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-3 text-sm">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: 'Scan New Product', path: '/scanner', color: 'text-[#A3C9A8]' },
                  { label: 'View Credit Wallet', path: '/wallet', color: 'text-[#8B5CF6]' },
                  { label: 'AI Support Chat', path: '/support', color: 'text-amber-500' },
                  { label: 'Account Settings', path: '/settings', color: 'text-slate-500' },
                ].map(({ label, path, color }) => (
                  <button key={path} onClick={() => navigate(path)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
                    <span className={`font-medium ${color}`}>{label}</span>
                    <ArrowRight size={14} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
