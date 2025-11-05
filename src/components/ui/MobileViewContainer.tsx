import { ReactNode } from 'react';

interface MobileViewContainerProps {
  children: ReactNode;
  className?: string;
}

export function MobileViewContainer({
  children,
  className = '',
}: MobileViewContainerProps) {
  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {children}
    </div>
  );
}

