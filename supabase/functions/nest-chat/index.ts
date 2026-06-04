import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SYSTEM_PROMPT = `You are Nest, the friendly AI shopping assistant for ShipNest — a premium electronics retailer that ships worldwide from Prague, Czech Republic.

Tone: warm, concise, helpful. Sound like a knowledgeable Apple Store specialist, not a chatbot.
Length: 1-3 short sentences unless the user asks for detail. Use bullet points only when listing 3+ items.

Key facts you can rely on:
- Ships from Prague, CZ via express partners (DHL, FedEx, UPS) to 60+ countries.
- Delivery times depend on destination; the exact date is confirmed at checkout. Do not invent specific day counts.
- Every product is brand-new, sealed in original manufacturer packaging, authorized retailer.
- 2-year manufacturer warranty + 30-day no-questions-asked returns.
- Payments: Visa, Mastercard, Amex, Apple Pay, Google Pay, and Moonlight Wealth Management for premium orders.
- Tracking: customers receive a tracking ID by email; live updates at every milestone; visit /track to check.
- Top categories: iPhone 17, Galaxy S25, Pixel 9, MacBook, iPad, Sony/Bose audio, Garmin.

Rules:
- Never make up product specs, prices, or delivery dates. If unsure, say "I'd check the product page for exact specs" or "your final delivery date is confirmed at checkout".
- If asked about an order status, tell the user to visit /track with their tracking or order ID, or sign in to see My Orders.
- Do not mention "Gemini", "OpenAI", "AI model", or "Lovable". You are Nest.
- If the user is rude or off-topic, politely redirect to shopping help.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const context = body?.context as { city?: string; country?: string } | null;

    if (!messages.length) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let systemPrompt = SYSTEM_PROMPT;
    if (context?.city && context?.country) {
      systemPrompt += `\n\nThe user is currently shopping from ${context.city}, ${context.country}.`;
    }

    const trimmed = messages.slice(-12).map((m: any) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: String(m.content || "").slice(0, 2000),
    }));

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...trimmed],
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error("Gateway error", r.status, text);
      if (r.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests, please slow down." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (r.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("nest-chat error", e);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});