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
    <nav className="flex items-center space-x-2 text-sm text-white/60 mb-6" aria-label="Breadcrumb">
      <Link
        to={homePath}
        className="flex items-center hover:text-white transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      {items.map((item, index) => {
        const isActive = location.pathname === item.path;

        return (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-white/40" />
            {isActive ? (
              <span className="text-white font-semibold uppercase tracking-wide">{item.label}</span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-white transition-colors"
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

