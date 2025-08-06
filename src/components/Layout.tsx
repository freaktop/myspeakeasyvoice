
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import ProtectedRoute from './ProtectedRoute';

const Layout = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="pb-20">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
};

export default Layout;
