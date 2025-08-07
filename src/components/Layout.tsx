
import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import ProtectedRoute from './ProtectedRoute';

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="pb-16 sm:pb-20">
          {children || <Outlet />}
        </main>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
};

export default Layout;
