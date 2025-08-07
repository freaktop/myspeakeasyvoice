import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface VoiceCommand {
  id: string;
  user_id: string;
  command_phrase: string;
  action_type: string;
  action_data: any;
  context_mode: 'personal' | 'professional' | 'both';
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export const useVoiceCommands = () => {
  const { user } = useAuth();
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCommands();
    } else {
      setCommands([]);
      setLoading(false);
    }
  }, [user]);

  const fetchCommands = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('voice_commands')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      if (error) {
        console.error('Error fetching commands:', error);
        return;
      }

      setCommands(data as VoiceCommand[]);
    } catch (error) {
      console.error('Error fetching commands:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCommand = async (command: Omit<VoiceCommand, 'id' | 'user_id' | 'usage_count' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('No user found') };

    try {
      const { data, error } = await supabase
        .from('voice_commands')
        .insert({
          ...command,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding command:', error);
        return { error };
      }

      setCommands(prev => [data as VoiceCommand, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding command:', error);
      return { error: error as Error };
    }
  };

  const updateCommand = async (id: string, updates: Partial<VoiceCommand>) => {
    if (!user) return { error: new Error('No user found') };

    try {
      const { data, error } = await supabase
        .from('voice_commands')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating command:', error);
        return { error };
      }

      setCommands(prev => prev.map(cmd => cmd.id === id ? data as VoiceCommand : cmd));
      return { data, error: null };
    } catch (error) {
      console.error('Error updating command:', error);
      return { error: error as Error };
    }
  };

  const deleteCommand = async (id: string) => {
    if (!user) return { error: new Error('No user found') };

    try {
      const { error } = await supabase
        .from('voice_commands')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting command:', error);
        return { error };
      }

      setCommands(prev => prev.filter(cmd => cmd.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting command:', error);
      return { error: error as Error };
    }
  };

  const incrementUsage = async (id: string) => {
    if (!user) return;

    try {
      const command = commands.find(cmd => cmd.id === id);
      if (!command) return;

      await supabase
        .from('voice_commands')
        .update({ usage_count: command.usage_count + 1 })
        .eq('id', id)
        .eq('user_id', user.id);

      setCommands(prev => prev.map(cmd => 
        cmd.id === id ? { ...cmd, usage_count: cmd.usage_count + 1 } : cmd
      ));
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  };

  return {
    commands,
    loading,
    addCommand,
    updateCommand,
    deleteCommand,
    incrementUsage,
    refetch: fetchCommands,
  };
};