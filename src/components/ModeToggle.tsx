import { useVoice } from '@/contexts/VoiceContext';
import { Button } from '@/components/ui/button';
import { Briefcase, Home } from 'lucide-react';

const ModeToggle = () => {
  const { currentMode, switchMode } = useVoice();

  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
      <Button
        variant={currentMode === 'personal' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchMode('personal')}
        className="flex items-center gap-2"
      >
        <Home size={16} />
        Personal
      </Button>
      <Button
        variant={currentMode === 'professional' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchMode('professional')}
        className="flex items-center gap-2"
      >
        <Briefcase size={16} />
        Professional
      </Button>
    </div>
  );
};

export default ModeToggle;