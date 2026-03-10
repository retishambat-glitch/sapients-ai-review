export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { rating, mood, experience } = req.body;

    const prompt = `
Write a short natural customer review for a training organisation called "The Sapients".

Rating: ${rating} stars
Tone: ${mood}
Experience: ${experience}

The review should sound natural and human.
Keep it between 2 and 4 sentences.
Avoid sounding like advertising.
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: prompt,
        max_output_tokens: 120,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return res.status(500).json({ error: "OpenAI API request failed" });
    }

    const data = await response.json();

    const review = data.output[0].content[0].text;

    return res.status(200).json({
      review: review.trim()
    });

  } catch (error) {

    console.error("Server error:", error);

    return res.status(500).json({
      error: "Review generation failed"
    });

  }
}
