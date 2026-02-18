import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Settings, Mic, Smartphone, Shield } from 'lucide-react';
import { androidAccessibilitySetup } from '@/utils/AndroidAccessibilitySetup';
import { Capacitor } from '@capacitor/core';

export const AndroidSetupGuide = () => {
  const [setupStep, setSetupStep] = useState(0);
  const [isAndroid, setIsAndroid] = useState(false);
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(false);
  const [backgroundListening, setBackgroundListening] = useState(false);

  useEffect(() => {
    setIsAndroid(Capacitor.getPlatform() === 'android');
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    if (Capacitor.getPlatform() === 'android') {
      try {
        const AccessibilityService = (await import('@/plugins/AccessibilityService')).default;
        const enabled = await AccessibilityService.isAccessibilityServiceEnabled();
        setAccessibilityEnabled(enabled.enabled);
      } catch (error) {
        console.error('Failed to check permissions:', error);
      }
    }
  };

  const handleSetupStep = async (step: number) => {
    switch (step) {
      case 1:
        await androidAccessibilitySetup.requestPermissions();
        break;
      case 2: {
        const success = await androidAccessibilitySetup.startBackgroundListening();
        setBackgroundListening(success);
        break;
      }
      case 3:
        androidAccessibilitySetup.showSetupInstructions();
        break;
    }
    await checkPermissionStatus();
    setSetupStep(step);
  };

  if (!isAndroid) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Platform Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Full system integration features are only available on Android devices. 
              On web and iOS, voice commands work for basic app functions only.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Android System Integration Setup
            {accessibilityEnabled && <Badge variant="secondary">Ready</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              To control your Android device with voice commands, SpeakEasy needs accessibility permissions. 
              This allows the app to interact with other apps, scroll, click, and perform system actions.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {/* Step 1: Accessibility Permission */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {accessibilityEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Settings className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium">Enable Accessibility Service</p>
                  <p className="text-sm text-muted-foreground">
                    Allows voice commands to control system functions
                  </p>
                </div>
              </div>
              <Button 
                variant={accessibilityEnabled ? "outline" : "default"}
                size="sm"
                onClick={() => handleSetupStep(1)}
                disabled={accessibilityEnabled}
              >
                {accessibilityEnabled ? "Enabled" : "Setup"}
              </Button>
            </div>

            {/* Step 2: Background Listening */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {backgroundListening ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Mic className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium">Background Voice Listening</p>
                  <p className="text-sm text-muted-foreground">
                    Responds to wake phrases even when app is minimized
                  </p>
                </div>
              </div>
              <Button 
                variant={backgroundListening ? "outline" : "default"}
                size="sm"
                onClick={() => handleSetupStep(2)}
                disabled={!accessibilityEnabled || backgroundListening}
              >
                {backgroundListening ? "Active" : "Start"}
              </Button>
            </div>

            {/* Step 3: Manual Setup Instructions */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Manual Setup Instructions</p>
                  <p className="text-sm text-muted-foreground">
                    Step-by-step guide for Android Settings
                  </p>
                </div>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => handleSetupStep(3)}
              >
                Show Guide
              </Button>
            </div>
          </div>

          {accessibilityEnabled && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Setup Complete!</strong> You can now use voice commands like:
                <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
                  <li>"Hey SpeakEasy, open camera"</li>
                  <li>"SpeakEasy, scroll down"</li>
                  <li>"OK SpeakEasy, go home"</li>
                  <li>"SpeakEasy, send message hello there"</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};