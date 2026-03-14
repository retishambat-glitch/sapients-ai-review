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

    const prompt =
      "Write a short natural customer review for a training organisation called 'The Sapients'.\n\n" +
      "Rating: " + rating + " stars\n" +
      "Tone: " + mood + "\n" +
      "Experience: " + experience + "\n\n" +
      "Keep the review between 2 and 4 sentences. Make it sound like a real participant sharing feedback. Avoid advertising language.";

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
