// api/review.js
export default async function handler(req, res) {
  // Allow CORS so Godaddy frontend can call this
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { rating, mood, experience } = req.body || {};

    if (!rating || !mood) {
      return res.status(400).json({ error: "Missing rating or mood" });
    }

    const prompt = `Write a natural, friendly ${rating}-star review for "The Sapients" in a ${mood} tone.
