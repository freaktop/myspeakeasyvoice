import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Brain, Star, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const VoiceTrainingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isTraining, setIsTraining] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const trainingPhrases = [
    "Turn on the lights",
    "What's the weather today?", 
    "Set a timer for 5 minutes",
    "Play my favorite music",
    "Send a text message",
    "Open the camera app",
    "Check my calendar",
    "Turn off all notifications"
  ];

  const handleStartTraining = () => {
    setIsTraining(true);
    setCurrentPhrase(0);
    setProgress(0);
  };

  const handleRecordPhrase = async () => {
    if (!isRecording) {
      setIsRecording(true);
      
      try {
        // Simulate recording for demo
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        setIsRecording(false);
        
        // Move to next phrase
        const nextPhrase = currentPhrase + 1;
        const newProgress = ((nextPhrase) / trainingPhrases.length) * 100;
        
        setCurrentPhrase(nextPhrase);
        setProgress(newProgress);
        
        if (nextPhrase >= trainingPhrases.length) {
          setIsTraining(false);
          toast({
            title: "Training Complete!",
            description: "Your voice profile has been improved. Voice recognition should be more accurate now.",
            duration: 4000,
          });
        }
      } catch (error) {
        setIsRecording(false);
        toast({
          title: "Recording Failed",
          description: "Please try again or check your microphone permissions.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Voice Training</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Improve Voice Recognition</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Train the AI to better understand your voice and accent
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isTraining ? (
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">What is Voice Training?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Voice training helps the AI learn your unique speech patterns, accent, and pronunciation 
                    to provide more accurate voice recognition.
                  </p>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">Improves accuracy by up to 40%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">You'll be asked to say:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {trainingPhrases.slice(0, 4).map((phrase, index) => (
                      <Badge key={index} variant="outline" className="justify-start p-2">
                        "{phrase}"
                      </Badge>
                    ))}
                    <Badge variant="outline" className="justify-start p-2 text-muted-foreground">
                      +{trainingPhrases.length - 4} more phrases
                    </Badge>
                  </div>
                </div>

                <Button 
                  onClick={handleStartTraining}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Start Voice Training
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Training Progress</span>
                    <span>{currentPhrase}/{trainingPhrases.length}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {currentPhrase < trainingPhrases.length && (
                  <div className="text-center space-y-4">
                    <div className="bg-muted/50 p-6 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Say this phrase clearly:</p>
                      <p className="text-xl font-medium">
                        "{trainingPhrases[currentPhrase]}"
                      </p>
                    </div>

                    <Button
                      onClick={handleRecordPhrase}
                      disabled={isRecording}
                      className={`w-24 h-24 rounded-full text-lg ${
                        isRecording ? 'bg-red-500 hover:bg-red-600' : ''
                      }`}
                      size="lg"
                    >
                      {isRecording ? (
                        <div className="flex flex-col items-center gap-1">
                          <MicOff className="w-8 h-8" />
                          <span className="text-xs">Recording...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Mic className="w-8 h-8" />
                          <span className="text-xs">Tap to Record</span>
                        </div>
                      )}
                    </Button>

                    {isRecording && (
                      <div className="flex justify-center">
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, i) => (
                            <div 
                              key={i}
                              className="w-2 h-8 bg-primary rounded-full animate-pulse"
                              style={{ animationDelay: `${i * 0.2}s` }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceTrainingPage;