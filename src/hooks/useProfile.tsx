import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/integrations/firebase/client';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  preferred_mode: 'personal' | 'professional';
  voice_feedback_enabled: boolean;
  wake_phrase: string;
  microphone_sensitivity: number;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const ref = doc(db, 'profiles', user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        const now = new Date().toISOString();
        const defaultProfile: UserProfile = {
          id: user.uid,
          user_id: user.uid,
          display_name: user.displayName ?? user.email ?? null,
          preferred_mode: 'personal',
          voice_feedback_enabled: true,
          wake_phrase: 'Hey SpeakEasy',
          microphone_sensitivity: 0.5,
          created_at: now,
          updated_at: now,
        };

        await setDoc(ref, {
          ...defaultProfile,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });

        setProfile(defaultProfile);
        return;
      }

      const data = snap.data() as any;
      setProfile({
        id: data.id ?? user.uid,
        user_id: data.user_id ?? user.uid,
        display_name: data.display_name ?? null,
        preferred_mode: data.preferred_mode ?? 'personal',
        voice_feedback_enabled: data.voice_feedback_enabled ?? true,
        wake_phrase: data.wake_phrase ?? 'Hey SpeakEasy',
        microphone_sensitivity: data.microphone_sensitivity ?? 0.5,
        created_at: data.created_at?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
        updated_at: data.updated_at?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return { error: new Error('No user or profile found') };

    try {
      const ref = doc(db, 'profiles', user.uid);
      await updateDoc(ref, {
        ...updates,
        updated_at: serverTimestamp(),
      } as any);

      const merged = { ...profile, ...updates, updated_at: new Date().toISOString() };
      setProfile(merged);
      return { data: merged, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: error as Error };
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
  };
};