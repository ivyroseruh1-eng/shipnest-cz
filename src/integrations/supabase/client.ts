import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { brokeredPreviewStorage } from "./previewAuthStorage";

const DEFAULT_SUPABASE_URL = "https://juklayjdeotznvrcyngv.supabase.co";
const DEFAULT_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a2xheWpkZW90em52cmN5bmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2ODU2MDcsImV4cCI6MjA5MDI2MTYwN30.J5es3MkNO6tu7LhqRwUSDq4m29Gj92huzgj-95pw6VI";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_KEY;

export const isSupabaseConfigured: boolean = Boolean(
  SUPABASE_URL &&
  SUPABASE_PUBLISHABLE_KEY &&
  typeof SUPABASE_URL === "string" &&
  SUPABASE_URL.startsWith("http") &&
  !SUPABASE_URL.includes("your-project")
);

// Fallback mock client so that missing hosting credentials never crash the frontend into a blank screen
const createMockClient = () => {
  return {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async () => ({
        data: null,
        error: null,
      }),
      signUp: async () => ({
        data: null,
        error: null,
      }),
      signInWithOAuth: async () => ({
        data: null,
        error: null,
      }),
    },
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
        eq: () => Promise.resolve({ data: [], error: null }),
        then: (fn: any) => Promise.resolve({ data: [], error: null }).then(fn),
      }),
      insert: async () => ({ data: null, error: new Error("Database offline fallback") }),
      update: () => ({
        eq: async () => ({ data: null, error: null }),
      }),
      delete: () => ({
        eq: async () => ({ data: null, error: null }),
      }),
    }),
  } as unknown as ReturnType<typeof createClient<Database>>;
};

export const supabase = isSupabaseConfigured
  ? createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: brokeredPreviewStorage(),
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createMockClient();
