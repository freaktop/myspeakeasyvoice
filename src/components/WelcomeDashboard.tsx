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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <Logo size="md" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {greeting}, {displayName}!
            </h1>
            <p className="text-muted-foreground text-lg">
              Welcome to your voice-controlled digital assistant
            </p>
          </div>

          {/* Status badges */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {isNativeMode && (
              <Badge variant="default" className="bg-green-600/20 text-green-400 border-green-600/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Mobile Ready
              </Badge>
            )}
            {backgroundListening && (
              <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
                Always Listening
              </Badge>
            )}
            <Badge variant="outline" className="border-accent/30 text-accent">
              Voice Assistant Active
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="command-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                Commands Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{todayCommands}</div>
              <p className="text-sm text-muted-foreground">Voice commands executed</p>
            </CardContent>
          </Card>

          <Card className="command-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-accent" />
                </div>
                Total Commands
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{totalCommands}</div>
              <p className="text-sm text-muted-foreground">All time usage</p>
            </CardContent>
          </Card>

          <Card className="command-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-600/20 flex items-center justify-center">
                  <Mic className="w-4 h-4 text-green-400" />
                </div>
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-green-400">Ready</div>
              <p className="text-sm text-muted-foreground">System operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start Actions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Quick Start</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {quickStartActions.map((action, index) => (
              <Card 
                key={index}
                className="command-card cursor-pointer group transition-all duration-300 hover:scale-105"
                onClick={action.action}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-black" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {commandHistory.length > 0 && (
          <Card className="command-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest voice commands</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commandHistory.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{item.command}</p>
                      <p className="text-xs text-muted-foreground">{item.action}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {item.timestamp.toLocaleTimeString()}
                      </p>
                      {item.success !== undefined && (
                        <Badge variant={item.success ? "default" : "destructive"} className="text-xs">
                          {item.success ? "✓" : "✗"}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => navigate('/?tab=history')}
              >
                View All Commands
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Get Started Message */}
        <Card className="command-card text-center">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <Mic className="w-8 h-8 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Ready for Voice Commands</h3>
                <p className="text-muted-foreground">
                  Say <span className="font-mono bg-muted px-2 py-1 rounded text-primary">
                    "Hey SpeakEasy"
                  </span> followed by your command
                </p>
              </div>
              <Button onClick={() => navigate('/')} size="lg" className="mt-4">
                Start Voice Control
                <Mic className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};