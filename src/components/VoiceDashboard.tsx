import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVoice } from '@/contexts/VoiceContext';
import { VoiceStatusIndicator } from '@/components/VoiceStatusIndicator';
import { MicButton } from '@/components/MicButton';
import { Mic, Sparkles, Clock, Zap, ArrowRight, Command, Globe, Smartphone, Settings, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const VoiceDashboard = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { commandHistory, isNativeMode, backgroundListening, isListening, startListening } = useVoice();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    // Auto-start continuous listening on load
    if (!isListening) {
      setTimeout(() => {
        startListening();
      }, 1000);
    }
  }, [startListening]);

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'there';
  const totalCommands = commandHistory.length;
  const todayCommands = commandHistory.filter(cmd => 
    new Date(cmd.timestamp).toDateString() === new Date().toDateString()
  ).length;

  const quickActions = [
    {
      title: 'Voice Commands',
      description: 'Say "Hey SpeakEasy, open camera"',
      icon: Mic,
      action: () => {},
      gradient: 'from-primary via-accent to-primary',
      shine: true
    },
    {
      title: 'System Control',
      description: 'Control apps, scroll, navigate',
      icon: Smartphone,
      action: () => navigate('/?tab=system'),
      gradient: 'from-accent via-primary to-accent',
      shine: true
    },
    {
      title: 'Custom Commands',
      description: 'Create your own voice shortcuts',
      icon: Command,
      action: () => navigate('/routines'),
      gradient: 'from-primary via-accent to-primary',
      shine: true
    },
    {
      title: 'Command History',
      description: 'View recent voice activities',
      icon: History,
      action: () => navigate('/command-log'),
      gradient: 'from-accent via-primary to-accent',
      shine: true
    },
    {
      title: 'Settings',
      description: 'Configure voice assistant',
      icon: Settings,
      action: () => navigate('/settings'),
      gradient: 'from-primary via-accent to-primary',
      shine: true
    },
    {
      title: 'Web Mode',
      description: 'Cross-platform compatibility',
      icon: Globe,
      action: () => {},
      gradient: 'from-accent via-primary to-accent',
      shine: true
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Luxurious background effects */}
      <div className="absolute inset-0">
        {/* Animated golden particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20 animate-pulse"
            style={{
              background: `radial-gradient(circle, hsl(var(--shimmer-highlight)), transparent)`,
              width: `${4 + i * 2}px`,
              height: `${4 + i * 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Elegant geometric patterns */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-primary/30 rounded-full animate-spin" style={{ animationDuration: '30s' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 border border-accent/30 rounded-full animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }}></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 border border-primary/20 rounded-full animate-spin" style={{ animationDuration: '25s', transform: 'translate(-50%, -50%)' }}></div>
        </div>
      </div>

      <div className="relative z-10 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
          {/* Premium Header */}
          <div className="text-center space-y-6 sm:space-y-8 py-8 sm:py-12">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="relative">
                {/* Glow effects */}
                <div className="absolute inset-0 rounded-3xl blur-3xl scale-150 opacity-40 animate-pulse" style={{ background: 'radial-gradient(circle, hsl(var(--shimmer-base) / 0.4), transparent 70%)' }}></div>
                <div className="absolute inset-0 rounded-3xl blur-xl scale-125 opacity-30" style={{ background: 'var(--gradient-shimmer)' }}></div>
                
                {/* Logo container */}
                <div className="relative p-4 sm:p-6 rounded-3xl" style={{ background: 'var(--gradient-card)' }}>
                  <div className="absolute inset-0 rounded-3xl" style={{ background: 'var(--gradient-shimmer)', padding: '2px' }}>
                    <div className="w-full h-full rounded-3xl bg-background/90"></div>
                  </div>
                  <div className="relative z-10">
                    <Logo size="lg" showText={false} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 sm:space-y-6 px-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight" style={{ background: 'var(--gradient-shimmer)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {greeting}, {displayName}!
              </h1>
              <p className="text-muted-foreground text-xl sm:text-2xl max-w-3xl mx-auto leading-relaxed">
                Your AI-powered voice assistant is ready to control any app on any device
              </p>
            </div>

            {/* Enhanced Status Display */}
            <div className="flex items-center justify-center gap-6 flex-wrap mt-8">
              <VoiceStatusIndicator />
              
              {backgroundListening && (
                <Badge className="bg-primary/20 text-primary border-primary/40 px-4 py-2 text-sm font-medium animate-pulse">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse" />
                  Always Listening
                </Badge>
              )}
            </div>

            {/* Central Mic Button */}
            <div className="relative flex justify-center items-center py-8">
              <div className="relative">
                {/* Premium ripple effects */}
                {[...Array(4)].map((_, i) => (
                  <div
                    key={`ripple-${i}`}
                    className="absolute rounded-full border opacity-30"
                    style={{
                      width: `${120 + i * 40}px`,
                      height: `${120 + i * 40}px`,
                      borderColor: `hsl(var(--shimmer-base))`,
                      animation: `voice-ripple 4s ease-out infinite ${i * 0.8}s`,
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                ))}
                
                {/* Enhanced Mic Button */}
                <div className="relative z-10 transform hover:scale-110 transition-all duration-300">
                  <MicButton />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <Card className="command-card group hover:scale-[1.02] transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-primary/30 group-hover:border-primary/50 transition-colors" style={{ background: 'var(--gradient-primary)' }}>
                    <Zap className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <div className="text-xl font-semibold">Today's Commands</div>
                    <div className="text-sm text-muted-foreground font-normal">Voice commands executed</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-4xl font-bold text-primary mb-2">{todayCommands}</div>
                <div className="w-full bg-muted/30 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all duration-500" style={{
                    width: `${Math.min((todayCommands / 10) * 100, 100)}%`,
                    background: 'var(--gradient-primary)'
                  }}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="command-card group hover:scale-[1.02] transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-accent/30 group-hover:border-accent/50 transition-colors" style={{ background: 'var(--gradient-shimmer)' }}>
                    <Clock className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <div className="text-xl font-semibold">Total Commands</div>
                    <div className="text-sm text-muted-foreground font-normal">All time usage</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-4xl font-bold text-accent mb-2">{totalCommands}</div>
                <div className="w-full bg-muted/30 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all duration-500" style={{
                    width: `${Math.min((totalCommands / 50) * 100, 100)}%`,
                    background: 'var(--gradient-shimmer)'
                  }}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="command-card group hover:scale-[1.02] transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-emerald-500/30 group-hover:border-emerald-500/50 transition-colors" style={{ background: 'linear-gradient(135deg, hsl(142 100% 60%), hsl(142 80% 50%))' }}>
                    <Mic className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <div className="text-xl font-semibold">Status</div>
                    <div className="text-sm text-muted-foreground font-normal">System operational</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-emerald-400">Ready</div>
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Quick Actions Grid */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-3" style={{ background: 'var(--gradient-shimmer)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Quick Actions
              </h2>
              <p className="text-muted-foreground text-lg">Control any app with your voice</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Card 
                  key={index}
                  className="command-card cursor-pointer group transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl border-border/50 hover:border-primary/40 relative overflow-hidden"
                  onClick={action.action}
                >
                  {action.shine && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(45deg, transparent 30%, hsl(var(--shimmer-highlight) / 0.1) 50%, transparent 70%)', animation: 'shimmer 2s ease-in-out infinite' }}></div>
                  )}
                  
                  <CardHeader className="pb-4 relative z-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg relative overflow-hidden`}>
                      <action.icon className="w-8 h-8 text-black relative z-10" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </div>
                    <CardTitle className="text-xl font-semibold mb-2">{action.title}</CardTitle>
                    <CardDescription className="text-base">{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 relative z-10">
                    <Button variant="ghost" size="lg" className="w-full group-hover:bg-primary/10 border border-transparent group-hover:border-primary/30 transition-all duration-300">
                      Activate
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Voice Commands Examples */}
          <Card className="command-card border-primary/30" style={{ background: 'var(--gradient-card)' }}>
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
                Example Voice Commands
              </CardTitle>
              <CardDescription className="text-base">Try these powerful voice commands</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-primary">App Control</h4>
                  <div className="space-y-3">
                    {[
                      '"Hey SpeakEasy, open Facebook"',
                      '"Hey SpeakEasy, go to Instagram and scroll down"',
                      '"Hey SpeakEasy, open camera"',
                      '"Hey SpeakEasy, launch WhatsApp"'
                    ].map((cmd, i) => (
                      <div key={i} className="p-3 bg-muted/30 rounded-lg border border-border/30 font-mono text-sm">
                        {cmd}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-accent">Advanced Control</h4>
                  <div className="space-y-3">
                    {[
                      '"Hey SpeakEasy, click on my post"',
                      '"Hey SpeakEasy, scroll down and read my last post"',
                      '"Hey SpeakEasy, go to files and open documents"',
                      '"Hey SpeakEasy, send a text to John saying hello"'
                    ].map((cmd, i) => (
                      <div key={i} className="p-3 bg-muted/30 rounded-lg border border-border/30 font-mono text-sm">
                        {cmd}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ready Message */}
          <Card className="command-card text-center border-primary/30" style={{ background: 'var(--gradient-card)' }}>
            <CardContent className="pt-8 pb-8">
              <div className="space-y-6">
                <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden" style={{ background: 'var(--gradient-primary)' }}>
                  <Mic className="w-10 h-10 text-black relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold" style={{ background: 'var(--gradient-shimmer)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Voice Assistant Ready
                  </h3>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                    Simply say <span className="font-mono bg-primary/20 px-3 py-1 rounded-lg text-primary font-semibold border border-primary/30">
                      "Hey SpeakEasy"
                    </span> followed by your command
                  </p>
                </div>
                <div className="pt-4">
                  <Badge className="bg-primary/20 text-primary border-primary/40 px-6 py-3 text-lg font-medium">
                    Always Listening • Hands-Free Control
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};