// src/pages/api/nesti-ai.js (VERSION FINALE)

import { createClient } from '@supabase/supabase-js';

// CORRECTION CRITIQUE : Utilise les variables d'environnement standard Vercel/Node (SANS REACT_APP_)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
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

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        // OPENAI_API_KEY doit être défini dans les variables d'environnement Vercel
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Tu es Nesti, un assistant familial bienveillant... [Le reste du prompt system]`
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

    const aiResponse = data.choices[0].message.content;
    
    // Sauvegarder l'interaction dans Supabase (table chat_messages)
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
    }

    res.status(200).json({ 
      response: aiResponse,
      usage: data.usage 
    });

  } catch (error) {
    console.error('❌ Nesti AI - Critical error:', error);
    
    res.status(500).json({ 
      error: 'Erreur de communication avec Nesti IA',
      details: error.message,
      fallback: true
    });
  }
}
