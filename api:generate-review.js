// api/generate-review.js
export default async function handler(req, res) {
  // Allow CORS from any origin so your GoDaddy site can call this
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const { rating, mood, experience } = req.body || {};

    if (!rating || !mood) {
      return res.status(400).json({ error: "Missing rating or mood" });
    }

    const prompt = `Write a natural, friendly ${rating}-star review in a ${mood} tone.
The customer says: "${experience || ''}". Keep it authentic and 3-5 sentences.`;

    const r = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-chat",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: "Upstream error", details: text });
    }

    const data = await r.json();

    const review = data?.choices?.[0]?.message?.content?.trim() || "No response from model.";

    return res.status(200).json({ review });

  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}	