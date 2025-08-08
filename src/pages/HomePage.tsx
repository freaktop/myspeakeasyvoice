
import { MicButton } from '@/components/MicButton';
import { ListeningIndicator } from '@/components/ListeningIndicator';
import { Logo } from '@/components/Logo';
import { VoiceStatusIndicator } from '@/components/VoiceStatusIndicator';
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
import { Zap, Plus, History, Volume2, LogOut, Smartphone, Settings, Mic } from 'lucide-react';

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
      <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 rounded-2xl relative overflow-hidden" style={{ background: 'var(--gradient-card)' }}>
              <div className="absolute inset-0 opacity-20" style={{ background: 'var(--gradient-primary)' }}></div>
              <div className="relative z-10">
                <Logo size="lg" animated={true} />
              </div>
            </div>
          </div>
          <p className="text-muted-foreground text-lg sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
            Your intelligent voice assistant for seamless system-wide control
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 bg-gradient-to-r from-card to-card/50 p-2 rounded-xl border border-border/50">
              <Badge variant={currentMode === 'personal' ? 'default' : 'outline'} className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm">
                Personal
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => switchMode(currentMode === 'personal' ? 'professional' : 'personal')}
                className="px-2 sm:px-4 py-1 sm:py-2 hover:bg-primary/10 text-xs sm:text-sm"
              >
                Switch
              </Button>
              <Badge variant={currentMode === 'professional' ? 'default' : 'outline'} className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm">
                Professional
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <VoiceStatusIndicator />
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 sm:h-10 sm:w-10">
                <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="control" className="max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 h-12 sm:h-14 bg-gradient-to-r from-card to-card/50 border border-border/50 rounded-xl">
            <TabsTrigger value="control" className="text-sm sm:text-base font-medium data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg px-2 sm:px-4">
              <span className="hidden sm:inline">Voice Control</span>
              <span className="sm:hidden">Voice</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="text-sm sm:text-base font-medium data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg px-2 sm:px-4">
              <span className="hidden sm:inline">System Commands</span>
              <span className="sm:hidden">System</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="text-sm sm:text-base font-medium data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg px-2 sm:px-4">
              <span className="hidden sm:inline">Command History</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="control" className="space-y-6 sm:space-y-8 mt-6 sm:mt-8">
            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
              <Card className="command-card">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Volume2 className="w-5 h-5 text-primary" />
                    </div>
                    Voice Control
                  </CardTitle>
                  <CardDescription className="text-base">
                    Start listening for voice commands in <span className="font-semibold text-accent">{currentMode}</span> mode
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center space-y-6">
                    <MicButton />
                    <ListeningIndicator />
                    {lastCommand && (
                      <div className="text-center p-4 bg-gradient-to-r from-muted/40 to-muted/20 rounded-xl border border-border/50">
                        <p className="text-sm text-muted-foreground mb-1">Last command:</p>
                        <p className="font-semibold text-lg">{lastCommand}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="command-card">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-accent" />
                    </div>
                    Quick Commands
                  </CardTitle>
                  <CardDescription className="text-base">
                    Common voice commands for your current mode
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentMode === 'personal' ? (
                      <>
                        <div className="p-3 bg-gradient-to-r from-muted/30 to-muted/15 rounded-lg border border-border/30">
                          <p className="text-base font-medium">"Hey SpeakEasy, open camera"</p>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-muted/30 to-muted/15 rounded-lg border border-border/30">
                          <p className="text-base font-medium">"Hey SpeakEasy, send message to John"</p>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-muted/30 to-muted/15 rounded-lg border border-border/30">
                          <p className="text-base font-medium">"Hey SpeakEasy, scroll down"</p>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-muted/30 to-muted/15 rounded-lg border border-border/30">
                          <p className="text-base font-medium">"Hey SpeakEasy, go home"</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3 bg-gradient-to-r from-muted/30 to-muted/15 rounded-lg border border-border/30">
                          <p className="text-base font-medium">"Hey SpeakEasy, open calendar"</p>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-muted/30 to-muted/15 rounded-lg border border-border/30">
                          <p className="text-base font-medium">"Hey SpeakEasy, open settings"</p>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-muted/30 to-muted/15 rounded-lg border border-border/30">
                          <p className="text-base font-medium">"Hey SpeakEasy, volume up"</p>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-muted/30 to-muted/15 rounded-lg border border-border/30">
                          <p className="text-base font-medium">"Hey SpeakEasy, go back"</p>
                        </div>
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

          <TabsContent value="history" className="mt-8">
            <Card className="command-card">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                    <History className="w-5 h-5 text-accent" />
                  </div>
                  Recent Commands
                </CardTitle>
                <CardDescription className="text-base">
                  Your voice command history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {commandHistory.length > 0 ? (
                  <div className="space-y-4">
                    {commandHistory.slice(0, 10).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/40 to-muted/20 rounded-xl border border-border/50 hover:border-accent/30 transition-colors">
                        <div className="flex-1">
                          <p className="font-semibold text-base mb-1">{item.command}</p>
                          <p className="text-sm text-muted-foreground">{item.action}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <p className="text-sm text-muted-foreground">
                            {item.timestamp.toLocaleTimeString()}
                          </p>
                          <div className="flex items-center gap-2">
                            {item.contextMode && (
                              <Badge variant="outline" className="text-xs font-medium">
                                {item.contextMode}
                              </Badge>
                            )}
                            {item.success !== undefined && (
                              <Badge variant={item.success ? "default" : "destructive"} className="text-xs font-medium">
                                {item.success ? "Success" : "Failed"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
                      <Mic className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-lg mb-2">No commands yet</p>
                    <p className="text-sm text-muted-foreground">Start by pressing the microphone button!</p>
                  </div>
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
