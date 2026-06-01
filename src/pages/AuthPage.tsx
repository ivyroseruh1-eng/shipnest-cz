import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Mail, Lock, User as UserIcon, ArrowLeft } from "lucide-react";

const AuthPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) navigate("/account"); }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/account`, data: { full_name: fullName } },
        });
        if (error) throw error;
        toast.success("Account created. You're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      }
      navigate("/account");
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally { setBusy(false); }
  };

  const google = async () => {
    setBusy(true);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/account" });
    if (r.error) { toast.error("Google sign-in failed"); setBusy(false); }
  };

  const input = "w-full bg-background border border-border rounded-lg pl-10 pr-3 py-3 text-foreground text-[14px] focus:outline-none focus:ring-1 focus:ring-primary/40";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link to="/" className="inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground"><ArrowLeft className="w-3 h-3" /> Back to store</Link>
        <div className="text-center space-y-1">
          <h1 className="display text-3xl text-foreground">{mode === "signin" ? "Sign in" : "Create account"}</h1>
          <p className="text-[13px] text-muted-foreground">Track every order from one place.</p>
        </div>

        <button onClick={google} disabled={busy}
          className="w-full flex items-center justify-center gap-2 border border-border bg-background hover:bg-secondary py-3 rounded-full text-[14px] font-medium transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8a12 12 0 110-24c3 0 5.7 1.1 7.8 3l5.7-5.7C33.8 6.1 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.7 1.1 7.8 3l5.7-5.7C33.8 6.1 29.2 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.1 0 9.7-2 13.2-5.2l-6.1-5c-2 1.4-4.5 2.2-7.1 2.2-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2.1-2 4-3.7 5.4l6.1 5c-.4.4 6.6-4.8 6.6-14.4 0-1.3-.1-2.4-.7-3.5z"/></svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <div className="flex-1 h-px bg-border" /> OR <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input className={input} placeholder="Full name" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input className={input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input className={input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <button disabled={busy} className="w-full bg-primary text-primary-foreground py-3 rounded-full font-medium text-[14px] hover:bg-primary/90 transition-colors disabled:opacity-60">
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="text-center text-[13px] text-muted-foreground">
          {mode === "signin" ? "New to ShipNest? " : "Already have an account? "}
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary hover:underline font-medium">
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;