import logoImage from '@/assets/speakeasy-logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  animated?: boolean;
}

export const Logo = ({ size = 'md', showText = true, className = '', animated = false }: LogoProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-5xl'
  };

  const containerClasses = `
    flex items-center gap-3 ${className}
    ${animated ? 'transition-all duration-300 hover:scale-105' : ''}
  `.trim();

  return (
    <div className={containerClasses}>
      <div className={`${sizeClasses[size]} relative flex-shrink-0`}>
        {/* Glow effect for larger sizes */}
        {(size === 'lg' || size === 'xl') && (
          <div className="absolute inset-0 rounded-lg blur-sm opacity-50" 
               style={{ background: 'var(--gradient-primary)' }} />
        )}
        
        {/* Logo image container */}
        <div className={`${sizeClasses[size]} relative rounded-lg overflow-hidden`}>
          <img 
            src={logoImage} 
            alt="SpeakEasy - AI Voice Assistant" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      
      {showText && (
        <div className={`font-bold ${textSizeClasses[size]} tracking-tight`}
             style={{ 
               background: 'var(--gradient-shimmer)', 
               WebkitBackgroundClip: 'text', 
               WebkitTextFillColor: 'transparent',
               backgroundClip: 'text'
             }}>
          SpeakEasy
        </div>
      )}
    </div>
  );
};