import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User as UserIcon,
  AtSign,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  PackageCheck,
  Loader2,
} from "lucide-react";

const shipnestLogoWhite = "/assets/brand/shipnest-logo-white.png";

const AUTH_ASSETS = [
  "/assets/products/apple/iphone-18-pro-hero.jpg",
  "/assets/products/apple/iphone-duo-display.jpg",
  "/assets/products/apple/iphone-air.jpg",
];

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/account", { replace: true });
    }
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        if (!email || !password || !username) return;
        const res = await signUp(username, email, password, fullName || username);
        if (res.error) {
          toast.error(res.error.message);
          return;
        }
        toast.success("Account created. Welcome to ShipNest!");
        navigate("/account", { replace: true });
      } else {
        if (!identifier || !password) return;
        const res = await signIn(identifier, password);
        if (res.error) {
          toast.error(res.error.message);
          return;
        }
        toast.success("Signed in. Welcome back!");
        navigate("/account", { replace: true });
      }
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const input =
    "w-full bg-background border border-border rounded-xl pl-11 pr-11 py-3.5 text-foreground text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand Panel */}
      <aside
        className="relative overflow-hidden px-6 sm:px-12 pt-10 pb-14 lg:py-16 flex flex-col"
        style={{ background: "linear-gradient(160deg, hsl(var(--brand-ink)) 0%, hsl(213 70% 16%) 100%)" }}
      >
        <div
          aria-hidden
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "hsl(var(--brand))" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: "hsl(var(--primary-glow))" }}
        />

        <div className="relative flex items-center justify-between">
          <Link to="/" aria-label="ShipNest home" className="inline-flex items-center">
            <img src={shipnestLogoWhite} alt="ShipNest" className="h-9 sm:h-10 w-auto select-none" draggable={false} />
          </Link>
          <Link to="/" className="lg:hidden inline-flex items-center gap-1 text-[12px] text-white/60 hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" /> Store
          </Link>
        </div>

        <div className="relative my-auto py-10 lg:py-16 max-w-lg space-y-6 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold tracking-wider uppercase text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authorized Global Electronics Retail</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.08]">
            Track every order.
            <br />
            <span className="text-white/60 font-normal">Direct from factory to doorstep.</span>
          </h2>

          <p className="text-white/70 text-[14px] sm:text-[15px] leading-relaxed max-w-md">
            One account for all your orders — sign in with your username or email and your shipments,
            delivery PINs and serial numbers follow you everywhere.
          </p>

          {/* Floating Product Preview Cards */}
          <div className="hidden sm:grid grid-cols-3 gap-3 pt-4">
            {AUTH_ASSETS.map((src, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="aspect-square rounded-2xl bg-white/5 border border-white/10 p-2.5 backdrop-blur-sm flex items-center justify-center overflow-hidden"
              >
                <img src={src} alt="Preview" className="w-full h-full object-contain" />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
          <span>Global Air Logistics Network</span>
          <span className="flex items-center gap-1.5 text-white/70">
            <PackageCheck className="w-3.5 h-3.5 text-emerald-400" /> Tamper-evident sealed boxes
          </span>
        </div>
      </aside>

      {/* Auth Form Panel */}
      <main className="flex items-center justify-center px-6 sm:px-12 py-12 lg:py-20">
        <div className="w-full max-w-md space-y-6">
          <div className="hidden lg:block">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to store
            </Link>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {mode === "signin" ? "Sign in to ShipNest" : "Create an account"}
            </h1>
            <p className="text-[13px] text-muted-foreground mt-1">
              {mode === "signin"
                ? "Use your username or email — your orders stay in sync on every device."
                : "Pick a username, add your email and a password. You're in instantly."}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            {mode === "signup" ? (
              <>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    className={input}
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    className={`${input} pr-24`}
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                    autoComplete="username"
                    required
                    minLength={3}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground/70 select-none">
                    @shipnest
                  </span>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    className={input}
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </>
            ) : (
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  className={input}
                  placeholder="Email or username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className={input}
                type={showPassword ? "text" : "password"}
                placeholder={mode === "signup" ? "Create password (min. 6 characters)" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-[14px] hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-60 shadow-sm flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Please wait…</span>
                </>
              ) : mode === "signin" ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="text-center text-[13px] text-muted-foreground">
            {mode === "signin" ? "New to ShipNest? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-primary hover:underline font-semibold"
            >
              {mode === "signin" ? "Create one" : "Sign in instead"}
            </button>
          </p>

          <div className="pt-6 border-t border-border text-center space-y-2">
            <p className="text-[11.5px] text-muted-foreground">
              Just want to follow one parcel?{" "}
              <Link to="/track" className="text-foreground font-semibold hover:underline">
                Track by ID
              </Link>{" "}
              — no account needed.
            </p>
            <p className="text-[11px] text-muted-foreground/70">
              By continuing you agree to our{" "}
              <Link to="/terms" className="hover:text-foreground underline underline-offset-2">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="hover:text-foreground underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
