import AccessibilityService from '@/plugins/AccessibilityService';
import { toast } from '@/hooks/use-toast';

export class AndroidAccessibilitySetup {
  static async requestPermissions(): Promise<boolean> {
    try {
      console.log('Requesting Android accessibility permissions...');
      
      // Check if accessibility service is already enabled
      const isEnabled = await AccessibilityService.isAccessibilityServiceEnabled();
      if (isEnabled.enabled) {
        console.log('Accessibility service already enabled');
        return true;
      }

      // Request accessibility permission
      const permissionResult = await AccessibilityService.requestAccessibilityPermission();
      
      if (permissionResult.granted) {
        toast({
          title: "Accessibility Permission Granted",
          description: "Voice commands for system control are now available!",
        });
        return true;
      } else {
        toast({
          title: "Accessibility Permission Required",
          description: "Please enable accessibility service in Android Settings > Accessibility > SpeakEasy Voice Control to use system commands.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting accessibility permissions:', error);
      toast({
        title: "Permission Error",
        description: "Failed to request accessibility permissions. Please enable manually in Android Settings.",
        variant: "destructive"
      });
      return false;
    }
  }

  static async startBackgroundListening(): Promise<boolean> {
    try {
      console.log('Starting background voice listening...');
      
      // First ensure accessibility is enabled
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        return false;
      }

      // Start background listening through accessibility service
      const result = await AccessibilityService.startBackgroundListening();
      
      if (result.success) {
        toast({
          title: "Background Listening Active",
          description: "Voice commands will work even when the app is in the background.",
        });
        return true;
      } else {
        toast({
          title: "Background Listening Failed",
          description: "Could not start background voice recognition. Try restarting the app.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error starting background listening:', error);
      return false;
    }
  }

  static async stopBackgroundListening(): Promise<void> {
    try {
      await AccessibilityService.stopBackgroundListening();
      toast({
        title: "Background Listening Stopped",
        description: "Voice commands will only work when the app is active.",
      });
    } catch (error) {
      console.error('Error stopping background listening:', error);
    }
  }

  static async showSetupInstructions(): Promise<void> {
    toast({
      title: "Setup Instructions",
      description: "1. Go to Android Settings > Accessibility\n2. Find 'SpeakEasy Voice Control'\n3. Enable the service\n4. Grant microphone permission\n5. Return to the app and try voice commands",
    });
  }
}

export const androidAccessibilitySetup = AndroidAccessibilitySetup;