// api/review.js — Perplexity-backed AI Review Generator
// Requires PERPLEXITY_API_KEY in Vercel environment variables.

export default async function handler(req, res) {
  // Basic CORS so your GoDaddy frontend can call this endpoint
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  // Health-check
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "Sapients AI Review API (Perplexity) is online. Use POST with rating, mood, experience."
    });
  }

  // Only POST for generation
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { rating, mood, experience } = req.body || {};

    if (!rating || !mood) {
      return res.status(400).json({ error: "Missing 'rating' or 'mood' in request body." });
    }

    const prompt = `
Write a natural, friendly ${rating}-star review for "The Sapients".
Tone: ${mood}.
Customer note: "${experience || ""}".
Keep it authentic, warm and professional. Limit to 3–5 sentences.
`;

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "PERPLEXITY_API_KEY is not set on the server." });
    }

    // Call Perplexity API
    const pResponse = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "sonar-deep-research",
        messages: [{ role: "user", content: prompt }],
        // optional: temperature: 0.7
      }),
      // small timeout is handled by Vercel infra; you can add client-side timeout if needed
    });

    // If Perplexity returned a non-OK code, forward the message (safe)
    if (!pResponse.ok) {
      const txt = await pResponse.text().catch(() => "");
      return res.status(502).json({ error: "Upstream Perplexity error", details: txt || `status ${pResponse.status}` });
    }

    // Parse response JSON
    const data = await pResponse.json();

    // Attempt to extract review text from typical Perplexity response shapes
    const review =
      data?.choices?.[0]?.message?.content?.trim() ||
      data?.output_text?.trim?.() ||
      (typeof data === "string" ? data : "");

    if (!review) {
      // If we couldn't find text, return full response in details for debugging
      return res.status(502).json({ error: "Upstream Perplexity returned no usable text", details: JSON.stringify(data) });
    }

    return res.status(200).json({ review });
  } catch (err) {
    // Log server-side error (Vercel logs) and return safe JSON message
    console.error("Perplexity review API error:", err);
    const message = err?.message || "Unknown error";
    return res.status(500).json({ error: "Internal Server Error", details: message });
  }
}
