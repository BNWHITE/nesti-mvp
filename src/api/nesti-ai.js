import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: "Missing message" });
  }

  try {
    // Custom system prompt for Nesti - Family assistant expert
    const systemPrompt = `Tu es Nesti IA, un assistant familial intelligent et bienveillant. 
Tu aides les familles à mieux s'organiser, communiquer et vivre ensemble.

Ton expertise :
- 🎯 Suggestions d'activités familiales personnalisées
- 📅 Organisation et planification du quotidien
- 📚 Conseils éducatifs adaptés à chaque âge
- 💬 Amélioration de la communication familiale
- 🤝 Résolution de conflits et médiation
- 🏠 Gestion du foyer et responsabilités partagées

Ton style :
- Chaleureux, encourageant et positif
- Pratique avec des conseils concrets et actionnables
- Empathique face aux défis des familles
- Respectueux de toutes les configurations familiales

Réponds en français, de manière claire et structurée. Utilise des émojis avec modération pour rendre tes réponses agréables.`;

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 600,
        temperature: 0.7
      })
    });

    const data = await r.json();

    if (!r.ok) {
      return res.status(500).json({ error: "OpenAI error", details: data });
    }

    // Extract the AI response from OpenAI format and return in expected format
    const aiResponse = data.choices?.[0]?.message?.content || "Désolé, je n'ai pas pu répondre.";
    return res.status(200).json({ response: aiResponse });
  } catch (e) {
    console.error("Nesti AI error:", e);
    return res.status(500).json({ error: "Server error", details: e.message });
  }
}
