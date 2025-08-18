import { Capacitor } from '@capacitor/core';
import { AppLauncher } from '@capacitor/app-launcher';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
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
    if (!Capacitor.isNativePlatform()) {
      console.log(`Native method called (web fallback): ${method}`, params);
      return false;
    }

    try {
      switch (method) {
        case 'openApp':
          if (Capacitor.getPlatform() === 'android') {
            await AppLauncher.openUrl({
              url: `${params.packageName}://`
            });
          } else if (Capacitor.getPlatform() === 'ios') {
            await AppLauncher.openUrl({
              url: params.urlScheme
            });
          }
          return true;
        
        case 'sendSMS':
          await AppLauncher.openUrl({
            url: `sms:&body=${encodeURIComponent(params.text)}`
          });
          return true;
        
        case 'insertText':
          // This would require a custom plugin for text insertion
          console.log('Text insertion requires custom plugin:', params.text);
          return false;
        
        case 'scroll':
          // Haptic feedback for scroll action
          await Haptics.impact({ style: ImpactStyle.Light });
          return false; // Requires custom plugin for actual scrolling
        
        case 'click':
        case 'tap':
          await Haptics.impact({ style: ImpactStyle.Medium });
          return false; // Requires custom plugin for actual clicking
        
        case 'goHome':
          if (Capacitor.getPlatform() === 'android') {
            await AppLauncher.openUrl({ url: 'intent:///#Intent;action=android.intent.action.MAIN;category=android.intent.category.HOME;end' });
          }
          return true;
        
        case 'goBack':
          await App.exitApp();
          return true;
        
        case 'showRecentApps':
          // This requires system-level access
          return false;
        
        case 'volumeUp':
        case 'volumeDown':
          // Volume control requires system-level access
          await Haptics.impact({ style: ImpactStyle.Heavy });
          return false;
        
        default:
          console.log(`Unsupported native method: ${method}`, params);
          return false;
      }
    } catch (error) {
      console.error(`Native method error: ${method}`, error);
      return false;
    }
  }

  // Enhanced voice command parsing with better accuracy
  parseVoiceCommand(command: string): SystemCommand | null {
    const lowerCommand = command.toLowerCase().trim();
    console.log('Parsing command:', lowerCommand);
    
    // App opening commands - more flexible patterns
    if (lowerCommand.match(/\b(open|launch|start)\b/)) {
      const appPatterns = [
        /(?:open|launch|start)\s+(?:the\s+)?(.+?)(?:\s+app)?$/,
        /(?:can you |please )?(?:open|launch|start)\s+(.+)/,
        /(?:go to|switch to)\s+(.+)/
      ];
      
      for (const pattern of appPatterns) {
        const match = lowerCommand.match(pattern);
        if (match) {
          const appName = match[1].trim().replace(/\s+app$/, '');
          return {
            type: 'open_app',
            target: appName
          };
        }
      }
    }
    
    // Text sending commands - handle various formats
    if (lowerCommand.match(/\b(send|text|message|type|write)\b/)) {
      const textPatterns = [
        /(?:send|text|message)\s+(?:a\s+)?(?:message\s+)?(?:saying\s+)?[""']?(.+?)[""']?(?:\s+to\s+(.+))?$/,
        /(?:type|write)\s+[""']?(.+?)[""']?$/,
        /(?:say|tell)\s+(.+?)(?:\s+to\s+(.+))?$/
      ];
      
      for (const pattern of textPatterns) {
        const match = lowerCommand.match(pattern);
        if (match) {
          return {
            type: 'send_text',
            text: match[1].trim().replace(/[""']/g, ''),
            target: match[2]?.trim()
          };
        }
      }
    }
    
    // Scrolling commands - handle various phrasings
    if (lowerCommand.match(/\b(scroll|swipe|move)\b/)) {
      if (lowerCommand.match(/\b(up|upward|top)\b/)) {
        return { type: 'scroll', direction: 'up' };
      } else if (lowerCommand.match(/\b(down|downward|bottom)\b/)) {
        return { type: 'scroll', direction: 'down' };
      } else if (lowerCommand.match(/\b(left|leftward)\b/)) {
        return { type: 'scroll', direction: 'left' };
      } else if (lowerCommand.match(/\b(right|rightward)\b/)) {
        return { type: 'scroll', direction: 'right' };
      }
    }
    
    // Navigation commands - more natural language
    if (lowerCommand.match(/\b(home|main screen|home screen)\b/) || lowerCommand === 'go home') {
      return { type: 'navigate', action: 'home' };
    }
    if (lowerCommand.match(/\b(back|previous|return)\b/) || lowerCommand.match(/go back/)) {
      return { type: 'navigate', action: 'back' };
    }
    if (lowerCommand.match(/\b(recent|task|switch|app switcher)\b/)) {
      return { type: 'navigate', action: 'recent_apps' };
    }
    
    // System actions - handle variations
    if (lowerCommand.match(/\b(volume up|louder|increase volume|turn up)\b/)) {
      return { type: 'system_action', action: 'volume_up' };
    }
    if (lowerCommand.match(/\b(volume down|quieter|decrease volume|turn down|lower volume)\b/)) {
      return { type: 'system_action', action: 'volume_down' };
    }
    
    // Click/tap commands - more inclusive
    if (lowerCommand.match(/\b(click|tap|touch|press|select)\b/)) {
      // Check for coordinate patterns
      const coordMatch = lowerCommand.match(/(?:at|on)\s+(\d+)\s*,?\s*(\d+)/);
      if (coordMatch) {
        return { 
          type: 'click', 
          coordinates: { 
            x: parseInt(coordMatch[1]), 
            y: parseInt(coordMatch[2]) 
          }
        };
      }
      return { type: 'click' };
    }
    
    console.log('No command pattern matched for:', lowerCommand);
    return null;
  }
}

export const nativeVoiceCommands = NativeVoiceCommands.getInstance();