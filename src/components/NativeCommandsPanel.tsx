import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, MessageSquare, ScrollText, MousePointer, Home, Volume2 } from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { useToast } from '@/components/ui/use-toast';

const NativeCommandsPanel = () => {
  const { isNativeMode, backgroundListening, enableBackgroundListening, executeSystemCommand } = useVoice();
  const { toast } = useToast();
  const [testingCommand, setTestingCommand] = useState<string | null>(null);

  const systemCommands = [
    {
      category: 'App Control',
      icon: <Smartphone className="w-4 h-4" />,
      commands: [
        { phrase: 'Open Camera', example: 'Hey SpeakEasy, open camera' },
        { phrase: 'Open Messages', example: 'Hey SpeakEasy, open messages' },
        { phrase: 'Open Settings', example: 'Hey SpeakEasy, open settings' },
        { phrase: 'Open Chrome', example: 'Hey SpeakEasy, open chrome' },
      ]
    },
    {
      category: 'Text & Communication',
      icon: <MessageSquare className="w-4 h-4" />,
      commands: [
        { phrase: 'Send Message', example: 'Hey SpeakEasy, send Hello to John' },
        { phrase: 'Type Text', example: 'Hey SpeakEasy, text I am on my way' },
      ]
    },
    {
      category: 'Navigation',
      icon: <ScrollText className="w-4 h-4" />,
      commands: [
        { phrase: 'Scroll Down', example: 'Hey SpeakEasy, scroll down' },
        { phrase: 'Scroll Up', example: 'Hey SpeakEasy, scroll up' },
        { phrase: 'Go Home', example: 'Hey SpeakEasy, go home' },
        { phrase: 'Go Back', example: 'Hey SpeakEasy, go back' },
      ]
    },
    {
      category: 'System Actions',
      icon: <Volume2 className="w-4 h-4" />,
      commands: [
        { phrase: 'Volume Up', example: 'Hey SpeakEasy, volume up' },
        { phrase: 'Volume Down', example: 'Hey SpeakEasy, volume down' },
        { phrase: 'Click/Tap', example: 'Hey SpeakEasy, tap' },
      ]
    }
  ];

  const testCommand = async (command: string) => {
    setTestingCommand(command);
    try {
      const success = await executeSystemCommand(command);
      toast({
        title: success ? "Command Executed" : "Command Failed",
        description: `${command} - ${success ? 'Success' : 'Failed'}`,
        variant: success ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute command",
        variant: "destructive"
      });
    } finally {
      setTestingCommand(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            System-Level Voice Commands
          </CardTitle>
          <CardDescription>
            Control your phone with voice commands. These work system-wide, even when the app is in the background.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={isNativeMode ? "default" : "secondary"}>
                {isNativeMode ? "Mobile App" : "Web App"}
              </Badge>
              {backgroundListening && (
                <Badge variant="default" className="bg-green-600">
                  Background Listening Active
                </Badge>
              )}
            </div>
            
            {isNativeMode && !backgroundListening && (
              <Button onClick={enableBackgroundListening} variant="outline">
                Enable Background Listening
              </Button>
            )}
          </div>

          {!isNativeMode && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                System-level commands require the mobile app. Export this project and build it with Capacitor for full functionality.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {systemCommands.map((category) => (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {category.icon}
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {category.commands.map((command) => (
                  <div key={command.phrase} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{command.phrase}</p>
                      <p className="text-sm text-muted-foreground">{command.example}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testCommand(command.phrase.toLowerCase())}
                      disabled={testingCommand === command.phrase.toLowerCase()}
                    >
                      {testingCommand === command.phrase.toLowerCase() ? 'Testing...' : 'Test'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Export to Mobile</p>
                <p className="text-sm text-muted-foreground">
                  Use the "Export to Github" button to transfer this project to your repository
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Build Mobile App</p>
                <p className="text-sm text-muted-foreground">
                  Run <code className="bg-muted px-1 rounded">npx cap add android</code> and <code className="bg-muted px-1 rounded">npx cap sync</code>
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Grant Permissions</p>
                <p className="text-sm text-muted-foreground">
                  Allow microphone, accessibility, and background app permissions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NativeCommandsPanel;