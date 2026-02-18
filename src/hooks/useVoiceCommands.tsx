import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/integrations/firebase/client';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

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
      const q = query(
        collection(db, 'voice_commands'),
        where('user_id', '==', user.uid),
        where('is_active', '==', true),
        orderBy('usage_count', 'desc'),
        limit(200)
      );
      const snap = await getDocs(q);
      setCommands(
        snap.docs.map((d) => {
          const data: any = d.data();
          return {
            id: d.id,
            user_id: data.user_id ?? user.uid,
            command_phrase: data.command_phrase ?? '',
            action_type: data.action_type ?? '',
            action_data: data.action_data ?? null,
            context_mode: data.context_mode ?? 'both',
            is_active: data.is_active ?? true,
            usage_count: data.usage_count ?? 0,
            created_at: data.created_at?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
            updated_at: data.updated_at?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
          };
        })
      );
    } catch (error) {
      console.error('Error fetching commands:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCommand = async (command: Omit<VoiceCommand, 'id' | 'user_id' | 'usage_count' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('No user found') };

    try {
      const docRef = await addDoc(collection(db, 'voice_commands'), {
        ...command,
        user_id: user.uid,
        usage_count: 0,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      const created: VoiceCommand = {
        id: docRef.id,
        user_id: user.uid,
        command_phrase: command.command_phrase,
        action_type: command.action_type,
        action_data: command.action_data,
        context_mode: command.context_mode,
        is_active: command.is_active,
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setCommands((prev) => [created, ...prev]);
      return { data: created, error: null };
    } catch (error) {
      console.error('Error adding command:', error);
      return { error: error as Error };
    }
  };

  const updateCommand = async (id: string, updates: Partial<VoiceCommand>) => {
    if (!user) return { error: new Error('No user found') };

    try {
      const ref = doc(db, 'voice_commands', id);
      await updateDoc(ref, {
        ...updates,
        updated_at: serverTimestamp(),
      } as any);

      setCommands((prev) => prev.map((cmd) => (cmd.id === id ? { ...cmd, ...updates, updated_at: new Date().toISOString() } : cmd)));
      return { data: null, error: null };
    } catch (error) {
      console.error('Error updating command:', error);
      return { error: error as Error };
    }
  };

  const deleteCommand = async (id: string) => {
    if (!user) return { error: new Error('No user found') };

    try {
      await deleteDoc(doc(db, 'voice_commands', id));

      setCommands((prev) => prev.filter((cmd) => cmd.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting command:', error);
      return { error: error as Error };
    }
  };

  const incrementUsage = async (id: string) => {
    if (!user) return;

    try {
      const command = commands.find((cmd) => cmd.id === id);
      if (!command) return;

      await updateDoc(doc(db, 'voice_commands', id), {
        usage_count: increment(1),
        updated_at: serverTimestamp(),
      });

      setCommands((prev) => prev.map((cmd) => (cmd.id === id ? { ...cmd, usage_count: cmd.usage_count + 1 } : cmd)));
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