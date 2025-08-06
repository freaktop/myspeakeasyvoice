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

export interface CommandHistory {
  id: string;
  user_id: string;
  command_text: string;
  action_performed: string;
  context_mode: string | null;
  success: boolean;
  response_time_ms: number | null;
  created_at: string;
}

export const useVoiceCommands = () => {
  const { user } = useAuth();
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCommands();
      fetchHistory();
    } else {
      setCommands([]);
      setHistory([]);
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching commands:', error);
        return;
      }

      setCommands((data as VoiceCommand[]) || []);
    } catch (error) {
      console.error('Error fetching commands:', error);
    }
  };

  const fetchHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('command_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching history:', error);
        return;
      }

      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
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

  const logCommandExecution = async (
    commandText: string,
    actionPerformed: string,
    contextMode?: string,
    success: boolean = true,
    responseTimeMs?: number
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('command_history')
        .insert({
          user_id: user.id,
          command_text: commandText,
          action_performed: actionPerformed,
          context_mode: contextMode,
          success,
          response_time_ms: responseTimeMs,
        })
        .select()
        .single();

      if (error) {
        console.error('Error logging command:', error);
        return;
      }

      setHistory(prev => [data, ...prev.slice(0, 49)]);
    } catch (error) {
      console.error('Error logging command:', error);
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

  return {
    commands,
    history,
    loading,
    addCommand,
    updateCommand,
    deleteCommand,
    logCommandExecution,
    refetch: () => {
      fetchCommands();
      fetchHistory();
    },
  };
};