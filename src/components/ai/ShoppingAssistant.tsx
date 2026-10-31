import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "@/context/LocationContext";

type Msg = { role: "user" | "assistant"; content: string };

const INITIAL: Msg = {
  role: "assistant",
  content: "Hi, I'm Nest — your ShipNest shopping assistant. Ask me about products, delivery, payments or your order status.",
};

const ShoppingAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([INITIAL]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { location } = useLocation();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

const getLocalSmartResponse = (query: string): string => {
  const q = query.toLowerCase();
  if (q.includes("shipping") || q.includes("delivery") || q.includes("how long")) {
    return "All orders dispatch from our Central European Hub in Prague, Czech Republic. Standard delivery takes 5–10 business days worldwide with complimentary express air freight. Every shipment includes real-time radar tracking and doorstep 4-digit PIN verification.";
  }
  if (q.includes("track") || q.includes("status") || q.includes("where is")) {
    return "You can track your package anytime on our /track portal using your tracking reference (e.g. SNX4829371). You'll see real-time radar updates, carrier milestones, and your delivery arrival time.";
  }
  if (q.includes("warranty") || q.includes("guarantee")) {
    return "Every device purchased from ShipNest is backed by an official 2-year European warranty as required by EU law, plus full AIG insurance coverage during transit up to $5,000.";
  }
  if (q.includes("return") || q.includes("refund")) {
    return "We offer a 30-day hassle-free return guarantee (exceeding the standard 14-day EU statutory minimum). Contact returns@shipnest.cz with your order number for a complimentary return label.";
  }
  if (q.includes("iphone") || q.includes("apple")) {
    return "We stock factory-unlocked iPhone 16 Pro, 16 Pro Max, and M-series MacBooks sourced directly from authorized European distribution partners with clean international frequency bands.";
  }
  if (q.includes("samsung") || q.includes("galaxy") || q.includes("ultra")) {
    return "Our Galaxy S25 Ultra, Fold, and Flip inventory is brand new, sealed, and eligible for worldwide carrier activation and official manufacturer updates.";
  }
  if (q.includes("payment") || q.includes("card") || q.includes("apple pay")) {
    return "We accept all major international payment methods including Visa, MasterCard, American Express, and Apple Pay with end-to-end 256-bit AES encryption.";
  }
  return "ShipNest is an authorized electronics retailer based in Prague, Czech Republic. We ship factory-sealed flagship smartphones, laptops, audio, and wearables to 60+ countries worldwide with full insurance and live tracking. How can I assist you with your order or selection today?";
};

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("nest-chat", {
        body: {
          messages: next,
          context: location ? { city: location.city, country: location.country } : null,
        },
      });
      if (error || !data?.reply) throw error || new Error("No edge function reply");
      const reply = (data as { reply?: string })?.reply || getLocalSmartResponse(text);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      const fallbackReply = getLocalSmartResponse(text);
      setMessages((m) => [...m, { role: "assistant", content: fallbackReply }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground rounded-full shadow-2xl px-5 py-3.5 flex items-center gap-2 hover:scale-105 transition-transform"
          aria-label="Open shopping assistant"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[13px] font-medium">Ask Nest</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[540px] max-h-[80vh] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-foreground text-background p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-[14px] font-semibold leading-tight">Nest</p>
                <p className="text-[11px] text-background/60 leading-tight">ShipNest AI assistant</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:opacity-70" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary text-foreground rounded-bl-md"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-secondary text-muted-foreground rounded-2xl rounded-bl-md px-3.5 py-2.5 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-[12px]">Nest is thinking…</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          {messages.length === 1 && !loading && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {["How long is delivery?", "Are products genuine?", "Best iPhone for photos?", "Return policy?"].map(
                (q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="text-[11px] bg-secondary text-foreground px-2.5 py-1 rounded-full hover:bg-secondary/70 transition-colors"
                  >
                    {q}
                  </button>
                ),
              )}
            </div>
          )}

          {/* Composer */}
          <div className="border-t border-border p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask Nest anything…"
              className="flex-1 bg-secondary border-0 rounded-full px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ShoppingAssistant;