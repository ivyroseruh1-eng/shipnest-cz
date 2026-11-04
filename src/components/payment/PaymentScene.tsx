import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Shield, Lock, Wifi, AlertCircle } from "lucide-react";
import { Visa, Mastercard, Amex } from "@/components/PaymentIcons";

export type CardBrand = "visa" | "mc" | "amex" | "unknown";

interface PaymentSceneProps {
  total: number;
  cardName?: string;
  cardNumber?: string;
  cardLast4?: string;
  expiry?: string;
  brand?: CardBrand;
  network?: string;
  issuer?: string;
  authCode?: string;
  refCode?: string;
  onDone: () => void;
  onCancel?: () => void;
  durationMs?: number;
  isDeclined?: boolean;
}

export const PaymentScene: React.FC<PaymentSceneProps> = ({
  total,
  cardName = "ALEX VANCE",
  cardNumber = "",
  cardLast4,
  expiry = "12/28",
  brand = "visa",
  network = "VisaNet Global",
  issuer = "ShipNest Priority Settlement",
  authCode = "SN8921",
  refCode = "8492019",
  onDone,
  onCancel,
  durationMs = 4000,
  isDeclined = false,
}) => {
  // Animation stages:
  // 1: 3D Card Presentation & Positioning
  // 2: Glide Towards Contactless Terminal
  // 3: Contactless Tap Contact
  // 4: NFC Wave Radiation & 4 Sequential LEDs
  // 5: Bank Processing / Authorization
  // 6: Final Result (Approved / Declined)
  const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [leds, setLeds] = useState<[boolean, boolean, boolean, boolean]>([false, false, false, false]);

  const prefersReduced = useMemo(() => {
    return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const maskedCardNumber = useMemo(() => {
    const raw = cardNumber.replace(/\D/g, "");
    const last4 = cardLast4 || (raw.length >= 4 ? raw.slice(-4) : "4242");
    return `•••• •••• •••• ${last4}`;
  }, [cardNumber, cardLast4]);

  const formattedName = useMemo(() => {
    return (cardName || "CARDHOLDER").trim().toUpperCase();
  }, [cardName]);

  // Sound feedback (Standard POS approval chime: pleasant two-tone C6 -> G6)
  const playApprovalChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(1046.5, now); // C6
      gain1.gain.setValueAtTime(0.04, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.18);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1567.98, now + 0.14); // G6
      gain2.gain.setValueAtTime(0.05, now + 0.14);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.14);
      osc2.stop(now + 0.38);
    } catch {
      // Audio autoplay may be disabled by browser security, proceed silently
    }
  };

  useEffect(() => {
    if (prefersReduced) {
      setLeds([true, true, true, true]);
      setStage(5);
      const t = setTimeout(() => {
        setStage(6);
        if (!isDeclined) {
          playApprovalChime();
          setTimeout(onDone, 1200);
        }
      }, 900);
      return () => clearTimeout(t);
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Stage 1 -> 2: Card approaches terminal
    timers.push(setTimeout(() => setStage(2), 700));

    // Stage 2 -> 3: Contactless tap on terminal
    timers.push(setTimeout(() => setStage(3), 1500));

    // Stage 3 -> 4: NFC waves radiate & 4 LEDs light up sequentially
    timers.push(
      setTimeout(() => {
        setStage(4);
        setLeds([true, false, false, false]);
      }, 1900)
    );
    timers.push(setTimeout(() => setLeds([true, true, false, false]), 2150));
    timers.push(setTimeout(() => setLeds([true, true, true, false]), 2400));
    timers.push(setTimeout(() => setLeds([true, true, true, true]), 2650));

    // Stage 4 -> 5: Bank authorization
    timers.push(setTimeout(() => setStage(5), 2800));

    // Stage 5 -> 6: Result (Approved / Declined)
    timers.push(
      setTimeout(() => {
        setStage(6);
        if (!isDeclined) {
          playApprovalChime();
          timers.push(setTimeout(onDone, 1400));
        }
      }, 3500)
    );

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReduced, isDeclined]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-label="Secure Card Terminal Authorization"
    >
      <div className="w-full max-w-md bg-[#0F1115] border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative text-white my-auto">
        {/* Subtle Ambient Background Glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Header Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between relative z-10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-white/80" />
            </div>
            <div>
              <p className="text-[13px] font-semibold tracking-tight text-white">EMV Contactless Terminal</p>
              <p className="text-[10px] font-mono tracking-wider uppercase text-white/50">{network}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 block">Amount</span>
            <span className="text-[15px] font-bold font-mono tracking-tight text-white tabular-nums">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Main 3D Presentation & Terminal Scene Canvas */}
        <div className="relative h-[340px] sm:h-[380px] w-full flex flex-col items-center justify-center overflow-hidden px-4 select-none">
          {/* NFC Contactless Pulse Rings radiating from tap surface */}
          <AnimatePresence>
            {(stage === 3 || stage === 4) && (
              <div className="absolute bottom-[130px] sm:bottom-[150px] flex items-center justify-center pointer-events-none z-10">
                <motion.div
                  initial={{ scale: 0.3, opacity: 0.9 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                  className="absolute w-28 h-28 rounded-full border border-emerald-400/80 bg-emerald-400/10"
                />
                <motion.div
                  initial={{ scale: 0.3, opacity: 0.9 }}
                  animate={{ scale: 3.2, opacity: 0 }}
                  transition={{ duration: 1.2, delay: 0.3, repeat: Infinity, ease: "easeOut" }}
                  className="absolute w-28 h-28 rounded-full border border-emerald-400/60"
                />
              </div>
            )}
          </AnimatePresence>

          {/* 3D Bank Card Representation */}
          <motion.div
            style={{ perspective: 1000 }}
            className="absolute z-20 top-4 sm:top-6"
            animate={
              prefersReduced
                ? {}
                : stage === 1
                ? {
                    y: 0,
                    scale: 1,
                    rotateX: 18,
                    rotateY: -14,
                    rotateZ: 2,
                  }
                : stage === 2
                ? {
                    y: 40,
                    scale: 0.94,
                    rotateX: 30,
                    rotateY: -4,
                    rotateZ: 0,
                  }
                : stage === 3 || stage === 4
                ? {
                    y: 85,
                    scale: 0.88,
                    rotateX: 42,
                    rotateY: 0,
                    rotateZ: 0,
                  }
                : {
                    y: 110,
                    scale: 0.82,
                    opacity: 0.75,
                    rotateX: 48,
                  }
            }
            transition={{
              duration: stage === 3 ? 0.35 : 0.8,
              ease: stage === 3 ? "easeOut" : "easeInOut",
            }}
          >
            <div className="w-[270px] sm:w-[310px] h-[165px] sm:h-[188px] rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden shadow-2xl border border-white/20 bg-gradient-to-br from-[#2a2d34] via-[#1a1c22] to-[#0e1014] text-white">
              {/* Metallic Sheen Highlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.08] to-transparent pointer-events-none" />

              {/* Card Top Row: Chip, Contactless Symbol, Brand */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  {/* Realistic Gold EMV Chip */}
                  <div className="w-10 h-7 rounded-md bg-gradient-to-br from-[#ffd56b] via-[#e2b144] to-[#c89326] p-0.5 border border-[#9b7216] shadow-inner relative overflow-hidden">
                    <div className="w-full h-full border border-[#846011]/40 rounded-sm grid grid-cols-2 grid-rows-3 gap-[1px]">
                      <div className="border-r border-b border-[#846011]/30" />
                      <div className="border-b border-[#846011]/30" />
                      <div className="border-r border-b border-[#846011]/30" />
                      <div className="border-b border-[#846011]/30" />
                      <div className="border-r border-[#846011]/30" />
                      <div />
                    </div>
                  </div>

                  {/* Contactless Radio Symbol */}
                  <div className="text-white/60">
                    <Wifi className="w-5 h-5 rotate-90" strokeWidth={2.2} />
                  </div>
                </div>

                {/* Card Brand Vector Mark */}
                <div className="h-6 flex items-center justify-center bg-white/90 px-2 py-0.5 rounded shadow-sm">
                  {brand === "visa" && <Visa className="h-4 w-auto" />}
                  {brand === "mc" && <Mastercard className="h-4 w-auto" />}
                  {brand === "amex" && <Amex className="h-4 w-auto" />}
                  {brand === "unknown" && (
                    <span className="text-[10px] font-bold tracking-wider text-black font-mono">CARD</span>
                  )}
                </div>
              </div>

              {/* Card Center: Masked Embossed Number */}
              <div className="my-auto relative z-10">
                <p className="font-mono text-[15px] sm:text-[17px] tracking-[0.18em] text-white/95 drop-shadow-md">
                  {maskedCardNumber}
                </p>
              </div>

              {/* Card Bottom: Holder Name & Expiry */}
              <div className="flex items-end justify-between relative z-10 text-[9px] sm:text-[10px]">
                <div className="max-w-[170px] truncate">
                  <span className="text-white/40 uppercase font-mono block tracking-wider text-[8px]">Cardholder</span>
                  <p className="font-mono font-semibold tracking-wider text-white/90 truncate">{formattedName}</p>
                </div>
                <div className="text-right">
                  <span className="text-white/40 uppercase font-mono block tracking-wider text-[8px]">Expires</span>
                  <p className="font-mono font-semibold tracking-wider text-white/90">{expiry}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Physical POS Terminal (Smart Glass & Matte Chassis) */}
          <div className="absolute bottom-3 sm:bottom-4 w-[280px] sm:w-[330px] rounded-2xl bg-[#14161C] border border-white/15 p-4 shadow-2xl flex flex-col items-center gap-3 z-10">
            {/* Terminal Top: Contactless Landing Zone & 4 Sequential LEDs */}
            <div className="w-full flex items-center justify-between px-2 pt-1 border-b border-white/10 pb-2.5">
              {/* 4 EMV Status LEDs */}
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3].map((idx) => {
                  const isActive = leds[idx];
                  const isSuccess = stage === 6 && !isDeclined;
                  return (
                    <motion.div
                      key={idx}
                      className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 ${
                        isActive
                          ? isSuccess
                            ? "bg-emerald-400 border-emerald-300 shadow-[0_0_8px_#34d399]"
                            : "bg-amber-400 border-amber-300 shadow-[0_0_8px_#fbbf24]"
                          : "bg-white/10 border-white/20"
                      }`}
                    />
                  );
                })}
              </div>

              {/* Contactless Target Icon on Terminal */}
              <div className="flex items-center gap-1.5 text-white/60">
                <Wifi className="w-3.5 h-3.5 rotate-90" />
                <span className="text-[9px] font-mono tracking-wider uppercase text-white/50">Contactless</span>
              </div>
            </div>

            {/* High-Contrast POS Terminal OLED Display */}
            <div className="w-full bg-[#07080a] border border-white/15 rounded-xl p-3 flex flex-col justify-between min-h-[82px] shadow-inner font-mono">
              <div className="flex items-center justify-between text-[9px] text-white/40 border-b border-white/10 pb-1">
                <span>SHIPNEST POS V4.2</span>
                <span>{issuer.slice(0, 14)}</span>
              </div>

              <div className="py-1 text-center">
                {stage === 1 && (
                  <p className="text-[12px] font-bold text-white/80 tracking-wide animate-pulse">
                    READY · PRESENT CARD
                  </p>
                )}
                {stage === 2 && (
                  <p className="text-[12px] font-bold text-white/90 tracking-wide">
                    CARD APPROACHING...
                  </p>
                )}
                {stage === 3 && (
                  <p className="text-[12px] font-bold text-amber-300 tracking-wide">
                    CARD DETECTED · HOLD STILL
                  </p>
                )}
                {stage === 4 && (
                  <p className="text-[12px] font-bold text-amber-300 tracking-wide">
                    READING NFC CHIP...
                  </p>
                )}
                {stage === 5 && (
                  <p className="text-[12px] font-bold text-sky-400 tracking-wide animate-pulse">
                    AUTHORIZING WITH BANK...
                  </p>
                )}
                {stage === 6 && (
                  <div>
                    {!isDeclined ? (
                      <p className="text-[13px] font-bold text-emerald-400 tracking-wide flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4" strokeWidth={3} /> APPROVED
                      </p>
                    ) : (
                      <p className="text-[13px] font-bold text-rose-400 tracking-wide flex items-center justify-center gap-1.5">
                        <X className="w-4 h-4" strokeWidth={3} /> TRANSACTION DECLINED
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[8px] text-white/40 pt-1 border-t border-white/10">
                <span>TOTAL: ${total.toFixed(2)}</span>
                {stage >= 5 && <span>AUTH: {authCode}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Status Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] text-white/60">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-bit TLS · End-to-end Tokenized</span>
          </div>

          {stage === 6 && isDeclined && (
            <button
              onClick={onCancel}
              className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-[11px] transition-colors"
            >
              Return to Form
            </button>
          )}

          {stage < 6 && (
            <span className="font-mono text-[10px] text-white/40 uppercase">Processing...</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentScene;
