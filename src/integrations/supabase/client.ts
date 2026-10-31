import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { brokeredPreviewStorage } from "./previewAuthStorage";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

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
        error: new Error("Authentication requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to be set in your hosting provider's dashboard."),
      }),
      signUp: async () => ({
        data: null,
        error: new Error("Account creation requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to be set in your hosting provider's dashboard."),
      }),
      signInWithOAuth: async () => ({
        data: null,
        error: new Error("OAuth requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to be set in your hosting provider's dashboard."),
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