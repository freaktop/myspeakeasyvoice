import { Capacitor } from '@capacitor/core';
import { AppLauncher } from '@capacitor/app-launcher';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';
import AccessibilityService from '@/plugins/AccessibilityService';

export interface SystemCommand {
  type: 'open_app' | 'send_text' | 'scroll' | 'click' | 'navigate' | 'system_action' | 'type_text' | 'search' | 'media_control' | 'settings' | 'help' | 'delete' | 'copy' | 'paste' | 'screenshot';
  target?: string;
  text?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  coordinates?: { x: number; y: number };
  action?: 'home' | 'back' | 'recent_apps' | 'volume_up' | 'volume_down' | 'play' | 'pause' | 'next' | 'previous' | 'mute' | 'unmute' | 'brightness_up' | 'brightness_down' | 'wifi_on' | 'wifi_off' | 'bluetooth_on' | 'bluetooth_off';
  amount?: number;
  urgency?: 'normal' | 'urgent';
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
    try {
      console.log('Executing system command:', command);
      
      // Check accessibility service for native Android capabilities
      if (this.isNative && this.deviceInfo?.platform === 'android') {
        const accessibilityEnabled = await AccessibilityService.isAccessibilityServiceEnabled();
        if (!accessibilityEnabled.enabled) {
          console.warn('Accessibility service not enabled. Some commands may not work.');
          // Still try to execute with fallbacks
        }
      }
      
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
        
        case 'type_text':
          return await this.typeText(command.text!);
        
        case 'search':
          return await this.performSearch(command.text!);
        
        case 'media_control':
          return await this.performMediaControl(command.action!);
        
        case 'settings':
          return await this.openSettings(command.target);
        
        case 'help':
          return await this.showHelp();
        
        case 'delete':
          return await this.performDelete();
        
        case 'copy':
          return await this.performCopy();
        
        case 'paste':
          return await this.performPaste();
        
        case 'screenshot':
          return await this.takeScreenshot();
        
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
      // First try using accessibility service for Android
      if (this.isNative && this.deviceInfo?.platform === 'android') {
        // Get installed apps to find the correct package name
        const installedApps = await AccessibilityService.getInstalledApps();
        const matchedApp = installedApps.apps.find(app => 
          app.name.toLowerCase().includes(appName.toLowerCase()) ||
          appName.toLowerCase().includes(app.name.toLowerCase())
        );
        
        if (matchedApp) {
          const result = await AccessibilityService.openApp({ packageName: matchedApp.packageName });
          if (result.success) return true;
        }
      }
      
      // Fallback to existing logic
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
        console.log(`Opening Android app: ${packageName}`);
        const result = await AccessibilityService.openApp({ packageName });
        return result.success;
      } else if (this.deviceInfo?.platform === 'ios') {
        // iOS URL schemes
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
        if (this.isNative && this.deviceInfo?.platform === 'android') {
          return await this.callNativeMethod('sendSMS', { text });
        } else {
          window.open(`sms:&body=${encodeURIComponent(text)}`, '_system');
          return true;
        }
      } else {
        // Insert text at current cursor position using accessibility service
        if (this.isNative && this.deviceInfo?.platform === 'android') {
          const result = await AccessibilityService.sendText({ text });
          return result.success;
        }
        return await this.callNativeMethod('insertText', { text });
      }
    } catch (error) {
      console.error('Failed to send text:', error);
      return false;
    }
  }

  private async performScroll(direction: string): Promise<boolean> {
    try {
      if (this.isNative && this.deviceInfo?.platform === 'android') {
        const result = await AccessibilityService.performScroll({ direction });
        if (result.success) return true;
      }
      return await this.callNativeMethod('scroll', { direction });
    } catch (error) {
      console.error('Failed to scroll:', error);
      return false;
    }
  }

  private async performClick(coordinates?: { x: number; y: number }): Promise<boolean> {
    try {
      if (this.isNative && this.deviceInfo?.platform === 'android') {
        if (coordinates) {
          const result = await AccessibilityService.performClick(coordinates);
          return result.success;
        } else {
          // Default center tap
          const result = await AccessibilityService.performClick({ x: 500, y: 1000 });
          return result.success;
        }
      }
      
      if (coordinates) {
        return await this.callNativeMethod('click', coordinates);
      } else {
        return await this.callNativeMethod('tap', {});
      }
    } catch (error) {
      console.error('Failed to click:', error);
      return false;
    }
  }

  private async performNavigation(action: string): Promise<boolean> {
    try {
      if (this.isNative && this.deviceInfo?.platform === 'android') {
        const result = await AccessibilityService.performGlobalAction({ action });
        if (result.success) return true;
      }
      
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
        case 'brightness_up':
          return await this.callNativeMethod('brightnessUp', {});
        case 'brightness_down':
          return await this.callNativeMethod('brightnessDown', {});
        case 'wifi_on':
          return await this.callNativeMethod('wifiOn', {});
        case 'wifi_off':
          return await this.callNativeMethod('wifiOff', {});
        case 'bluetooth_on':
          return await this.callNativeMethod('bluetoothOn', {});
        case 'bluetooth_off':
          return await this.callNativeMethod('bluetoothOff', {});
        case 'play':
        case 'pause':
        case 'next':
        case 'previous':
        case 'mute':
        case 'unmute':
          // These are handled by performMediaControl, but included here for fallback
          return await this.performMediaControl(action);
        default:
          console.warn('Unknown system action:', action);
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
    
    // Typing commands - more specific than send_text
    if (lowerCommand.match(/\b(type|write|dictate)\b/) && !lowerCommand.match(/\b(send|message)\b/)) {
      const typePatterns = [
        /(?:type|write|dictate)\s+[""']?(.+?)[""']?$/,
        /(?:type|write|dictate)\s+(.+?)(?:\s+here)?$/,
      ];
      
      for (const pattern of typePatterns) {
        const match = lowerCommand.match(pattern);
        if (match) {
          return {
            type: 'type_text' as any,
            text: match[1].trim().replace(/[""']/g, '')
          };
        }
      }
    }
    
    // Search commands
    if (lowerCommand.match(/\b(search|google|look up|find)\b/)) {
      const searchPatterns = [
        /(?:search|google|look up|find)\s+(?:for\s+)?(.+)$/,
        /(?:search|google|look up|find)\s+(.+?)(?:\s+on\s+(.+))?$/,
      ];
      
      for (const pattern of searchPatterns) {
        const match = lowerCommand.match(pattern);
        if (match) {
          return {
            type: 'search' as any,
            text: match[1].trim()
          };
        }
      }
    }
    
    // Media control commands
    if (lowerCommand.match(/\b(play|pause|stop|next|previous|skip|mute|unmute)\b/)) {
      if (lowerCommand.match(/\b(play|start music|resume)\b/)) {
        return { type: 'media_control' as any, action: 'play' };
      } else if (lowerCommand.match(/\b(pause|stop music)\b/)) {
        return { type: 'media_control' as any, action: 'pause' };
      } else if (lowerCommand.match(/\b(next|skip|forward)\b/)) {
        return { type: 'media_control' as any, action: 'next' };
      } else if (lowerCommand.match(/\b(previous|back|go back)\b/)) {
        return { type: 'media_control' as any, action: 'previous' };
      } else if (lowerCommand.match(/\b(mute|silence)\b/)) {
        return { type: 'media_control' as any, action: 'mute' };
      } else if (lowerCommand.match(/\b(unmute|turn on sound)\b/)) {
        return { type: 'media_control' as any, action: 'unmute' };
      }
    }
    
    // Settings commands
    if (lowerCommand.match(/\b(settings|preferences|setup)\b/)) {
      if (lowerCommand.match(/\b(wifi|wireless)\b/)) {
        return { type: 'settings' as any, target: 'wifi' };
      } else if (lowerCommand.match(/\b(bluetooth|bt)\b/)) {
        return { type: 'settings' as any, target: 'bluetooth' };
      } else if (lowerCommand.match(/\b(sound|audio|volume)\b/)) {
        return { type: 'settings' as any, target: 'sound' };
      } else if (lowerCommand.match(/\b(display|screen|brightness)\b/)) {
        return { type: 'settings' as any, target: 'display' };
      } else if (lowerCommand.match(/\b(apps|applications)\b/)) {
        return { type: 'settings' as any, target: 'apps' };
      } else if (lowerCommand.match(/\b(battery|power)\b/)) {
        return { type: 'settings' as any, target: 'battery' };
      } else {
        return { type: 'settings' as any };
      }
    }
    
    // Help command
    if (lowerCommand.match(/\b(help|commands|what can i say|list commands)\b/)) {
      return { type: 'help' as any };
    }
    
    // Text editing commands
    if (lowerCommand.match(/\b(copy|duplicate)\b/)) {
      return { type: 'copy' as any };
    }
    if (lowerCommand.match(/\b(paste|insert)\b/)) {
      return { type: 'paste' as any };
    }
    if (lowerCommand.match(/\b(delete|remove|erase|clear)\b/)) {
      return { type: 'delete' as any };
    }
    
    // Screenshot command
    if (lowerCommand.match(/\b(screenshot|capture|screen capture|take picture)\b/)) {
      return { type: 'screenshot' as any };
    }
    
    // Enhanced system actions
    if (lowerCommand.match(/\b(brightness up|increase brightness|brighter)\b/)) {
      return { type: 'system_action' as any, action: 'brightness_up' };
    }
    if (lowerCommand.match(/\b(brightness down|decrease brightness|dimmer)\b/)) {
      return { type: 'system_action' as any, action: 'brightness_down' };
    }
    if (lowerCommand.match(/\b(wifi on|enable wifi|turn on wifi)\b/)) {
      return { type: 'system_action' as any, action: 'wifi_on' };
    }
    if (lowerCommand.match(/\b(wifi off|disable wifi|turn off wifi)\b/)) {
      return { type: 'system_action' as any, action: 'wifi_off' };
    }
    if (lowerCommand.match(/\b(bluetooth on|enable bluetooth)\b/)) {
      return { type: 'system_action' as any, action: 'bluetooth_on' };
    }
    if (lowerCommand.match(/\b(bluetooth off|disable bluetooth)\b/)) {
      return { type: 'system_action' as any, action: 'bluetooth_off' };
    }

    console.log('No command pattern matched for:', lowerCommand);
    return null;
  }

  // New command execution methods
  private async typeText(text: string): Promise<boolean> {
    try {
      if (this.isNative && this.deviceInfo?.platform === 'android') {
        const result = await AccessibilityService.sendText({ text });
        return result.success;
      }
      return await this.callNativeMethod('insertText', { text });
    } catch (error) {
      console.error('Failed to type text:', error);
      return false;
    }
  }

  private async performSearch(query: string): Promise<boolean> {
    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      
      if (this.isNative) {
        await AppLauncher.openUrl({ url: searchUrl });
        return true;
      } else {
        window.open(searchUrl, '_blank');
        return true;
      }
    } catch (error) {
      console.error('Failed to perform search:', error);
      return false;
    }
  }

  private async performMediaControl(action: string): Promise<boolean> {
    try {
      if (this.isNative && this.deviceInfo?.platform === 'android') {
        const result = await AccessibilityService.performMediaControl({ action });
        return result.success;
      }
      return await this.callNativeMethod('mediaControl', { action });
    } catch (error) {
      console.error('Failed to control media:', error);
      return false;
    }
  }

  private async openSettings(target?: string): Promise<boolean> {
    try {
      if (target) {
        // Open specific settings page
        const settingsPages: { [key: string]: string } = {
          'wifi': 'android.settings.WIFI_SETTINGS',
          'bluetooth': 'android.settings.BLUETOOTH_SETTINGS',
          'sound': 'android.settings.SOUND_SETTINGS',
          'display': 'android.settings.DISPLAY_SETTINGS',
          'apps': 'android.settings.APPLICATION_SETTINGS',
          'battery': 'android.settings.BATTERY_SAVER_SETTINGS'
        };

        const settingPage = settingsPages[target.toLowerCase()];
        if (settingPage && this.isNative && this.deviceInfo?.platform === 'android') {
          const result = await AccessibilityService.openSettings({ page: settingPage });
          return result.success;
        }
      }
      
      // Open general settings
      return await this.openApp('settings');
    } catch (error) {
      console.error('Failed to open settings:', error);
      return false;
    }
  }

  private async showHelp(): Promise<boolean> {
    try {
      const helpText = `
        SpeakEasy Voice Commands:
        • "Open [app name]" - Launch applications
        • "Type [text]" - Insert text at cursor
        • "Search for [query]" - Web search
        • "Play/Pause/Next/Previous" - Media control
        • "Open settings" - System settings
        • "Screenshot" - Capture screen
        • "Copy/Paste/Delete" - Text editing
        • "Help" - Show this message
      `;
      
      console.log(helpText);
      
      if (this.isNative) {
        // Show help in a native dialog or toast
        return await this.callNativeMethod('showHelp', { message: helpText });
      } else {
        alert(helpText);
        return true;
      }
    } catch (error) {
      console.error('Failed to show help:', error);
      return false;
    }
  }

  private async performDelete(): Promise<boolean> {
    try {
      if (this.isNative && this.deviceInfo?.platform === 'android') {
        const result = await AccessibilityService.performDelete();
        return result.success;
      }
      return await this.callNativeMethod('delete', {});
    } catch (error) {
      console.error('Failed to perform delete:', error);
      return false;
    }
  }

  private async performCopy(): Promise<boolean> {
    try {
      if (this.isNative && this.deviceInfo?.platform === 'android') {
        const result = await AccessibilityService.performCopy();
        return result.success;
      }
      return await this.callNativeMethod('copy', {});
    } catch (error) {
      console.error('Failed to perform copy:', error);
      return false;
    }
  }

  private async performPaste(): Promise<boolean> {
    try {
      if (this.isNative && this.deviceInfo?.platform === 'android') {
        const result = await AccessibilityService.performPaste();
        return result.success;
      }
      return await this.callNativeMethod('paste', {});
    } catch (error) {
      console.error('Failed to perform paste:', error);
      return false;
    }
  }

  private async takeScreenshot(): Promise<boolean> {
    try {
      if (this.isNative) {
        const result = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri
        });
        
        // Save or share the screenshot
        await Share.share({
          title: 'Screenshot',
          text: 'Screenshot captured by SpeakEasy',
          url: result.webPath
        });
        
        return true;
      } else {
        // Web fallback - use screen capture API if available
        if ('mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices) {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          const track = stream.getVideoTracks()[0];
          const imageCapture = new (window as any).ImageCapture(track);
          const bitmap = await imageCapture.grabFrame();
          
          // Convert to blob and download
          const canvas = document.createElement('canvas');
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(bitmap, 0, 0);
          
          canvas.toBlob((blob: Blob | null) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `screenshot-${Date.now()}.png`;
              a.click();
              URL.revokeObjectURL(url);
            }
          });
          
          track.stop();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Failed to take screenshot:', error);
      return false;
    }
  }

}

export const nativeVoiceCommands = NativeVoiceCommands.getInstance();