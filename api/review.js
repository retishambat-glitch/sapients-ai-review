// api/review.js — OpenAI Responses API (final version)
// Uses OPENAI_API_KEY from Vercel environment variables.

import OpenAI from "openai";

export default async function handler(req, res) {
  // CORS headers so your GoDaddy front-end can call this
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Health check
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "Sapients AI Review API (OpenAI) is running."
    });
  }

  try {
    // Get input from POST body
    const { rating, mood, experience } = req.body || {};

    if (!rating || !mood) {
      return res.status(400).json({ error: "Missing 'rating' or 'mood' in request body." });
    }

    // Build prompt
    const prompt = `
Write a natural, friendly ${rating}-star review for "The Sapients".
Tone: ${mood}.
Customer note: "${experience || ""}".

Rules:
- Make it sound like a real human review.
- Positive, warm, and professional.
- 3–5 sentences maximum.
- Include the star sentiment but do NOT include HTML or extra markers.
`;

    // Read OpenAI key from environment
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not set on the server." });
    }

    // Init OpenAI client
    const client = new OpenAI({ apiKey });

    // Call Responses API
    const response = await client.responses.create({
      model: "gpt-5.1-mini",   // chosen for balance of quality and latency; change if needed
      input: prompt
    });

    // The SDK returns a combined output text property
    const review = (response.output_text || "").trim();

    if (!review) {
      return res.status(502).json({ error: "OpenAI returned empty review." });
    }

    return res.status(200).json({ review });

  } catch (err) {
    console.error("Sapients AI Review Error:", err);
    // Return safe error details (avoid leaking secrets)
    const message = err?.message || "Unknown error";
    return res.status(500).json({ error: "Internal Server Error", details: message });
  }
}
