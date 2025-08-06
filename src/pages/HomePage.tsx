
import { MicButton } from '@/components/MicButton';
import { ListeningIndicator } from '@/components/ListeningIndicator';
import { useVoice } from '@/contexts/VoiceContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ModeToggle from '@/components/ModeToggle';
import { useNavigate } from 'react-router-dom';
import { Zap, Plus, History, Volume2, LogOut } from 'lucide-react';

const HomePage = () => {
  const { lastCommand, isListening, currentMode } = useVoice();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const quickActions = [
    {
      icon: Zap,
      label: 'Quick Actions',
      description: 'Launch apps & shortcuts',
      action: () => console.log('Quick actions'),
    },
    {
      icon: Plus,
      label: 'Add Routine',
      description: 'Create voice macros',
      action: () => navigate('/routines'),
    },
    {
      icon: History,
      label: 'Command History',
      description: 'View recent commands',
      action: () => navigate('/commands'),
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">SpeakEasy</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {profile?.display_name || user?.email?.split('@')[0]}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut size={20} />
          </Button>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-muted-foreground">Current mode</p>
            <p className="font-medium capitalize">{currentMode}</p>
          </div>
          <ModeToggle />
        </div>

        {/* Main Voice Control Area */}
        <div className="flex flex-col items-center mb-8">
          <MicButton />
          <div className="mt-6 h-16 flex items-center justify-center">
            <ListeningIndicator />
          </div>
        </div>

        {/* Last Command Output */}
        {lastCommand && !isListening && (
          <div className="command-card mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <Volume2 size={20} className="text-voice-success" />
              <span className="text-sm text-muted-foreground">You said:</span>
            </div>
            <p className="text-lg font-medium text-voice-success">{lastCommand}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="quick-action-btn w-full text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <action.icon size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{action.label}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
