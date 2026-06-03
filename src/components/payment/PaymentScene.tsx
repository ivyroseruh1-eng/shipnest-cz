import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Lock, Shield, CheckCircle2, Building2 } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { Visa, Mastercard, Amex } from "@/components/PaymentIcons";
import moonlightLogo from "@/assets/moonlight-logo.png";

type Brand = "visa" | "mc" | "amex" | "unknown";
type Method = "card" | "moonlight";

interface Props {
  total: number;
  method: Method;
  brand: Brand;
  cardLast4?: string;
  issuer: string; // detected/random bank or "Moonlight Treasury"
  network: string;
  authCode: string;
  refCode: string;
  onDone: () => void;
  durationMs?: number;
}

const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const PaymentScene = ({ total, method, brand, cardLast4 = "4242", issuer, network, authCode, refCode, onDone, durationMs = 4200 }: Props) => {
  // act: 0 = handshake, 1 = bank auth, 2 = approved
  const [act, setAct] = useState(0);
  const [chips, setChips] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    if (reduced) {
      const t1 = setTimeout(() => setAct(1), 500);
      const t2 = setTimeout(() => { setChips([true, true, true]); setAct(2); }, 1200);
      const t3 = setTimeout(onDone, 1800);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
    const ts: ReturnType<typeof setTimeout>[] = [];
    ts.push(setTimeout(() => setAct(1), 1000));
    ts.push(setTimeout(() => setChips([true, false, false]), 1500));
    ts.push(setTimeout(() => setChips([true, true, false]), 2100));
    ts.push(setTimeout(() => setChips([true, true, true]), 2700));
    ts.push(setTimeout(() => setAct(2), 2900));
    ts.push(setTimeout(onDone, durationMs));
    return () => ts.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const captions = [
    method === "moonlight" ? "Establishing private treasury session" : `Establishing secure session with ${network}`,
    method === "moonlight" ? "Verifying mandate with Moonlight Treasury" : `Verifying with ${issuer}`,
    method === "moonlight" ? "Authorized by Moonlight Wealth Management" : "Approved · Funds reserved",
  ];

  const chipLabels = method === "moonlight"
    ? ["Mandate", "Beneficiary", "Escrow"]
    : ["3-D Secure", "Risk score", "Authorization"];

  const BrandIcon = () => {
    if (method === "moonlight") return <img src={moonlightLogo} alt="" className="w-6 h-6 object-contain" />;
    if (brand === "visa") return <Visa />;
    if (brand === "mc") return <Mastercard />;
    if (brand === "amex") return <Amex />;
    return <CreditCard className="w-5 h-5 text-primary" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl flex items-center justify-center px-4"
      role="dialog" aria-modal="true" aria-live="polite" aria-label="Processing payment"
    >
      <motion.div
        initial={{ y: 16, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Top hairline progress */}
        <div className="relative h-0.5 bg-secondary">
          <motion.div
            className="absolute inset-y-0 left-0 bg-primary"
            initial={{ width: "0%" }} animate={{ width: "100%" }}
            transition={{ duration: durationMs / 1000, ease: "easeInOut" }}
          />
        </div>

        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo variant="mark" size={26} linkTo={false} />
            <div>
              <p className="text-[13px] font-semibold text-foreground leading-tight">Secure authorization</p>
              <p className="text-[10px] text-muted-foreground font-mono tracking-wider uppercase">{method === "moonlight" ? "Moonlight Treasury" : network}</p>
            </div>
          </div>
          <p className="text-[15px] font-semibold text-foreground tabular-nums">${total.toFixed(2)}</p>
        </div>

        {/* Stage area — fixed height to prevent layout shifts */}
        <div className="relative h-[260px] px-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {act === 0 && (
              <motion.div key="act0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                className="flex flex-col items-center gap-5 w-full">
                <div className="flex items-center justify-between w-full max-w-[280px]">
                  {/* Card / Moonlight tile */}
                  <motion.div
                    initial={{ x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    className="w-20 h-12 rounded-lg bg-gradient-to-br from-foreground to-foreground/80 flex items-center justify-center shadow-lg"
                  >
                    <div className="text-background"><BrandIcon /></div>
                  </motion.div>

                  {/* Animated dotted line + moving padlock */}
                  <div className="flex-1 relative h-6 mx-2">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-border" />
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow"
                      initial={{ left: "0%" }} animate={{ left: "calc(100% - 20px)" }}
                      transition={{ duration: 0.9, ease: "easeInOut" }}
                    >
                      <Lock className="w-2.5 h-2.5" />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ x: 12, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"
                  >
                    <Logo variant="mark" size={28} linkTo={false} />
                  </motion.div>
                </div>
                <p className="text-[13px] text-foreground font-medium text-center">{captions[0]}</p>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-secondary text-[10px] font-mono text-muted-foreground">
                  <Shield className="w-3 h-3 text-success" /> TLS 1.3 · AES-256
                </div>
              </motion.div>
            )}

            {act === 1 && (
              <motion.div key="act1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
                className="flex flex-col items-center gap-4 w-full">
                <div className="relative">
                  {/* circular progress ring */}
                  <svg width="120" height="120" className="-rotate-90">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
                    <motion.circle
                      cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round"
                      pathLength={1}
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 1.6, ease: "easeInOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center mb-1">
                      {method === "moonlight" ? <img src={moonlightLogo} alt="" className="w-5 h-5" /> : <Building2 className="w-5 h-5 text-primary" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Issuer</p>
                  </div>
                </div>

                <div className="text-center space-y-0.5">
                  <p className="text-[13px] font-semibold text-foreground">{issuer}</p>
                  {method === "card" && <p className="text-[11px] font-mono text-muted-foreground tracking-wider">•••• •••• •••• {cardLast4}</p>}
                  <p className="text-[12px] text-foreground mt-1">{captions[1]}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  {chipLabels.map((label, i) => (
                    <motion.span
                      key={label}
                      animate={chips[i] ? { backgroundColor: "hsl(var(--success) / 0.12)", color: "hsl(var(--success))" } : {}}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-border bg-secondary text-muted-foreground"
                    >
                      {chips[i] && <CheckCircle2 className="w-2.5 h-2.5" />}
                      {label}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {act === 2 && (
              <motion.div key="act2" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 w-full">
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 280, damping: 14 }}
                    className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-9 h-9 text-success" strokeWidth={2.2} />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-success"
                    initial={{ scale: 1, opacity: 0.7 }} animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                </div>
                <p className="text-[15px] font-semibold text-foreground">{captions[2]}</p>
                <p className="text-[11px] font-mono text-muted-foreground tracking-wider">AUTH {authCode} · REF {refCode}</p>
                {method === "moonlight" && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground text-background text-[10px] font-semibold uppercase tracking-wider">
                    <img src={moonlightLogo} alt="" className="w-3 h-3" /> Moonlight Authorized
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Shield className="w-3 h-3 text-success" />
            PCI-DSS · TLS 1.3 · 256-bit AES
          </div>
          <div className="flex items-center gap-1">
            {method === "card" ? (<><Visa /><Mastercard /><Amex /></>) : <img src={moonlightLogo} alt="Moonlight" className="w-5 h-5 object-contain" />}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentScene;