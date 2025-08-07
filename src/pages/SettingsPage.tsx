
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { LogOut, User, Mic, Shield, Bell } from 'lucide-react';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async (updates: any) => {
    setSaving(true);
    const { error } = await updateProfile(updates);
    if (error) {
      toast.error('Failed to update settings');
    } else {
      toast.success('Settings updated successfully');
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              value={profile?.display_name || ''}
              onChange={(e) => handleUpdateProfile({ display_name: e.target.value })}
              placeholder="Enter your display name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user?.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed from this interface
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferred-mode">Preferred Mode</Label>
            <Select
              value={profile?.preferred_mode || 'personal'}
              onValueChange={(value) => handleUpdateProfile({ preferred_mode: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This affects which voice commands are available
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Voice Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Voice Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wake-phrase">Wake Phrase</Label>
            <Input
              id="wake-phrase"
              value={profile?.wake_phrase || ''}
              onChange={(e) => handleUpdateProfile({ wake_phrase: e.target.value })}
              placeholder="Hey SpeakEasy"
            />
            <p className="text-xs text-muted-foreground">
              The phrase that activates voice commands
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="microphone-sensitivity">
              Microphone Sensitivity: {Math.round((profile?.microphone_sensitivity || 0.8) * 100)}%
            </Label>
            <Slider
              id="microphone-sensitivity"
              min={0}
              max={1}
              step={0.1}
              value={[profile?.microphone_sensitivity || 0.8]}
              onValueChange={([value]) => handleUpdateProfile({ microphone_sensitivity: value })}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Higher values make the microphone more sensitive
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="voice-feedback">Voice Feedback</Label>
              <p className="text-xs text-muted-foreground">
                Get audio confirmation for commands
              </p>
            </div>
            <Switch
              id="voice-feedback"
              checked={profile?.voice_feedback_enabled || false}
              onCheckedChange={(checked) => handleUpdateProfile({ voice_feedback_enabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" asChild>
            <a href="/privacy" target="_blank">
              View Privacy Policy
            </a>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <a href="/terms" target="_blank">
              View Terms of Service
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign Out</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to sign out? You'll need to sign in again to access your voice commands.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSignOut}>Sign Out</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
