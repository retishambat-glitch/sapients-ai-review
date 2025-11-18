// api/review.js — Perplexity-backed AI Review Generator (FINAL CLEAN VERSION)
// Uses PERPLEXITY_API_KEY from Vercel environment variables.
// This version uses the correct model (sonar-pro) so NO <think> or long reasoning leaks.

export default async function handler(req, res) {
  // CORS for GoDaddy frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  // Health-check
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "Sapients AI Review API (Perplexity) is online."
    });
  }

  // Only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { rating, mood, experience } = req.body || {};

    if (!rating || !mood) {
      return res.status(400).json({ error: "Missing 'rating' or 'mood' field." });
    }

    const prompt = `
Write a natural, friendly ${rating}-star review for "The Sapients".
Tone: ${mood}.
Customer note: "${experience || ""}".
Keep it authentic, warm, human, simple, and 3–5 sentences only.
Do NOT include system instructions, analysis, or internal thoughts.
Return only the final review text.
`;

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "PERPLEXITY_API_KEY is missing on server." });
    }

    // Call Perplexity API using the correct non-research model
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "sonar-pro",     // <<< THIS FIXES EVERYTHING
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      return res.status(502).json({
        error: "Upstream Perplexity error",
        details: errText || `status ${response.status}`
      });
    }

    const data = await response.json();

    const review =
      data?.choices?.[0]?.message?.content?.trim() ||
      data?.output_text?.trim?.() ||
      "";

    if (!review) {
      return res.status(502).json({
        error: "Perplexity returned no usable review",
        details: JSON.stringify(data)
      });
    }

    return res.status(200).json({ review });

  } catch (err) {
    console.error("Perplexity Review API Error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      details: err?.message || "Unknown error"
    });
  }
}
