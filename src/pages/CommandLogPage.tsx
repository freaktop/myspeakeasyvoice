
import { useVoice } from '@/contexts/VoiceContext';
import { Card, CardContent } from '@/components/ui/card';
import { History, Clock, CheckCircle, Mic } from 'lucide-react';
import { format } from 'date-fns';

const CommandLogPage = () => {
  const { commandHistory } = useVoice();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <History size={28} className="text-primary" />
          <h1 className="text-3xl font-bold">Command History</h1>
        </div>

        {/* Command List */}
        <div className="space-y-4">
          {commandHistory.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <Mic size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No commands yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start using voice commands to see them here
                </p>
              </CardContent>
            </Card>
          ) : (
            commandHistory.map((command) => (
              <Card key={command.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-voice-success/20">
                      <CheckCircle size={16} className="text-voice-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground">Command:</span>
                      </div>
                      <p className="font-medium mb-2">"{command.command}"</p>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground">Action:</span>
                      </div>
                      <p className="text-sm text-voice-success mb-3">{command.action}</p>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock size={12} />
                        <span>{format(command.timestamp, 'MMM d, h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {commandHistory.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {commandHistory.length} command{commandHistory.length !== 1 ? 's' : ''} total
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandLogPage;
