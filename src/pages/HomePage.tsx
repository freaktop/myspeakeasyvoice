
import { MicButton } from '@/components/MicButton';
import { ListeningIndicator } from '@/components/ListeningIndicator';
import { useVoice } from '@/contexts/VoiceContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ModeToggle from '@/components/ModeToggle';
import NativeCommandsPanel from '@/components/NativeCommandsPanel';
import { useNavigate } from 'react-router-dom';
import { Zap, Plus, History, Volume2, LogOut, Smartphone, Settings } from 'lucide-react';

const HomePage = () => {
  const { 
    lastCommand, 
    isListening, 
    currentMode, 
    isNativeMode, 
    backgroundListening,
    switchMode,
    commandHistory 
  } = useVoice();
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">SpeakEasy</h1>
          <p className="text-muted-foreground text-lg mb-4">
            Your intelligent voice assistant for seamless system-wide control
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
            <Badge variant={currentMode === 'personal' ? 'default' : 'outline'}>
              Personal
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => switchMode(currentMode === 'personal' ? 'professional' : 'personal')}
            >
              Switch Mode
            </Button>
            <Badge variant={currentMode === 'professional' ? 'default' : 'outline'}>
              Professional
            </Badge>
            {isNativeMode && (
              <Badge variant="default" className="bg-green-600">
                <Smartphone className="w-3 h-3 mr-1" />
                Mobile App
              </Badge>
            )}
            {backgroundListening && (
              <Badge variant="default" className="bg-blue-600">
                Background Active
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut size={16} />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="control" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="control">Voice Control</TabsTrigger>
            <TabsTrigger value="system">System Commands</TabsTrigger>
            <TabsTrigger value="history">Command History</TabsTrigger>
          </TabsList>

          <TabsContent value="control" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5" />
                    Voice Control
                  </CardTitle>
                  <CardDescription>
                    Start listening for voice commands in {currentMode} mode
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <MicButton />
                    <ListeningIndicator />
                    {lastCommand && (
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Last command:</p>
                        <p className="font-medium">{lastCommand}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Common voice commands for your current mode
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentMode === 'personal' ? (
                      <>
                        <p className="text-sm">"Hey SpeakEasy, open camera"</p>
                        <p className="text-sm">"Hey SpeakEasy, send message to John"</p>
                        <p className="text-sm">"Hey SpeakEasy, scroll down"</p>
                        <p className="text-sm">"Hey SpeakEasy, go home"</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm">"Hey SpeakEasy, open calendar"</p>
                        <p className="text-sm">"Hey SpeakEasy, open settings"</p>
                        <p className="text-sm">"Hey SpeakEasy, volume up"</p>
                        <p className="text-sm">"Hey SpeakEasy, go back"</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system">
            <NativeCommandsPanel />
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Commands
                </CardTitle>
                <CardDescription>
                  Your voice command history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {commandHistory.length > 0 ? (
                  <div className="space-y-3">
                    {commandHistory.slice(0, 10).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{item.command}</p>
                          <p className="text-xs text-muted-foreground">{item.action}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleTimeString()}
                          </p>
                          {item.contextMode && (
                            <Badge variant="outline" className="text-xs">
                              {item.contextMode}
                            </Badge>
                          )}
                          {item.success !== undefined && (
                            <Badge variant={item.success ? "default" : "destructive"} className="text-xs ml-1">
                              {item.success ? "Success" : "Failed"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No commands yet. Start by pressing the microphone button!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HomePage;
