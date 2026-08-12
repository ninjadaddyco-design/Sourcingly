import { useState } from 'react';
import { Mail, Calendar, Zap, Tag } from 'lucide-react';
import { getStoredUser, updateUser } from '@/lib/auth';
import { NICHES, MONTHLY_GOALS } from '@/constants';
import { toast } from 'sonner';
import { formatDate, capitalizeFirst } from '@/lib/utils';
import type { User, ExperienceLevel } from '@/types';

const Profile = () => {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [name, setName] = useState(user?.name ?? '');
  const [niche, setNiche] = useState(user?.niche ?? '');
  const [experience, setExperience] = useState<ExperienceLevel>(user?.experience ?? 'beginner');
  const [monthlyGoal, setMonthlyGoal] = useState(String(user?.monthlyGoal ?? '1000'));

  const save = () => {
    const updated = updateUser({ name, niche, experience, monthlyGoal: parseInt(monthlyGoal) });
    setUser(updated);
    toast.success('Profile saved');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <div className="px-8 py-6 border-b border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your personal information and business details.</p>
      </div>

      <div className="p-8 max-w-3xl space-y-6">
        <div className="flex items-start gap-6 p-6 bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm border border-white/60 dark:border-slate-700/50 rounded-2xl shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#A3C9A8] to-[#6fa08a] flex items-center justify-center text-white text-3xl font-bold shrink-0">
            {user.name[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{user.name}</h2>
            <div className="flex flex-wrap gap-3 text-sm text-slate-500">
              <div className="flex items-center gap-1.5"><Mail size={13} />{user.email}</div>
              <div className="flex items-center gap-1.5"><Calendar size={13} />Joined {formatDate(user.createdAt)}</div>
              <div className="flex items-center gap-1.5"><Zap size={13} className="text-[#8B5CF6]" /><span className="capitalize text-[#8B5CF6] font-medium">{user.plan} plan</span></div>
              {user.niche && <div className="flex items-center gap-1.5"><Tag size={13} className="text-[#A3C9A8]" /><span className="text-[#2d6a4f] font-medium">{user.niche}</span></div>}
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm border border-white/60 dark:border-slate-700/50 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-800 dark:text-white">Business Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Display Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#A3C9A8]/40" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Experience Level</label>
              <select value={experience} onChange={(e) => setExperience(e.target.value as ExperienceLevel)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#A3C9A8]/40">
                {(['beginner', 'intermediate', 'advanced'] as ExperienceLevel[]).map((l) => (
                  <option key={l} value={l}>{capitalizeFirst(l)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Primary Niche</label>
              <select value={niche} onChange={(e) => setNiche(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#A3C9A8]/40">
                <option value="">Select a niche</option>
                {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Monthly Revenue Goal</label>
              <select value={monthlyGoal} onChange={(e) => setMonthlyGoal(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#A3C9A8]/40">
                {MONTHLY_GOALS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          </div>
          <button onClick={save} className="px-6 py-2.5 bg-[#A3C9A8] hover:bg-[#8ab89f] text-slate-800 font-semibold rounded-xl text-sm transition-all hover:shadow-md">Save Profile</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
