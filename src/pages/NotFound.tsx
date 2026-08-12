import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowLeft, SearchX } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error('404 Error: Non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F9F9F6] dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-[#A3C9A8]/10 flex items-center justify-center mx-auto mb-6">
          <SearchX size={36} className="text-[#A3C9A8]" />
        </div>
        <h1 className="text-5xl font-bold text-slate-800 dark:text-white mb-3">404</h1>
        <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Page not found</p>
        <p className="text-slate-500 mb-8 text-sm">The page you are looking for does not exist or has been moved.</p>
        <div className="flex items-center gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={16} /> Go Back
          </button>
          <button onClick={() => navigate('/')} className="px-5 py-2.5 bg-[#A3C9A8] hover:bg-[#8ab89f] text-slate-800 font-semibold rounded-xl text-sm transition-all hover:shadow-md">
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
