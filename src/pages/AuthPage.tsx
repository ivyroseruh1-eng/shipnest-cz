import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Mail, Lock, User as UserIcon, ArrowLeft, Eye, EyeOff, ShieldCheck, MapPin, PackageCheck } from "lucide-react";

const shipnestLogoWhite = "/assets/brand/shipnest-logo-white.png";
const shipnestMark = "/assets/brand/shipnest-mark.png";

const AUTH_ASSETS = [
  "/assets/products/apple/iphone-18-pro-hero.jpg",
  "/assets/products/apple/iphone-duo-display.jpg",
  "/assets/products/apple/iphone-air.jpg",
];

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, isConfigured } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { if (user) navigate("/account"); }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/account`, data: { full_name: fullName } },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Account created. You're signed in.");
          navigate("/account");
        } else {
          toast.info("Check your inbox to confirm your email, then sign in.");
          setMode("signin");
          setBusy(false);
        }
        return;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        navigate("/account");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
      setBusy(false);
    }
  };

  const input = "w-full bg-background border border-border rounded-xl pl-11 pr-11 py-3.5 text-foreground text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand Panel */}
      <aside className="relative overflow-hidden px-6 sm:px-12 pt-10 pb-14 lg:py-16 flex flex-col"
        style={{ background: "linear-gradient(160deg, hsl(var(--brand-ink)) 0%, hsl(213 70% 16%) 100%)" }}>
        <div aria-hidden className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "hsl(var(--brand))" }} />
        <div aria-hidden className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: "hsl(var(--primary-glow))" }} />

        <div className="relative flex items-center justify-between">
          <Link to="/" aria-label="ShipNest home" className="inline-flex items-center">
            <img src={shipnestLogoWhite} alt="ShipNest" className="h-9 sm:h-10 w-auto select-none" draggable={false} />
          </Link>
          <Link to="/" className="lg:hidden inline-flex items-center gap-1 text-[12px] text-white/60 hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" /> Store
          </Link>
        </div>

        <div className="relative max-w-lg mt-10 lg:my-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: "easeOut" }}
            className="space-y-4"
          >
            <h1 className="text-white text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.12]">
              Your order, tracked<br />to your doorstep.
            </h1>
            <p className="text-white/65 text-[15px] leading-relaxed">
              One account for every ShipNest order — live milestone updates, an insured route from our Prague hub, and a secure delivery PIN on arrival.
            </p>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
            className="space-y-4"
          >
            {[
              { icon: PackageCheck, title: "Order history in one place", text: "Every purchase you make is linked to your email automatically." },
              { icon: MapPin, title: "Live route to your city", text: "Follow each milestone from Prague to your doorstep." },
              { icon: ShieldCheck, title: "Insured & PIN-protected delivery", text: "Full-value transit insurance and a private handover PIN." },
            ].map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3.5">
                <span className="w-9 h-9 shrink-0 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-white" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-semibold text-white">{title}</span>
                  <span className="block text-[12.5px] text-white/55 leading-relaxed">{text}</span>
                </span>
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.24, ease: "easeOut" }}
            className="hidden sm:flex items-center gap-4"
          >
            {AUTH_ASSETS.map((src, i) => (
              <div key={src}
                className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl border border-white/10 bg-white/5 p-2 overflow-hidden"
                style={{ transform: `translateY(${i % 2 === 0 ? 0 : 12}px)` }}
              >
                <img src={src} alt="" className="w-full h-full object-contain" loading="lazy" draggable={false} />
              </div>
            ))}
            <p className="text-[11px] text-white/40 leading-snug max-w-[130px]">
              Genuine devices, dispatched within 24 hours.
            </p>
          </motion.div>
        </div>

        <p className="relative hidden lg:block text-[11px] text-white/35 mt-auto pt-10">
          © {new Date().getFullYear()} ShipNest s.r.o. · Prague, Czech Republic
        </p>
      </aside>

      {/* Form Panel */}
      <main className="flex-1 flex items-center justify-center px-5 sm:px-10 py-12 lg:py-16">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden flex justify-center mb-8">
            <img src={shipnestMark} alt="ShipNest" className="h-10 w-auto select-none" draggable={false} />
          </div>

          <div className="space-y-1.5 text-center">
            <h2 className="display text-[1.65rem] font-bold tracking-tight text-foreground">
              {mode === "signin" ? "Sign in to ShipNest" : "Create your account"}
            </h2>
            <p className="text-[13px] text-muted-foreground">
              {mode === "signin" ? "Track every order from one place." : "It takes less than a minute."}
            </p>
          </div>

          {!isConfigured && (
            <div className="mt-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs leading-relaxed space-y-1">
              <p className="font-semibold">Backend Authentication Notice</p>
              <p className="text-[11px] opacity-90">
                Supabase environment variables (<code className="font-mono">VITE_SUPABASE_URL</code> &amp; <code className="font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</code>) are not yet configured in your hosting dashboard. Add them to enable live user logins.
              </p>
            </div>
          )}

          {/* Mode tabs */}
          <div className="mt-8 grid grid-cols-2 gap-1 p-1 rounded-xl bg-secondary border border-border">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
                  mode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-3.5">
            {mode === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.25 }}
                className="relative"
              >
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input className={input} placeholder="Full name" autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </motion.div>
            )}
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input className={input} type="email" placeholder="Email address" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className={input}
                type={showPassword ? "text" : "password"}
                placeholder={mode === "signup" ? "Password (min. 6 characters)" : "Password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              disabled={busy}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-[14px] hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-60 shadow-sm"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-[13px] text-muted-foreground">
            {mode === "signin" ? "New to ShipNest? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-primary hover:underline font-semibold"
            >
              {mode === "signin" ? "Create one" : "Sign in instead"}
            </button>
          </p>

          <div className="mt-10 pt-6 border-t border-border text-center space-y-2">
            <p className="text-[11.5px] text-muted-foreground">
              Just want to follow one parcel?{" "}
              <Link to="/track" className="text-foreground font-semibold hover:underline">Track by ID</Link> — no account needed.
            </p>
            <p className="text-[11px] text-muted-foreground/70">
              By continuing you agree to our{" "}
              <Link to="/terms" className="hover:text-foreground underline underline-offset-2">Terms</Link> and{" "}
              <Link to="/privacy" className="hover:text-foreground underline underline-offset-2">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
