import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Route santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Nesti API is running' });
});

// Route principale Nesti AI
app.post('/api/nesti-ai', async (req, res) => {
  const { message, userContext } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    console.log('🔮 Nesti AI - Processing request:', { 
      user: userContext?.userName, 
      message: message.substring(0, 100) 
    });

    // 🔥 APPEL RÉEL À OPENAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `Tu es Nesti, un assistant familial bienveillant, chaleureux et ultra-compétent. 

CONTEXTE FAMILIAL :
- Tu aides les familles avec enfants (neurotypiques, TDAH, TSA, etc.)
- Tu es spécialiste des activités adaptées, de l'organisation familiale et des conseils éducatifs
- Ton ton est : empathique, pratique, encourageant, jamais jugeant
- Tu proposes des solutions concrètes et personnalisées

DOMAINES D'EXPERTISE :
🎯 ACTIVITÉS ADAPTÉES : sports, créativité, sorties, jeux éducatifs
📅 ORGANISATION : planning, routines, gestion du temps, équilibre vie pro/perso
💡 CONSEILS ÉDUCATIFS : communication positive, gestion des émotions, résolution de conflits
🏡 ENVIRONNEMENT : aménagement d'espaces, gestion sensorielle, accessibilité

STYLE DE RÉPONSE :
- Utilise des emojis pertinents (🎯📅💡🏡✨)
- Sois concis mais chaleureux
- Propose des options concrètes
- Pose des questions pour préciser les besoins
- Utilise des listes claires quand c'est pertinent

Réponds toujours en français, avec bienveillance et expertise.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    const data = await openaiResponse.json();
    
    if (data.error) {
      console.error('OpenAI API Error:', data.error);
      throw new Error(`OpenAI: ${data.error.message}`);
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from AI');
    }

    const aiResponse = data.choices[0].message.content;
    
    console.log('✅ Nesti AI - Response generated');

    res.status(200).json({ 
      response: aiResponse,
      usage: data.usage
    });

  } catch (error) {
    console.error('❌ Nesti AI - Error:', error);
    
    res.status(500).json({ 
      error: 'Erreur de communication avec Nesti IA',
      fallback: true
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Nesti API server running on port ${PORT}`);
  console.log(`🔮 AI endpoint: http://localhost:${PORT}/api/nesti-ai`);
  console.log(`🔑 OpenAI Key: ${process.env.OPENAI_API_KEY ? '✅ Loaded' : '❌ Missing'}`);
});
