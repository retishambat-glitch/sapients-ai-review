export default async function handler(req, res) {

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

Keep it authentic, human, and between 2–4 sentences.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 120
      })
    });

    const data = await response.json();

    const review = data.choices[0].message.content;

    res.status(200).json({
      review
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Review generation failed"
    });

  }
}
