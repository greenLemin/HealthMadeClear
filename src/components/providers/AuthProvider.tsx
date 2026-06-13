"use client";

import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "@/i18n/navigation";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const supabaseRef = useRef<SupabaseClient | null>(null);

  useEffect(() => {
    const initSupabase = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      supabaseRef.current = createClient();
      setHydrated(true);
    };
    initSupabase();
  }, []);

  useEffect(() => {
    if (!hydrated || !supabaseRef.current) return;
    const supabase = supabaseRef.current;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [hydrated]);

  const signOut = useCallback(async () => {
    if (!supabaseRef.current) return;
    await supabaseRef.current.auth.signOut();
    router.push("/");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, session, loading, signOut }),
    [user, session, loading, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
