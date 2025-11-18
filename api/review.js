// api/review.js (temporary minimal handler to verify function runs)
export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  // Health / GET endpoint
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      now: new Date().toISOString(),
      message: "health-check OK - minimal handler running"
    });
  }

  // Simple POST echo
  if (req.method === "POST") {
    const body = req.body || {};
    return res.status(200).json({ ok: true, echo: body });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
