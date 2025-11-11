import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import './ChatPage.css';

export default function ChatPage({ user, familyId }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Messages de bienvenue initiaux - Déplacé dans useCallback
  const getWelcomeMessages = useCallback(() => {
    return [
      {
        id: 1,
        type: 'ai',
        content: `Bonjour ${user?.user_metadata?.first_name || ''} ! 👋 Je suis Nesti, votre assistant familial bienveillant. Je peux vous aider à :`,
        timestamp: new Date(),
        suggestions: [
          {
            title: "Proposer des activités",
            description: "Adaptées à chaque membre de la famille",
            prompt: "Propose des activités adaptées pour mes enfants aujourd'hui",
            emoji: "🎯"
          },
          {
            title: "Organiser votre agenda", 
            description: "Équilibre vie professionnelle/personnelle",
            prompt: "Aide-moi à organiser notre semaine familiale",
            emoji: "📅"
          },
          {
            title: "Résoudre des conflits",
            description: "Conseils pour la communication familiale",
            prompt: "Comment gérer les disputes entre frères et sœurs ?",
            emoji: "💡"
          },
          {
            title: "Trouver des sorties",
            description: "Idées adaptées à vos préférences",
            prompt: "Quelles sorties familiales ce week-end ?",
            emoji: "🏡"
          }
        ]
      }
    ];
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setMessages(getWelcomeMessages());
  }, [getWelcomeMessages]); // Maintenant c'est correct

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🔥 INTÉGRATION RÉELLE AVEC OPENAI
  const callNestiAI = async (prompt) => {
    setLoading(true);
  
    try {
      // 🔥 CHANGEZ CETTE URL selon votre déploiement
      const API_URL = process.env.NODE_ENV === 'production' 
        ? 'https://votre-backend.herokuapp.com/api/nesti-ai'  // À changer
        : 'http://localhost:3001/api/nesti-ai';
  
      const response = await fetch(API_URL, {
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
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur API');
      }
  
      const data = await response.json();
      return data.response;
  
    } catch (error) {
      console.error('Erreur IA:', error);
      // ... reste du code inchangé
    } finally {
      setLoading(false);
    }
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

    // Sauvegarder dans Supabase (optionnel)
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
    { emoji: '🎨', label: 'Activités créatives', prompt: 'Propose des activités créatives adaptées pour enfants' },
    { emoji: '⚽', label: 'Sports adaptés', prompt: 'Quels sports adaptés pour un enfant qui a besoin de bouger ?' },
    { emoji: '🍽️', label: 'Idées repas', prompt: 'Donne-moi des idées de repas équilibrés, rapides et appréciés des enfants' },
    { emoji: '🎭', label: 'Sorties culture', prompt: 'Quelles sorties culturelles adaptées à toute la famille ce week-end ?' },
    { emoji: '😴', label: 'Gestion sommeil', prompt: 'Comment améliorer le sommeil et les routines du coucher ?' },
    { emoji: '⚡', label: 'Crise TDAH', prompt: 'Comment gérer les crises et les surcharges sensorielles ?' }
  ];

  const formatMessageContent = (content) => {
    return content.split('\n').map((line, index) => {
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return <div key={index} className="message-bullet">• {line.substring(1).trim()}</div>;
      }
      if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
        return <div key={index} className="message-bold">{line.replace(/\*\*/g, '')}</div>;
      }
      return <div key={index}>{line}</div>;
    });
  };

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
              <div className="message-text">
                {formatMessageContent(message.content)}
              </div>
              
              {message.suggestions && (
                <div className="suggestion-cards">
                  {message.suggestions.map((suggestion, index) => (
                    <div 
                      key={index}
                      className="suggestion-card"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <span className="suggestion-emoji">{suggestion.emoji}</span>
                      <div className="suggestion-text">
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
                <span className="typing-text">Nesti réfléchit...</span>
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
            <span className="quick-emoji">{action.emoji}</span>
            <span className="quick-label">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input">
        <button 
          className="voice-btn" 
          title="Voice input"
          disabled={loading}
        >
          🎤
        </button>
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
          {loading ? (
            <div className="send-loading"></div>
          ) : (
            '➤'
          )}
        </button>
      </div>
    </div>
  );
}
