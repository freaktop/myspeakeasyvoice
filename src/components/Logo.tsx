import logoImage from '@/assets/speakeasy-logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo = ({ size = 'md', showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} rounded-lg overflow-hidden flex-shrink-0`}>
        <img 
          src={logoImage} 
          alt="SpeakEasy Logo" 
          className="w-full h-full object-cover"
        />
      </div>
      {showText && (
        <div className={`font-bold ${textSizeClasses[size]} bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
          SpeakEasy
        </div>
      )}
    </div>
  );
};