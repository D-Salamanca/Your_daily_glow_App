import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  type UserProfile,
} from "@/lib/firestore";

interface UseUserProfileReturn {
  profile:  UserProfile | null;
  loading:  boolean;
  error:    Error | null;
  update:   (data: Partial<Omit<UserProfile, "uid" | "createdAt">>) => Promise<void>;
  refresh:  () => Promise<void>;
}

export function useUserProfile(): UseUserProfileReturn {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!user) { setProfile(null); setLoading(false); return; }
    try {
      let p = await getUserProfile(user.uid);
      if (!p) {
        await createUserProfile(user);
        p = await getUserProfile(user.uid);
      }
      setProfile(p);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const update = useCallback(
    async (data: Partial<Omit<UserProfile, "uid" | "createdAt">>) => {
      if (!user) return;
      await updateUserProfile(user.uid, data);
      setProfile((prev) => (prev ? { ...prev, ...data } : prev));
    },
    [user]
  );

  return { profile, loading, error, update, refresh: load };
}
