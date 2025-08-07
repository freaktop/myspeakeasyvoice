import { useVoice } from '@/contexts/VoiceContext';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Smartphone, Globe } from 'lucide-react';

export const VoiceStatusIndicator = () => {
  const { isListening, isNativeMode, backgroundListening } = useVoice();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge 
        variant={isListening ? "default" : "secondary"}
        className="flex items-center gap-1 text-xs"
      >
        {isListening ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
        {isListening ? "Listening" : "Ready"}
      </Badge>
      
      <Badge 
        variant={isNativeMode ? "default" : "outline"}
        className="flex items-center gap-1 text-xs"
      >
        {isNativeMode ? <Smartphone className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
        {isNativeMode ? "Mobile" : "Web"}
      </Badge>
      
      {backgroundListening && (
        <Badge 
          variant="default" 
          className="flex items-center gap-1 bg-emerald-600 text-xs"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Background
        </Badge>
      )}
    </div>
  );
};