
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
          <AlertCircle size={32} className="text-destructive" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Button onClick={() => navigate('/')} className="w-full">
          <Home size={20} className="mr-2" />
          Go Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
