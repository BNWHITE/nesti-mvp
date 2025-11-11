// pages/api/nesti-ai.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, userContext } = req.body;

  try {
    // OPTION 1: OpenAI GPT-4
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Tu es Nesti, un assistant familial bienveillant et chaleureux. Tu aides les familles avec :
            - Des activités adaptées aux enfants (TDAH, autisme, neurotypiques)
            - L'organisation du temps familial
            - Des conseils éducatifs positifs
            - La résolution de conflits familiaux
            - Les sorties et loisirs adaptés
            
            Ton ton est : empathique, encourageant, pratique et jamais jugeant.
            Réponds en français, sois concis mais chaleureux.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await openaiResponse.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const aiResponse = data.choices[0].message.content;

    res.status(200).json({ response: aiResponse });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Erreur de communication avec Nesti IA',
      fallback: true 
    });
  }
}
