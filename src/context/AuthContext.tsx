import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
  signIn: (identifier: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (username: string, email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
}

const STALE_LOCAL_KEY = "shipnest_auth_session";

const friendlyError = (message?: string): Error => {
  const msg = (message || "").toLowerCase();
  if (msg.includes("invalid login credentials")) {
    return new Error("Wrong email/username or password. Please try again.");
  }
  if (msg.includes("already registered") || msg.includes("already exists")) {
    return new Error("An account with this email already exists. Please sign in instead.");
  }
  if (msg.includes("username") && msg.includes("taken")) {
    return new Error("That username is taken. Please choose another.");
  }
  if (msg.includes("rate limit")) {
    return new Error("Too many attempts. Please wait a moment and try again.");
  }
  if (msg.includes("network") || msg.includes("fetch") || msg.includes("failed to fetch")) {
    return new Error("Network problem — please check your connection and try again.");
  }
  return new Error(message || "Something went wrong. Please try again.");
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Remove stale fake/local sessions from the older demo login
    try {
      localStorage.removeItem(STALE_LOCAL_KEY);
    } catch (e) {}

    // Fail-safe so the UI never hangs on a slow network
    const safetyTimer = setTimeout(() => {
      if (active) setLoading(false);
    }, 4000);

    try {
      const { data } = supabase.auth.onAuthStateChange((_e, s) => {
        if (!active) return;
        setSession(s);
        setUser(s?.user ?? null);
      });

      supabase.auth
        .getSession()
        .then(({ data: { session: s } }) => {
          if (!active) return;
          setSession(s);
          setUser(s?.user ?? null);
          setLoading(false);
        })
        .catch(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
        clearTimeout(safetyTimer);
        data?.subscription?.unsubscribe();
      };
    } catch (err) {
      if (active) setLoading(false);
      return () => {
        active = false;
        clearTimeout(safetyTimer);
      };
    }
  }, []);

  const signIn = async (identifier: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error("Sign-in is temporarily unavailable. Please try again shortly.") };
    }
    try {
      let email = identifier.trim();
      // Usernames are resolved to the account email server-side before sign-in
      if (!email.includes("@")) {
        const { data: resolved, error: rpcError } = await supabase.rpc("resolve_login_identifier", {
          identifier: email,
        });
        if (rpcError || !resolved || resolved.length === 0 || !resolved[0]?.email) {
          return { error: new Error("No account found with that username or email.") };
        }
        email = resolved[0].email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: friendlyError(error.message) };
      if (data.session && data.user) {
        setUser(data.user);
        setSession(data.session);
      }
      return { error: null };
    } catch (e: any) {
      return { error: friendlyError(e?.message) };
    }
  };

  const signUp = async (username: string, email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error("Sign-up is temporarily unavailable. Please try again shortly.") };
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/account`,
          data: {
            full_name: fullName.trim(),
            username: username.trim(),
          },
        },
      });
      if (error) return { error: friendlyError(error.message) };
      if (data.session && data.user) {
        setUser(data.user);
        setSession(data.session);
        return { error: null };
      }
      // Without auto-confirm the account exists but is not signed in yet
      return { error: new Error("Account created. Please sign in with your email or username.") };
    } catch (e: any) {
      return { error: friendlyError(e?.message) };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        signOut,
        signIn,
        signUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
