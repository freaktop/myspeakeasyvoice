// Mobile-specific optimizations for voice recognition
export const mobileOptimizations = {
  // Optimize touch targets for mobile
  getTouchTargetSize: (isSmallScreen: boolean) => {
    return isSmallScreen ? 'min-h-[44px] min-w-[44px]' : 'min-h-[48px] min-w-[48px]';
  },
  
  // Get optimal font sizes for different screen sizes
  getFontSize: (type: 'heading' | 'body' | 'caption', isSmallScreen: boolean) => {
    const sizes = {
      heading: isSmallScreen ? 'text-2xl' : 'text-3xl',
      body: isSmallScreen ? 'text-sm' : 'text-base',
      caption: isSmallScreen ? 'text-xs' : 'text-sm'
    };
    return sizes[type];
  },
  
  // Optimize spacing for mobile
  getSpacing: (type: 'section' | 'card' | 'element', isSmallScreen: boolean) => {
    const spacing = {
      section: isSmallScreen ? 'space-y-4' : 'space-y-6',
      card: isSmallScreen ? 'p-4' : 'p-6',
      element: isSmallScreen ? 'gap-2' : 'gap-4'
    };
    return spacing[type];
  },
  
  // Mobile-optimized voice recognition settings
  getVoiceSettings: () => ({
    continuous: false, // Better for mobile battery
    interimResults: false, // Reduces processing
    maxAlternatives: 1, // Simpler results
  }),
  
  // Check if device supports touch
  isTouchDevice: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  // Get viewport info
  getViewportInfo: () => {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      isSmall: window.innerWidth < 640,
      isMedium: window.innerWidth >= 640 && window.innerWidth < 1024,
      isLarge: window.innerWidth >= 1024
    };
  }
};