import { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export const ResponsiveContainer = ({ children, className = '' }: ResponsiveContainerProps) => {
  return (
    <div className={`
      min-h-screen w-full
      px-4 py-6
      sm:px-6 sm:py-8
      md:px-8 md:py-10
      lg:px-12 lg:py-12
      xl:px-16 xl:py-16
      ${className}
    `}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
};