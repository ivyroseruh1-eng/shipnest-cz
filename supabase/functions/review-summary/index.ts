import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

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

    const { productName, reviews } = await req.json();
    if (!productName || !Array.isArray(reviews) || reviews.length === 0) {
      return new Response(JSON.stringify({ error: "productName and reviews required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reviewText = reviews
      .slice(0, 30)
      .map((r: any, i: number) => `${i + 1}. (${r.rating}/5) ${String(r.comment || "").slice(0, 400)}`)
      .join("\n");

    const prompt = `You are summarizing customer reviews for "${productName}". Reviews:

${reviewText}

Return strictly valid JSON with this shape:
{"pros":["..","..",".."],"cons":["..","..",".."],"bestFor":"one short sentence"}

Rules:
- Exactly 3 pros and 3 cons, each 3-7 words.
- bestFor: one short sentence describing the ideal buyer.
- Base everything on the reviews provided; do not invent.
- Return ONLY the JSON, no markdown, no explanation.`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error("Gateway error", r.status, text);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: r.status === 429 ? 429 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try extracting JSON
      const match = content.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("review-summary error", e);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});