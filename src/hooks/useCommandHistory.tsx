import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/integrations/firebase/client';
import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';

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
      const q = query(
        collection(db, 'command_history'),
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc'),
        limit(100)
      );
      const snap = await getDocs(q);
      setHistory(
        snap.docs.map((d) => {
          const data: any = d.data();
          return {
            id: d.id,
            user_id: data.user_id ?? user.uid,
            command_text: data.command_text ?? '',
            action_performed: data.action_performed ?? '',
            context_mode: data.context_mode ?? null,
            success: !!data.success,
            response_time_ms: data.response_time_ms ?? null,
            created_at: data.created_at?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
          };
        })
      );
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const addHistoryEntry = async (entry: Omit<CommandHistory, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: new Error('No user found') };

    try {
      const docRef = await addDoc(collection(db, 'command_history'), {
        ...entry,
        user_id: user.uid,
        created_at: serverTimestamp(),
      });

      const created: CommandHistory = {
        id: docRef.id,
        user_id: user.uid,
        command_text: entry.command_text,
        action_performed: entry.action_performed,
        context_mode: entry.context_mode,
        success: entry.success,
        response_time_ms: entry.response_time_ms,
        created_at: new Date().toISOString(),
      };

      setHistory((prev) => [created, ...prev.slice(0, 99)]);
      return { data: created, error: null };
    } catch (error) {
      console.error('Error adding history entry:', error);
      return { error: error as Error };
    }
  };

  const clearHistory = async () => {
    if (!user) return { error: new Error('No user found') };

    try {
      const q = query(collection(db, 'command_history'), where('user_id', '==', user.uid));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();

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