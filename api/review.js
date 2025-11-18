// api/review.js - Perplexity-backed handler
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "Sapients AI Review API is online. Use POST with rating, mood, experience."
    });
  }

  try {
    const { rating, mood, experience } = req.body || {};
    if (!rating || !mood) {
      return res.status(400).json({ error: "Missing 'rating' or 'mood' in request body." });
    }

    const prompt = `
Write a natural, friendly ${rating}-star review for "The Sapients" in a ${mood} tone.
Customer note: "${experience || ""}".
Keep it authentic, polite, and professional. Limit to 3–5 sentences.
`;

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "PERPLEXITY_API_KEY is not set on the server." });
    }

    const r = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-chat",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: "Upstream Perplexity error", details: text });
    }

    const data = await r.json();
    const review = data?.choices?.[0]?.message?.content?.trim() || "No response from Perplexity model.";
    return res.status(200).json({ review });
  } catch (err) {
    console.error("Sapients review API error:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}
