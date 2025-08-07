import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVoice } from '@/contexts/VoiceContext';
import { Mic, Sparkles, Clock, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WelcomeDashboard = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { commandHistory, isNativeMode, backgroundListening } = useVoice();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'there';
  const totalCommands = commandHistory.length;
  const todayCommands = commandHistory.filter(cmd => 
    new Date(cmd.timestamp).toDateString() === new Date().toDateString()
  ).length;

  const quickStartActions = [
    {
      title: 'Try Voice Commands',
      description: 'Say "Hey SpeakEasy, open camera"',
      icon: Mic,
      action: () => navigate('/'),
      color: 'from-primary to-accent'
    },
    {
      title: 'System Commands',
      description: 'Control your device with voice',
      icon: Zap,
      action: () => navigate('/?tab=system'),
      color: 'from-accent to-primary'
    },
    {
      title: 'View History',
      description: 'See your recent commands',
      icon: Clock,
      action: () => navigate('/?tab=history'),
      color: 'from-primary/80 to-accent/80'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 p-3 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10">
        {/* Welcome Header */}
        <div className="text-center space-y-4 sm:space-y-6 py-6 sm:py-8">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <Logo size="md" />
            </div>
          </div>
          
          <div className="space-y-3 sm:space-y-4 px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
              {greeting}, {displayName}!
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Welcome to your voice-controlled digital assistant
            </p>
          </div>

          {/* Status badges */}
          <div className="flex items-center justify-center gap-4 flex-wrap mt-8">
            {isNativeMode && (
              <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-4 py-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Mobile Ready
              </Badge>
            )}
            {backgroundListening && (
              <Badge variant="default" className="bg-primary/20 text-primary border-primary/30 px-4 py-2 text-sm font-medium">
                Always Listening
              </Badge>
            )}
            <Badge variant="outline" className="border-accent/30 text-accent px-4 py-2 text-sm font-medium hover:bg-accent/10 transition-colors">
              Voice Assistant Active
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="command-card group hover:scale-[1.02] transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-colors">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-semibold">Commands Today</div>
                  <div className="text-sm text-muted-foreground font-normal">Voice commands executed</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-4xl font-bold text-primary mb-2">{todayCommands}</div>
              <div className="w-full bg-muted/30 rounded-full h-2">
                <div className="bg-gradient-to-r from-primary to-primary/60 h-2 rounded-full transition-all duration-500" style={{width: `${Math.min((todayCommands / 10) * 100, 100)}%`}}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="command-card group hover:scale-[1.02] transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center border border-accent/20 group-hover:border-accent/40 transition-colors">
                  <Clock className="w-6 h-6 text-accent" />
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
                <div className="bg-gradient-to-r from-accent to-accent/60 h-2 rounded-full transition-all duration-500" style={{width: `${Math.min((totalCommands / 50) * 100, 100)}%`}}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="command-card group hover:scale-[1.02] transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                  <Mic className="w-6 h-6 text-emerald-400" />
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

        {/* Quick Start Actions */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-3">Quick Start</h2>
            <p className="text-muted-foreground text-lg">Get started with these common actions</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {quickStartActions.map((action, index) => (
              <Card 
                key={index}
                className="command-card cursor-pointer group transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/20 border-border/50 hover:border-primary/30"
                onClick={action.action}
              >
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <action.icon className="w-8 h-8 text-black" />
                  </div>
                  <CardTitle className="text-xl font-semibold mb-2">{action.title}</CardTitle>
                  <CardDescription className="text-base">{action.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="ghost" size="lg" className="w-full group-hover:bg-primary/10 border border-transparent group-hover:border-primary/20 transition-all duration-300">
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {commandHistory.length > 0 && (
          <Card className="command-card">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                Recent Activity
              </CardTitle>
              <CardDescription className="text-base">Your latest voice commands</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commandHistory.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/40 to-muted/20 rounded-xl border border-border/50 hover:border-accent/30 transition-colors">
                    <div className="flex-1">
                      <p className="font-semibold text-base mb-1">{item.command}</p>
                      <p className="text-sm text-muted-foreground">{item.action}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="text-sm text-muted-foreground">
                        {item.timestamp.toLocaleTimeString()}
                      </p>
                      {item.success !== undefined && (
                        <Badge variant={item.success ? "default" : "destructive"} className="text-xs font-medium">
                          {item.success ? "✓" : "✗"}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full mt-6 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                onClick={() => navigate('/?tab=history')}
              >
                View All Commands
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Get Started Message */}
        <Card className="command-card text-center border-primary/20 bg-gradient-to-br from-card to-card/50">
          <CardContent className="pt-8 pb-8">
            <div className="space-y-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-lg">
                <Mic className="w-10 h-10 text-black" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">Ready for Voice Commands</h3>
                <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                  Say <span className="font-mono bg-gradient-to-r from-primary/20 to-accent/20 px-3 py-1 rounded-lg text-primary font-semibold border border-primary/20">
                    "Hey SpeakEasy"
                  </span> followed by your command
                </p>
              </div>
              <Button onClick={() => navigate('/')} size="lg" className="mt-6 px-8 py-3 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-black border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                Start Voice Control
                <Mic className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};