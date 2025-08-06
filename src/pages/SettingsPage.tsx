
import { useVoice } from '@/contexts/VoiceContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Settings, Mic, Volume2, RotateCcw } from 'lucide-react';

const SettingsPage = () => {
  const { settings, updateSettings } = useVoice();

  const handleResetPermissions = () => {
    console.log('Resetting permissions...');
    // In a real app, this would reset microphone permissions
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Settings size={28} className="text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Wake Phrase */}
          <div className="settings-card">
            <div className="flex items-center gap-3 mb-4">
              <Mic size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Wake Phrase</h2>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wake-phrase">Custom wake phrase</Label>
              <Input
                id="wake-phrase"
                value={settings.wakePhrase}
                onChange={(e) => updateSettings({ wakePhrase: e.target.value })}
                placeholder="Hey Voice"
              />
            </div>
          </div>

          {/* Voice Feedback */}
          <div className="settings-card">
            <div className="flex items-center gap-3 mb-4">
              <Volume2 size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Voice Feedback</h2>
            </div>
            <div className="space-y-2">
              <Label>Voice type</Label>
              <Select
                value={settings.voiceFeedback}
                onValueChange={(value: 'male' | 'female' | 'none') =>
                  updateSettings({ voiceFeedback: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sensitivity */}
          <div className="settings-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <h2 className="text-lg font-semibold">Sensitivity</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Microphone sensitivity</Label>
                <span className="text-primary font-medium">{settings.sensitivity}/10</span>
              </div>
              <Slider
                value={[settings.sensitivity]}
                onValueChange={([value]) => updateSettings({ sensitivity: value })}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>

          {/* Reset Permissions */}
          <div className="settings-card">
            <div className="flex items-center gap-3 mb-4">
              <RotateCcw size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Reset Permissions</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Reset microphone and other app permissions to default settings.
            </p>
            <Button onClick={handleResetPermissions} variant="outline" className="w-full">
              Reset All Permissions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
