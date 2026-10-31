import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "@/context/LocationContext";

import { products } from "@/data/products";

type Msg = { role: "user" | "assistant"; content: string };

const INITIAL: Msg = {
  role: "assistant",
  content: "Welcome to ShipNest. I'm Nest — your assistant for our Flagship Technology and 600-item Luxury Catalogue. How may I assist your search, product specifications, or order tracking today?",
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
    const q = query.toLowerCase().trim();

    // 1. Dynamic Brand Matching from our real catalogue
    const matchedBrand = Array.from(new Set(products.map((p) => p.brand))).find((brand) =>
      q.includes(brand.toLowerCase())
    );
    if (matchedBrand) {
      const brandProducts = products.filter((p) => p.brand.toLowerCase() === matchedBrand.toLowerCase());
      const sampleNames = brandProducts.slice(0, 3).map((p) => p.name).join(", ");
      const isLuxury = brandProducts.some((p) => p.department === "luxury");
      return `We stock ${brandProducts.length} verified item${brandProducts.length > 1 ? "s" : ""} from ${matchedBrand} in our ${
        isLuxury ? "Luxury Catalogue" : "Technology Collection"
      }, including: ${sampleNames}. You can browse all ${matchedBrand} offerings in our Store.`;
    }

    // 2. Specific Model / Keyword Queries
    if (q.includes("iphone 18") || q.includes("18 pro")) {
      return "The iPhone 18 Pro and Pro Max are in stock featuring A19 Pro silicon, aerospace titanium chassis in Burgundy, Glacier, Silver, and Space Black, and next-generation periscope optical zoom. You can configure finishes and storage directly on our product page.";
    }
    if (q.includes("iphone duo") || q.includes("duo") || q.includes("foldable")) {
      return "The iPhone Duo is Apple's flagship foldable device, featuring dual tandem OLED displays, adaptive kickstand for tent/laptop modes, and ultra-thin profile in Star White and Space Black.";
    }
    if (q.includes("iphone air") || q.includes("air")) {
      return "The iPhone Air introduces an ultra-thin 5.6mm aerospace titanium enclosure, uncompromised Pro performance, and high-efficiency silicon in our Technology department.";
    }
    if (q.includes("shipping") || q.includes("delivery") || q.includes("how long")) {
      return "All shipments dispatch directly from our Central European logistics hub in Prague, Czech Republic via DHL Express, FedEx Priority, and UPS. Precise arrival dates and carrier options are calculated at checkout according to your destination address.";
    }
    if (q.includes("track") || q.includes("status") || q.includes("where is")) {
      return "Track your parcel anytime at /track using your tracking number or order ID. You can monitor live carrier radar milestones, customs clearance events, and delivery ETA. Delivery includes a secure 4-digit PIN handover.";
    }
    if (q.includes("warranty") || q.includes("guarantee") || q.includes("authentic")) {
      return "Every item at ShipNest is 100% genuine and brand-new in original factory packaging. Technology hardware includes a 2-year manufacturer warranty, and luxury pieces carry verified European boutique provenance.";
    }
    if (q.includes("return") || q.includes("refund")) {
      return "We provide a 30-day return policy for brand-new, factory-sealed items in original packaging. You can initiate a return through your account or by contacting support@shipnest.cz.";
    }
    if (q.includes("payment") || q.includes("card") || q.includes("apple pay")) {
      return "We accept Visa, MasterCard, American Express, Apple Pay, Google Pay, and Moonlight Private Client transfers with 256-bit AES encryption.";
    }

    return "ShipNest curates 665 flagship technology devices and authenticated luxury goods with global express dispatch from Prague to 60+ countries. Feel free to ask about any brand (such as Apple, Rolex, Louis Vuitton, Cartier, or Creed) or visit /shop to browse.";
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