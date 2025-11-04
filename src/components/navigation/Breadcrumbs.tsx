import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const location = useLocation();
  
  if (items.length === 0) return null;

  // Determine home path based on current location
  const homePath = location.pathname.startsWith('/knowledge') ? '/knowledge' : '/projects';

  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-6" aria-label="Breadcrumb">
      <Link
        to={homePath}
        className="flex items-center hover:text-slate-900 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isActive = location.pathname === item.path;

        return (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-slate-400" />
            {isActive ? (
              <span className="text-slate-900 font-medium">{item.label}</span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-slate-900 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

