// api/review.js — OpenAI Responses API (final, uses gpt-5-mini)
// Uses OPENAI_API_KEY from Vercel environment variables.

import OpenAI from "openai";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  // Health check
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "Sapients AI Review API (OpenAI) is running."
    });
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

Rules:
- Make it sound like a real human review.
- Positive, warm, and professional.
- 3–5 sentences maximum.
- Do not include HTML or extra metadata.
`;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not set on the server." });
    }

    const client = new OpenAI({ apiKey });

    // Use an available model name — gpt-5-mini recommended
    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: prompt
    });

    const review = (response.output_text || "").trim();

    if (!review) {
      return res.status(502).json({ error: "OpenAI returned empty review." });
    }

    return res.status(200).json({ review });
  } catch (err) {
    console.error("Sapients AI Review Error:", err);
    const message = err?.message || "Unknown error";
    return res.status(500).json({ error: "Internal Server Error", details: message });
  }
}
