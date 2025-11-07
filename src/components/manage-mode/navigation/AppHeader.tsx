import { NavLink, useLocation } from 'react-router-dom';
import { FolderOpen, BookOpen } from 'lucide-react';

export function AppHeader() {
  const location = useLocation();
  const currentView = location.pathname.startsWith('/knowledge') ? 'knowledge' : 'project';

  return (
    <div className="border-b border-white/10 bg-[#1F1F20] sticky top-0 z-50 mb-6">
      <div className="mx-auto px-4 py-4 w-full max-w-5xl">
        <div className="flex h-12 items-center gap-2 rounded-lg bg-white/10 p-1 text-white/70">
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F1F20] ${
                isActive || currentView === 'project'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'hover:text-white'
              } flex items-center gap-2`
            }
          >
            <FolderOpen className="w-4 h-4" />
            Project
          </NavLink>
          <NavLink
            to="/knowledge"
            className={({ isActive }) =>
              `inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F1F20] ${
                isActive || currentView === 'knowledge'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'hover:text-white'
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

