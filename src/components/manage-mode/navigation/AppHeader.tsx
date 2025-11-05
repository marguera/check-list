import { NavLink, useLocation } from 'react-router-dom';
import { FolderOpen, BookOpen } from 'lucide-react';

export function AppHeader() {
  const location = useLocation();
  const currentView = location.pathname.startsWith('/knowledge') ? 'knowledge' : 'project';

  return (
    <div className="border-b border-slate-200 bg-white sticky top-0 z-50 mb-6">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 w-full">
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ${
                isActive || currentView === 'project'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'hover:text-slate-900'
              } flex items-center gap-2`
            }
          >
            <FolderOpen className="w-4 h-4" />
            Project
          </NavLink>
          <NavLink
            to="/knowledge"
            className={({ isActive }) =>
              `inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ${
                isActive || currentView === 'knowledge'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'hover:text-slate-900'
              } flex items-center gap-2`
            }
          >
            <BookOpen className="w-4 h-4" />
            Knowledge Base
          </NavLink>
        </div>
      </div>
    </div>
  );
}

