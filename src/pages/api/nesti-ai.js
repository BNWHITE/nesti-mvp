import { createClient } from '@supabase/supabase-js';

// Initialisation Supabase (optionnel pour contexte)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Autoriser CORS pour le frontend
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, userContext } = req.body;

  // Validation basique
  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    console.log('🔮 Nesti AI - Processing request:', { 
      user: userContext?.userName, 
      messageLength: message.length 
    });

    // 🔥 APPEL RÉEL À OPENAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // ou 'gpt-4' pour économiser
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
        max_tokens: 800,
        temperature: 0.7,
        presence_penalty: 0.3,
        frequency_penalty: 0.2
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
    
    console.log('✅ Nesti AI - Response generated:', { 
      responseLength: aiResponse.length,
      first100Chars: aiResponse.substring(0, 100) 
    });

    // 🔥 OPTIONNEL : Sauvegarder l'interaction dans Supabase
    try {
      if (userContext?.familyId) {
        await supabase
          .from('chat_messages')
          .insert([{
            family_id: userContext.familyId,
            user_id: userContext.userId,
            message: message,
            response: aiResponse,
            message_type: 'user_question'
          }]);
      }
    } catch (dbError) {
      console.error('Database save error (non-blocking):', dbError);
      // Ne pas bloquer la réponse à cause d'une erreur DB
    }

    res.status(200).json({ 
      response: aiResponse,
      usage: data.usage // Pour le monitoring
    });

  } catch (error) {
    console.error('❌ Nesti AI - Critical error:', error);
    
    res.status(500).json({ 
      error: 'Erreur de communication avec Nesti IA',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      fallback: true
    });
  }
}
