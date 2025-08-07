import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Mic, Settings, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const RoutinesPage = () => {
  const { commands, loading, addCommand, updateCommand, deleteCommand } = useVoiceCommands();
  const [isAddingCommand, setIsAddingCommand] = useState(false);
  const [editingCommand, setEditingCommand] = useState<any>(null);
  const [newCommand, setNewCommand] = useState({
    command_phrase: '',
    action_type: 'app_open',
    action_data: {},
    context_mode: 'both' as 'personal' | 'professional' | 'both',
    is_active: true,
  });

  const actionTypes = [
    { value: 'app_open', label: 'Open App' },
    { value: 'system_action', label: 'System Action' },
    { value: 'text_input', label: 'Text Input' },
    { value: 'navigation', label: 'Navigation' },
    { value: 'custom', label: 'Custom Action' },
  ];

  const handleAddCommand = async () => {
    if (!newCommand.command_phrase.trim()) {
      toast.error('Command phrase is required');
      return;
    }

    const { error } = await addCommand(newCommand);
    if (error) {
      toast.error('Failed to add command');
    } else {
      toast.success('Command added successfully');
      setIsAddingCommand(false);
      setNewCommand({
        command_phrase: '',
        action_type: 'app_open',
        action_data: {},
        context_mode: 'both',
        is_active: true,
      });
    }
  };

  const handleUpdateCommand = async () => {
    if (!editingCommand) return;

    const { error } = await updateCommand(editingCommand.id, editingCommand);
    if (error) {
      toast.error('Failed to update command');
    } else {
      toast.success('Command updated successfully');
      setEditingCommand(null);
    }
  };

  const handleDeleteCommand = async (id: string) => {
    const { error } = await deleteCommand(id);
    if (error) {
      toast.error('Failed to delete command');
    } else {
      toast.success('Command deleted successfully');
    }
  };

  const toggleCommandActive = async (command: any) => {
    const { error } = await updateCommand(command.id, { is_active: !command.is_active });
    if (error) {
      toast.error('Failed to update command status');
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Voice Commands</h1>
        <Dialog open={isAddingCommand} onOpenChange={setIsAddingCommand}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Command
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Voice Command</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="command-phrase">Command Phrase</Label>
                <Input
                  id="command-phrase"
                  value={newCommand.command_phrase}
                  onChange={(e) => setNewCommand({ ...newCommand, command_phrase: e.target.value })}
                  placeholder="e.g., Open Instagram"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="action-type">Action Type</Label>
                <Select
                  value={newCommand.action_type}
                  onValueChange={(value) => setNewCommand({ ...newCommand, action_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="context-mode">Context Mode</Label>
                <Select
                  value={newCommand.context_mode}
                  onValueChange={(value: any) => setNewCommand({ ...newCommand, context_mode: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingCommand(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCommand}>Add Command</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {commands.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Mic className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Voice Commands</h3>
            <p className="text-muted-foreground mb-4">
              Create your first voice command to get started with hands-free control.
            </p>
            <Button onClick={() => setIsAddingCommand(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Command
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {commands.map((command) => (
            <Card key={command.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">"{command.command_phrase}"</h3>
                      <Badge variant={command.is_active ? 'default' : 'secondary'}>
                        {command.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{command.context_mode}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Action: {actionTypes.find(t => t.value === command.action_type)?.label || command.action_type}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        Used {command.usage_count} times
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={command.is_active}
                      onCheckedChange={() => toggleCommandActive(command)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCommand(command)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Command</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{command.command_phrase}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCommand(command.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Command Dialog */}
      <Dialog open={!!editingCommand} onOpenChange={() => setEditingCommand(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Voice Command</DialogTitle>
          </DialogHeader>
          {editingCommand && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-command-phrase">Command Phrase</Label>
                <Input
                  id="edit-command-phrase"
                  value={editingCommand.command_phrase}
                  onChange={(e) => setEditingCommand({ ...editingCommand, command_phrase: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-action-type">Action Type</Label>
                <Select
                  value={editingCommand.action_type}
                  onValueChange={(value) => setEditingCommand({ ...editingCommand, action_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-context-mode">Context Mode</Label>
                <Select
                  value={editingCommand.context_mode}
                  onValueChange={(value) => setEditingCommand({ ...editingCommand, context_mode: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingCommand(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateCommand}>Update Command</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoutinesPage;
