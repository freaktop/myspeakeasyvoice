import { registerPlugin } from '@capacitor/core';

export interface AccessibilityServicePlugin {
  requestAccessibilityPermission(): Promise<{ granted: boolean }>;
  isAccessibilityServiceEnabled(): Promise<{ enabled: boolean }>;
  performGlobalAction(options: { action: string }): Promise<{ success: boolean }>;
  performScroll(options: { direction: string }): Promise<{ success: boolean }>;
  performClick(options: { x: number; y: number }): Promise<{ success: boolean }>;
  openApp(options: { packageName: string }): Promise<{ success: boolean }>;
  sendText(options: { text: string }): Promise<{ success: boolean }>;
  getInstalledApps(): Promise<{ apps: Array<{ name: string; packageName: string }> }>;
  startBackgroundListening(): Promise<{ success: boolean }>;
  stopBackgroundListening(): Promise<{ success: boolean }>;
}

const AccessibilityService = registerPlugin<AccessibilityServicePlugin>('AccessibilityService', {
  web: () => ({
    async requestAccessibilityPermission() {
      console.log('Web: Accessibility permission not needed');
      return { granted: true };
    },
    async isAccessibilityServiceEnabled() {
      return { enabled: false };
    },
    async performGlobalAction(options: { action: string }) {
      console.log('Web: Global action not supported:', options.action);
      return { success: false };
    },
    async performScroll(options: { direction: string }) {
      const direction = options.direction.toLowerCase();
      if (direction === 'up') {
        window.scrollBy(0, -300);
      } else if (direction === 'down') {
        window.scrollBy(0, 300);
      } else if (direction === 'left') {
        window.scrollBy(-300, 0);
      } else if (direction === 'right') {
        window.scrollBy(300, 0);
      }
      return { success: true };
    },
    async performClick(options: { x: number; y: number }) {
      console.log('Web: Click simulation not supported');
      return { success: false };
    },
    async openApp(options: { packageName: string }) {
      console.log('Web: App opening not supported:', options.packageName);
      return { success: false };
    },
    async sendText(options: { text: string }) {
      console.log('Web: Text sending not supported:', options.text);
      return { success: false };
    },
    async getInstalledApps() {
      return { apps: [] };
    },
    async startBackgroundListening() {
      console.log('Web: Background listening not supported');
      return { success: false };
    },
    async stopBackgroundListening() {
      return { success: false };
    }
  })
});

export default AccessibilityService;