export default async function handler(req, res) {

  // Allow browser requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { rating, mood, experience, project } = req.body;

    let contextPrompt = "";

    // Determine which project is requesting the review
    if (project === "o6e") {

      contextPrompt =
        "Write a short natural feedback comment about a wellness or health experience with O6E-Health. " +
        "O6E focuses on cellular health, nutrition balance, and holistic wellness. " +
        "Avoid making medical claims.";

    } else {

      contextPrompt =
        "Write a short natural customer review for a training organisation called The Sapients. " +
        "The Sapients focuses on personal growth, leadership development, and professional training.";

    }

    const prompt =
      contextPrompt +
      "\n\nRating: " + rating +
      "\nTone: " + mood +
      "\nExperience: " + experience +
      "\n\nGuidelines:" +
      "\n• Write 2 to 4 sentences." +
      "\n• Sound natural and human." +
      "\n• Write like a real person sharing their experience." +
      "\n• Avoid marketing language.";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 120
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return res.status(500).json({ error: "OpenAI API request failed" });
    }

    const data = await response.json();

    const review = data.choices[0].message.content.trim();

    return res.status(200).json({
      review: review
    });

  } catch (error) {

    console.error("Server error:", error);

    return res.status(500).json({
      error: "Review generation failed"
    });

  }

}
