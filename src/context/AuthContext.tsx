import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Fail-safe: auth check MUST NOT block the initial page render for more than 1.2 seconds
    const safetyTimer = setTimeout(() => {
      if (active) setLoading(false);
    }, 1200);

    try {
      const { data } = supabase.auth.onAuthStateChange((_e, s) => {
        if (!active) return;
        setSession(s);
        setUser(s?.user ?? null);
      });

      supabase.auth.getSession()
        .then(({ data: { session: s } }) => {
          if (!active) return;
          setSession(s);
          setUser(s?.user ?? null);
          setLoading(false);
        })
        .catch((err) => {
          console.warn("ShipNest: Supabase session check deferred:", err);
          if (active) setLoading(false);
        });

      return () => {
        active = false;
        clearTimeout(safetyTimer);
        data?.subscription?.unsubscribe();
      };
    } catch (err) {
      console.warn("ShipNest: Auth listener bypassed:", err);
      if (active) setLoading(false);
      return () => {
        active = false;
        clearTimeout(safetyTimer);
      };
    }
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Sign out local only:", e);
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isConfigured: isSupabaseConfigured, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};