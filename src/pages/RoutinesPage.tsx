import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Repeat, Plus, Trash2 } from 'lucide-react';

interface RoutineStep {
  id: string;
  command: string;
  action: string;
  targetApp: string;
}

interface Routine {
  id: string;
  title: string;
  steps: RoutineStep[];
}

const RoutinesPage = () => {
  const [routines, setRoutines] = useState<Routine[]>([
    {
      id: '1',
      title: 'Morning Routine',
      steps: [
        { id: '1', command: 'Good morning', action: 'open', targetApp: 'Calendar' },
        { id: '2', command: 'Check weather', action: 'launch', targetApp: 'Weather' },
      ],
    },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newRoutine, setNewRoutine] = useState<Partial<Routine>>({
    title: '',
    steps: [],
  });

  const addStep = () => {
    const newStep: RoutineStep = {
      id: Date.now().toString(),
      command: '',
      action: 'open',
      targetApp: '',
    };
    setNewRoutine(prev => ({
      ...prev,
      steps: [...(prev.steps || []), newStep],
    }));
  };

  const updateStep = (stepId: string, field: keyof RoutineStep, value: string) => {
    setNewRoutine(prev => ({
      ...prev,
      steps: prev.steps?.map(step =>
        step.id === stepId ? { ...step, [field]: value } : step
      ),
    }));
  };

  const removeStep = (stepId: string) => {
    setNewRoutine(prev => ({
      ...prev,
      steps: prev.steps?.filter(step => step.id !== stepId),
    }));
  };

  const saveRoutine = () => {
    if (newRoutine.title && newRoutine.steps?.length) {
      const routine: Routine = {
        id: Date.now().toString(),
        title: newRoutine.title,
        steps: newRoutine.steps,
      };
      setRoutines(prev => [...prev, routine]);
      setNewRoutine({ title: '', steps: [] });
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Repeat size={28} className="text-primary" />
            <h1 className="text-3xl font-bold">Routines</h1>
          </div>
          <Button onClick={() => setIsCreating(true)} size="sm">
            <Plus size={16} className="mr-2" />
            New
          </Button>
        </div>

        {/* Existing Routines */}
        <div className="space-y-4 mb-8">
          {routines.map((routine) => (
            <Card key={routine.id} className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">{routine.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {routine.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground">"{step.command}"</span>
                      <span>→</span>
                      <span className="text-primary">{step.action} {step.targetApp}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create New Routine */}
        {isCreating && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Create New Routine</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Routine Title</Label>
                <Input
                  id="title"
                  value={newRoutine.title || ''}
                  onChange={(e) => setNewRoutine(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter routine name"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Steps</Label>
                  <Button onClick={addStep} size="sm" variant="outline">
                    <Plus size={16} className="mr-2" />
                    Add Step
                  </Button>
                </div>

                {newRoutine.steps?.map((step, index) => (
                  <div key={step.id} className="space-y-3 p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Step {index + 1}</span>
                      <Button
                        onClick={() => removeStep(step.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Command</Label>
                      <Input
                        value={step.command}
                        onChange={(e) => updateStep(step.id, 'command', e.target.value)}
                        placeholder="What to say"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Action</Label>
                        <Select
                          value={step.action}
                          onValueChange={(value) => updateStep(step.id, 'action', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="launch">Launch</SelectItem>
                            <SelectItem value="close">Close</SelectItem>
                            <SelectItem value="switch">Switch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Target App</Label>
                        <Input
                          value={step.targetApp}
                          onChange={(e) => updateStep(step.id, 'targetApp', e.target.value)}
                          placeholder="App name"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={saveRoutine} className="flex-1">
                  Save Routine
                </Button>
                <Button
                  onClick={() => setIsCreating(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RoutinesPage;
