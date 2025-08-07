import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

export const useCommandHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setHistory([]);
      setLoading(false);
    }
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('command_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching history:', error);
        return;
      }

      setHistory(data as CommandHistory[]);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const addHistoryEntry = async (entry: Omit<CommandHistory, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: new Error('No user found') };

    try {
      const { data, error } = await supabase
        .from('command_history')
        .insert({
          ...entry,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding history entry:', error);
        return { error };
      }

      setHistory(prev => [data as CommandHistory, ...prev.slice(0, 99)]);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding history entry:', error);
      return { error: error as Error };
    }
  };

  const clearHistory = async () => {
    if (!user) return { error: new Error('No user found') };

    try {
      const { error } = await supabase
        .from('command_history')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing history:', error);
        return { error };
      }

      setHistory([]);
      return { error: null };
    } catch (error) {
      console.error('Error clearing history:', error);
      return { error: error as Error };
    }
  };

  return {
    history,
    loading,
    addHistoryEntry,
    clearHistory,
    refetch: fetchHistory,
  };
};