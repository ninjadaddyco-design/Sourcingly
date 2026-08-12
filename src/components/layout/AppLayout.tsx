import { useState, useEffect, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { AIFloatingChat } from '@/components/features/ai/AIFloatingChat';
import { GuidedTour } from '@/components/features/tour/GuidedTour';
import { getStoredUser, updateUser } from '@/lib/auth';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showTour, setShowTour] = useState(() => {
    const u = getStoredUser();
    return u?.onboardingComplete === true && u?.tourComplete !== true;
  });

  useEffect(() => {
    const handler = () => {
      const u = getStoredUser();
      if (u && !u.tourComplete) {
        setTimeout(() => setShowTour(true), 800);
      }
    };
    window.addEventListener('sourcingly:start-tour', handler);
    return () => window.removeEventListener('sourcingly:start-tour', handler);
  }, []);

  const handleTourEnd = () => {
    updateUser({ tourComplete: true });
    setShowTour(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F6] dark:bg-slate-950 flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main
        className="flex-1 min-h-screen transition-all duration-300 overflow-x-hidden"
        style={{ marginLeft: collapsed ? '64px' : '256px' }}
      >
        {children}
      </main>
      <AIFloatingChat />
      <GuidedTour isVisible={showTour} onComplete={handleTourEnd} onSkip={handleTourEnd} />
    </div>
  );
};

export default AppLayout;
