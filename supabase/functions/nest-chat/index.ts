import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SYSTEM_PROMPT = `You are Nest, the expert shopping assistant and luxury concierge for ShipNest — a premier worldwide destination for flagship technology and authentic luxury goods, dispatching internationally from Prague, Czech Republic.

Tone & Demeanor:
- Refined, articulate, knowledgeable, concise, and helpful.
- Balance the technical mastery of an Apple Store genius with the poise and discretion of a Parisian luxury house concierge.
- Provide direct answers in 1-3 sentences unless the customer asks for a detailed breakdown or comparison.

Our Catalogue & Structure:
1. Technology Department:
   - Flagship Smartphones:
     * iPhone 18 Pro & iPhone 18 Pro Max: Featuring A19 Pro silicon, titanium frame in Burgundy, Glacier, Silver, and Space Black, advanced periscope optical zoom, and 120Hz ProMotion.
     * iPhone Duo: Revolutionary dual-display foldable with multi-angle kickstand, tent, laptop, and ultra-wide reading modes in Star White and Space Black.
     * iPhone Air: Architectural ultra-thin profile at just 5.6mm, aerospace titanium unibody, and Pro-grade performance.
     * iPhone 17, iPhone 17e, and iPhone 16.
     * Samsung Galaxy S26 Ultra, Galaxy Z Fold 7, Galaxy Z Flip 7.
     * Google Pixel 10 Pro and 9 Pro series.
   - High-End Computing & Tablets: M-series Apple MacBooks, iPad Pro OLED, Microsoft Surface.
   - Premium Audio: Sony WH-1000XM6, Bose QuietComfort Ultra, Bowers & Wilkins Px8, Apple AirPods Max.
   - Luxury Wearables: Apple Watch Ultra 3, Garmin Marq / Fēnix 8.

2. Luxury Department (600 Catalogued Masterpieces across 50 Premier Houses):
   - Designer Fashion & Leather: Louis Vuitton, Chanel, Hermès, Gucci, Prada, Saint Laurent, Dior, Bottega Veneta, Celine, Loewe, Balenciaga, Fendi, Jacquemus.
   - Haute Horlogerie & High Jewellery: Rolex (Submariner, Daytona, Datejust), Cartier (Tank, Santos, Love Bracelet), Patek Philippe, Audemars Piguet, Omega, Tiffany & Co., Van Cleef & Arpels.
   - Fine Perfumery: Creed (Aventus, Silver Mountain Water), Maison Francis Kurkdjian (Baccarat Rouge 540), Tom Ford Private Blend, Le Labo (Santal 33), Byredo (Bal d'Afrique, Gypsy Water), Diptyque, Kilian Paris.
   - Skincare & Beauty: Charlotte Tilbury, La Mer, Augustinus Bader, Rare Beauty, Fenty Beauty, Pat McGrath Labs, Tom Ford Beauty.

Truthful Business Principles:
- Dispatch & Logistics: All international orders dispatch from our central European logistics facility in Prague, Czech Republic, via DHL Express, FedEx Priority, or UPS Worldwide.
- Transit Times: Delivery schedules vary based on the destination country and customs clearance. Accurate transit windows are computed dynamically at checkout. Do not invent exact day guarantees.
- Secure Custody: Real-time radar milestone tracking is accessible at /track. Doorstep handover requires a secure 4-digit PIN verification.
- Authenticity: 100% authentic, brand-new, factory-sealed goods sourced exclusively through authorized European brand distributors and verified partner boutiques.
- Luxury Inquiries: Luxury items are listed in our catalog with "Price Upon Inquiry" or concierge quotation. Customers can submit a concierge inquiry directly on the product page or contact concierge@shipnest.cz.
- Consumer Protection: 2-year warranty on electronic devices; 30-day return window for unopened, sealed items in original condition.
- Payments: Visa, Mastercard, American Express, Apple Pay, Google Pay, and Moonlight Private Client wire transfers.

Rules:
- Never fabricate specifications, invent fake prices, or guarantee delivery dates. If uncertain, suggest visiting the product page or checking /track.
- Never mention internal model names like "Gemini" or "OpenAI". You are Nest.
- Always recommend navigating to relevant sections: /shop, /luxury, /track, /compare, or /cart.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const context = body?.context as { city?: string; country?: string } | null;

    if (!messages.length) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let systemInstruction = SYSTEM_PROMPT;
    if (context?.city && context?.country) {
      systemInstruction += `\n\nActive Customer Location: The customer is currently browsing from ${context.city}, ${context.country}.`;
    }

    // 1. Primary Integration: Direct Google Gemini 3.8 Flash REST API
    if (geminiKey) {
      const contents = [];
      const trimmed = messages.slice(-12);
      
      for (const m of trimmed) {
        contents.push({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: String(m.content || "").slice(0, 2000) }],
        });
      }

      // Ensure the first turn is always "user" for Gemini API standards
      if (contents.length > 0 && contents[0].role === "model") {
        contents.shift();
      }

      if (contents.length === 0) {
        contents.push({ role: "user", parts: [{ text: "Hello Nest" }] });
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${geminiKey}`;

      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }],
          },
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 800,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return new Response(JSON.stringify({ reply: text }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        const errText = await res.text();
        console.error("Gemini API error:", res.status, errText);
      }
    }

    // 2. Secondary Fallback: Lovable Gateway if LOVABLE_API_KEY is available
    if (lovableKey) {
      const trimmed = messages.slice(-12).map((m: any) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: String(m.content || "").slice(0, 2000),
      }));

      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${lovableKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: systemInstruction }, ...trimmed],
        }),
      });

      if (r.ok) {
        const data = await r.json();
        const reply = data?.choices?.[0]?.message?.content;
        if (reply) {
          return new Response(JSON.stringify({ reply }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // 3. Graceful Catalogue-Grounded Response when server API keys are pending
    const latestUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content?.toLowerCase() || "";
    let smartFallback = "Welcome to ShipNest. We dispatch authentic flagship technology and luxury goods directly from Prague, Czech Republic to 60+ countries with live milestone tracking. How may I assist your search today?";

    if (latestUserMsg.includes("iphone") || latestUserMsg.includes("apple")) {
      smartFallback = "We offer the latest Apple collection including the iPhone 18 Pro and Pro Max in Burgundy, Glacier, Silver, and Space Black, the ultra-thin 5.6mm iPhone Air, and the foldable iPhone Duo. Explore all models under Technology.";
    } else if (latestUserMsg.includes("luxury") || latestUserMsg.includes("bag") || latestUserMsg.includes("watch") || latestUserMsg.includes("perfume")) {
      smartFallback = "Our Luxury Department features 600 catalogued items across 50 premier world houses including Louis Vuitton, Hermès, Chanel, Rolex, Cartier, and Creed. Sourced with full authenticity provenance from verified European boutiques.";
    } else if (latestUserMsg.includes("shipping") || latestUserMsg.includes("deliver")) {
      smartFallback = "All orders ship securely from Prague via DHL Express, FedEx, or UPS. Exact arrival windows are calculated at checkout, and delivery requires a 4-digit PIN handover for full custody protection.";
    } else if (latestUserMsg.includes("track")) {
      smartFallback = "You can view real-time radar milestones for your shipment anytime on our /track portal using your tracking reference code.";
    }

    return new Response(JSON.stringify({ reply: smartFallback, status: "catalogue_fallback" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("nest-chat error", e);
    return new Response(JSON.stringify({
      reply: "Welcome to ShipNest. Our concierge team is available to assist you with flagship technology, 600 catalogued luxury goods, or order tracking at /track.",
      error: "service_exception",
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});