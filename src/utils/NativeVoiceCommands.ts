import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';

export interface SystemCommand {
  type: 'open_app' | 'send_text' | 'scroll' | 'click' | 'navigate' | 'system_action';
  target?: string;
  text?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  coordinates?: { x: number; y: number };
  action?: 'home' | 'back' | 'recent_apps' | 'volume_up' | 'volume_down';
}

export class NativeVoiceCommands {
  private static instance: NativeVoiceCommands;
  private isNative = false;
  private deviceInfo: any = null;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.initializeDevice();
  }

  static getInstance(): NativeVoiceCommands {
    if (!NativeVoiceCommands.instance) {
      NativeVoiceCommands.instance = new NativeVoiceCommands();
    }
    return NativeVoiceCommands.instance;
  }

  private async initializeDevice() {
    if (this.isNative) {
      try {
        this.deviceInfo = await Device.getInfo();
        console.log('Device initialized:', this.deviceInfo);
      } catch (error) {
        console.error('Failed to initialize device:', error);
      }
    }
  }

  async executeCommand(command: SystemCommand): Promise<boolean> {
    if (!this.isNative) {
      console.warn('Native commands only work on mobile devices');
      return false;
    }

    try {
      switch (command.type) {
        case 'open_app':
          return await this.openApp(command.target!);
        
        case 'send_text':
          return await this.sendText(command.text!, command.target);
        
        case 'scroll':
          return await this.performScroll(command.direction!);
        
        case 'click':
          return await this.performClick(command.coordinates);
        
        case 'navigate':
          return await this.performNavigation(command.action!);
        
        case 'system_action':
          return await this.performSystemAction(command.action!);
        
        default:
          console.warn('Unknown command type:', command.type);
          return false;
      }
    } catch (error) {
      console.error('Failed to execute command:', error);
      return false;
    }
  }

  private async openApp(appName: string): Promise<boolean> {
    try {
      // Map common app names to package names
      const appPackages: { [key: string]: string } = {
        'camera': 'com.android.camera',
        'messages': 'com.google.android.apps.messaging',
        'phone': 'com.google.android.dialer',
        'contacts': 'com.android.contacts',
        'settings': 'com.android.settings',
        'chrome': 'com.android.chrome',
        'gmail': 'com.google.android.gm',
        'youtube': 'com.google.android.youtube',
        'maps': 'com.google.android.apps.maps',
        'calendar': 'com.google.android.calendar',
        'calculator': 'com.android.calculator2',
        'gallery': 'com.google.android.apps.photos',
        'music': 'com.google.android.music',
        'play store': 'com.android.vending',
      };

      const packageName = appPackages[appName.toLowerCase()] || appName;
      
      if (this.deviceInfo?.platform === 'android') {
        // For Android, we'll use a custom native plugin call
        // This would require implementing a native Android plugin
        console.log(`Opening Android app: ${packageName}`);
        return await this.callNativeMethod('openApp', { packageName });
      } else if (this.deviceInfo?.platform === 'ios') {
        // For iOS, we'll use URL schemes
        const iosSchemes: { [key: string]: string } = {
          'camera': 'camera://',
          'messages': 'sms://',
          'phone': 'tel://',
          'contacts': 'contacts://',
          'settings': 'prefs:root=General',
          'safari': 'http://',
          'mail': 'mailto://',
          'calendar': 'calshow://',
          'maps': 'maps://',
          'music': 'music://',
        };
        
        const scheme = iosSchemes[appName.toLowerCase()];
        if (scheme) {
          window.open(scheme, '_system');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Failed to open app:', error);
      return false;
    }
  }

  private async sendText(text: string, target?: string): Promise<boolean> {
    try {
      if (target?.toLowerCase().includes('message') || target?.toLowerCase().includes('sms')) {
        // Open messaging app with pre-filled text
        if (this.deviceInfo?.platform === 'android') {
          return await this.callNativeMethod('sendSMS', { text });
        } else {
          window.open(`sms:&body=${encodeURIComponent(text)}`, '_system');
          return true;
        }
      } else {
        // Insert text at current cursor position
        return await this.callNativeMethod('insertText', { text });
      }
    } catch (error) {
      console.error('Failed to send text:', error);
      return false;
    }
  }

  private async performScroll(direction: string): Promise<boolean> {
    try {
      return await this.callNativeMethod('scroll', { direction });
    } catch (error) {
      console.error('Failed to scroll:', error);
      return false;
    }
  }

  private async performClick(coordinates?: { x: number; y: number }): Promise<boolean> {
    try {
      if (coordinates) {
        return await this.callNativeMethod('click', coordinates);
      } else {
        // Simulate tap at center of screen
        return await this.callNativeMethod('tap', {});
      }
    } catch (error) {
      console.error('Failed to click:', error);
      return false;
    }
  }

  private async performNavigation(action: string): Promise<boolean> {
    try {
      switch (action) {
        case 'home':
          return await this.callNativeMethod('goHome', {});
        case 'back':
          return await this.callNativeMethod('goBack', {});
        case 'recent_apps':
          return await this.callNativeMethod('showRecentApps', {});
        default:
          return false;
      }
    } catch (error) {
      console.error('Failed to navigate:', error);
      return false;
    }
  }

  private async performSystemAction(action: string): Promise<boolean> {
    try {
      switch (action) {
        case 'volume_up':
          return await this.callNativeMethod('volumeUp', {});
        case 'volume_down':
          return await this.callNativeMethod('volumeDown', {});
        default:
          return false;
      }
    } catch (error) {
      console.error('Failed to perform system action:', error);
      return false;
    }
  }

  private async callNativeMethod(method: string, params: any): Promise<boolean> {
    try {
      // This is a placeholder for native plugin calls
      // In a real implementation, you would call your custom native plugin
      console.log(`Native call: ${method}`, params);
      
      // For now, we'll simulate success for demonstration
      // In production, this would interface with actual native Android/iOS APIs
      return true;
    } catch (error) {
      console.error('Native method call failed:', error);
      return false;
    }
  }

  // Voice command parsing
  parseVoiceCommand(command: string): SystemCommand | null {
    const lowerCommand = command.toLowerCase().trim();
    
    // App opening commands
    if (lowerCommand.includes('open')) {
      const appMatch = lowerCommand.match(/open\s+(.+)/);
      if (appMatch) {
        return {
          type: 'open_app',
          target: appMatch[1].trim()
        };
      }
    }
    
    // Text sending commands
    if (lowerCommand.includes('send') || lowerCommand.includes('text') || lowerCommand.includes('message')) {
      const textMatch = lowerCommand.match(/(?:send|text|message)\s+(.+?)(?:\s+to\s+(.+))?$/);
      if (textMatch) {
        return {
          type: 'send_text',
          text: textMatch[1].trim(),
          target: textMatch[2]?.trim()
        };
      }
    }
    
    // Scrolling commands
    if (lowerCommand.includes('scroll')) {
      if (lowerCommand.includes('up')) {
        return { type: 'scroll', direction: 'up' };
      } else if (lowerCommand.includes('down')) {
        return { type: 'scroll', direction: 'down' };
      } else if (lowerCommand.includes('left')) {
        return { type: 'scroll', direction: 'left' };
      } else if (lowerCommand.includes('right')) {
        return { type: 'scroll', direction: 'right' };
      }
    }
    
    // Navigation commands
    if (lowerCommand.includes('home') || lowerCommand === 'go home') {
      return { type: 'navigate', action: 'home' };
    }
    if (lowerCommand.includes('back') || lowerCommand === 'go back') {
      return { type: 'navigate', action: 'back' };
    }
    if (lowerCommand.includes('recent') || lowerCommand.includes('task')) {
      return { type: 'navigate', action: 'recent_apps' };
    }
    
    // System actions
    if (lowerCommand.includes('volume up') || lowerCommand.includes('louder')) {
      return { type: 'system_action', action: 'volume_up' };
    }
    if (lowerCommand.includes('volume down') || lowerCommand.includes('quieter')) {
      return { type: 'system_action', action: 'volume_down' };
    }
    
    // Click commands
    if (lowerCommand.includes('click') || lowerCommand.includes('tap')) {
      return { type: 'click' };
    }
    
    return null;
  }
}

export const nativeVoiceCommands = NativeVoiceCommands.getInstance();