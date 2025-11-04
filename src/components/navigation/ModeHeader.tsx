import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Settings } from 'lucide-react';

export function ModeHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  // Determine if we're in view mode or manage mode
  const isEditRoute = location.pathname.startsWith('/projects') || location.pathname.startsWith('/knowledge');
  const isViewMode = !isEditRoute && (location.pathname === '/' || /^\/[^/]+$/.test(location.pathname));
  const currentMode = isViewMode ? 'view' : 'manage';

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="inline-flex h-12 items-center justify-center rounded-lg bg-white shadow-lg border border-slate-200 p-1 text-slate-500">
        <button
          onClick={() => navigate('/')}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ${
            currentMode === 'view'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'hover:bg-slate-100 text-slate-700'
          } flex items-center gap-2`}
        >
          <Eye className="w-4 h-4" />
          View
        </button>
        <button
          onClick={() => navigate('/projects')}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ${
            currentMode === 'manage'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'hover:bg-slate-100 text-slate-700'
          } flex items-center gap-2`}
        >
          <Settings className="w-4 h-4" />
          Manage
        </button>
      </div>
    </div>
  );
}

