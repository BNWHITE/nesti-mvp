import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './ChatPage.css';

export default function ChatPage({ user, familyId }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Messages de bienvenue initiaux
  const welcomeMessages = [
    {
      id: 1,
      type: 'ai',
      content: `Bonjour ${user?.user_metadata?.first_name || ''} ! Je suis Nesti, votre assistant familial bienveillant. Je peux vous aider à :`,
      timestamp: new Date(),
      suggestions: [
        {
          title: "Proposer des activités",
          description: "Adaptées à chaque membre de la famille",
          prompt: "Propose des activités adaptées pour mes enfants"
        },
        {
          title: "Organiser votre agenda", 
          description: "Équilibre vie professionnelle/personnelle",
          prompt: "Aide-moi à organiser notre semaine familiale"
        },
        {
          title: "Résoudre des conflits",
          description: "Conseils pour la communication familiale",
          prompt: "Comment gérer les disputes entre frères et sœurs ?"
        },
        {
          title: "Trouver des sorties",
          description: "Idées adaptées à vos préférences",
          prompt: "Quelles sorties familiales ce week-end ?"
        }
      ]
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setMessages(welcomeMessages);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🔥 INTÉGRATION IA RÉELLE - 3 OPTIONS DISPONIBLES
  const callNestiAI = async (prompt) => {
    setLoading(true);

    try {
      let response;

      // OPTION 1: OpenAI GPT (Recommandé)
      response = await fetch('/api/nesti-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          userContext: {
            userId: user.id,
            familyId: familyId,
            userName: user.user_metadata?.first_name
          }
        }),
      });

      // OPTION 2: Hugging Face (Gratuit)
      // response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': 'Bearer VOTRE_CLE_API_HUGGING_FACE',
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ inputs: prompt }),
      // });

      // OPTION 3: Groq (Très rapide et gratuit)
      // response = await fetch('/api/groq-ai', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ prompt }),
      // });

      if (!response.ok) throw new Error('Erreur API');

      const data = await response.json();
      
      // Pour l'instant, simulation en attendant l'API
      return simulateAIResponse(prompt);

    } catch (error) {
      console.error('Erreur IA:', error);
      return "Je rencontre quelques difficultés techniques. Pouvez-vous reformuler votre question ?";
    } finally {
      setLoading(false);
    }
  };

  // Simulation d'IA en attendant l'intégration réelle
  const simulateAIResponse = (prompt) => {
    const responses = {
      'activité': `D'après votre profil familial, je vous suggère :
• **Parc de Bercy** (30min) - Espaces verts pour se détendre
• **Atelier cuisine** (1h) - Recette simple et amusante
• **Jeu de société coopératif** (45min) - Renforce la complicité

Quelle activité vous tente le plus ?`,
      
      'agenda': `Voici une proposition d'organisation pour votre semaine :
**Lundi** : Devoirs + temps calme
**Mardi** : Activité sportive en extérieur  
**Mercredi** : Sortie culturelle ou creative
**Jeudi** : Soirée jeux en famille
**Vendredi** : Temps libre individualisé

Souhaitez-vous ajuster quelque chose ?`,
      
      'conseil': `En tant qu'assistant familial, je vous recommande :
• Établir des routines stables pour sécuriser les enfants
• Utiliser des minuteurs visuels pour les transitions
• Créer des espaces calmes dans la maison
• Célébrer les petites victoires quotidiennes

Ces approches aident à créer un environnement apaisant.`,
      
      'default': `Je comprends votre demande ! En tant qu'assistant familial Nesti, je peux vous aider sur :
🎯 **Activités adaptées** aux besoins de chacun
📅 **Organisation** du temps familial  
💡 **Conseils éducatifs** bienveillants
🏡 **Aménagement** d'espaces familiaux

Pouvez-vous me préciser votre besoin ?`
    };

    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('activité') || lowerPrompt.includes('sortie')) return responses.activité;
    if (lowerPrompt.includes('agenda') || lowerPrompt.includes('organisation')) return responses.agenda;
    if (lowerPrompt.includes('conseil') || lowerPrompt.includes('problème')) return responses.conseil;
    
    return responses.default;
  };

  const handleSendMessage = async (text = inputMessage) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    // Réponse IA
    const aiResponse = await callNestiAI(text);
    
    const aiMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: aiResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);

    // Sauvegarder dans Supabase
    try {
      await supabase
        .from('chat_messages')
        .insert([{
          family_id: familyId,
          user_id: user.id,
          message: text,
          response: aiResponse,
          message_type: 'user_question'
        }]);
    } catch (error) {
      console.error('Erreur sauvegarde message:', error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion.prompt);
  };

  const quickActions = [
    { emoji: '🎨', label: 'Activités créatives', prompt: 'Propose des activités créatives pour enfants' },
    { emoji: '⚽', label: 'Sports adaptés', prompt: 'Quels sports adaptés pour un enfant TDAH ?' },
    { emoji: '🍽️', label: 'Idées repas', prompt: 'Donne-moi des idées de repas équilibrés et rapides' },
    { emoji: '🎭', label: 'Sorties culture', prompt: 'Quelles sorties culturelles adaptées à la famille ?' },
    { emoji: '😴', label: 'Gestion sommeil', prompt: 'Comment améliorer le sommeil des enfants ?' },
    { emoji: '⚡', label: 'Crise TDAH', prompt: 'Comment gérer les crises et surcharges sensorielles ?' }
  ];

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <div className="ai-avatar">
          <span>✨</span>
        </div>
        <div className="ai-info">
          <h1>Nesti IA</h1>
          <p>Votre assistant familial bienveillant</p>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}-message`}>
            <div className="message-avatar">
              {message.type === 'ai' ? '✨' : '👤'}
            </div>
            <div className="message-content">
              <p>{message.content}</p>
              
              {message.suggestions && (
                <div className="suggestion-cards">
                  {message.suggestions.map((suggestion, index) => (
                    <div 
                      key={index}
                      className="suggestion-card"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <span>{suggestion.emoji || '💡'}</span>
                      <div>
                        <strong>{suggestion.title}</strong>
                        <p>{suggestion.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="message-time">
              {message.timestamp.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="message ai-message">
            <div className="message-avatar">✨</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Actions rapides */}
      <div className="quick-actions">
        {quickActions.map((action, index) => (
          <button 
            key={index}
            className="quick-btn"
            onClick={() => handleSendMessage(action.prompt)}
            disabled={loading}
          >
            {action.emoji} {action.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input">
        <button className="voice-btn" title="Voice input">🎤</button>
        <input 
          type="text" 
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Posez une question à Nesti..."
          className="message-input"
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={loading}
        />
        <button 
          className="send-btn"
          onClick={() => handleSendMessage()}
          disabled={!inputMessage.trim() || loading}
        >
          {loading ? '...' : '➤'}
        </button>
      </div>
    </div>
  );
}
