import { Button } from './button';
import { ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';

interface MobileViewHeaderProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
  children?: ReactNode;
}

export function MobileViewHeader({
  title,
  onBack,
  showBackButton = false,
  children,
}: MobileViewHeaderProps) {
  return (
    <div className="bg-[#1F1F20] px-4 sm:px-6 py-4 border-b border-white/20" style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
      <div className="flex items-center gap-3 max-w-4xl mx-auto">
        {showBackButton && onBack && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 border-white/20 text-white !bg-transparent hover:bg-white/10 hover:text-white !rounded-none"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        )}
        <h1 className="text-lg font-semibold text-white/60 uppercase flex-1">{title}</h1>
        {children}
      </div>
    </div>
  );
}

