const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Route OpenAI
app.post('/api/nesti-ai', async (req, res) => {
  const { message, userContext } = req.body;

  try {
    console.log('🤖 Nesti AI - Processing:', message.substring(0, 50));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Tu es Nesti, un assistant familial bienveillant et chaleureux spécialisé dans l'accompagnement des familles.

TON IDENTITÉ :
- Tu es Nesti, assistant familial expert
- Tu aides les familles avec enfants (neurotypiques, TDAH, TSA, etc.)
- Tu es spécialiste des activités adaptées, de l'organisation et des conseils éducatifs
- Tu connais Paris et ses ressources familiales

TON STYLE :
- Ton est empathique, pratique et encourageant
- Tu utilises des emojis pertinents (🎯📅💡🏡🍽️😴✨)
- Tu proposes des solutions concrètes et personnalisées
- Tu poses des questions pour mieux comprendre les besoins
- Tu es toujours bienveillant et jamais jugeant

DOMAINES D'EXPERTISE :
🎯 Activités adaptées (sports, créativité, sorties)
📅 Organisation familiale (emploi du temps, routines)
💡 Conseils éducatifs (communication, émotions)
🏡 Environnement (aménagement, espaces calmes)
🍽️ Nutrition (repas équilibrés, idées recettes)
😴 Sommeil (routines du coucher)

Réponds toujours en français, sois concis mais chaleureux.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const aiResponse = data.choices[0].message.content;
    
    console.log('✅ Réponse générée');
    res.json({ response: aiResponse });

  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ 
      error: 'Désolé, je rencontre un problème technique. Réessayez dans quelques instants.',
      fallback: true
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur Nesti IA sur le port ${PORT}`);
});
