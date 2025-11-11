import { useState, useRef, useEffect, useCallback } from 'react';
import './ChatPage.css';

export default function ChatPage({ user }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const getWelcomeMessages = useCallback(() => {
    return [
      {
        id: 1,
        type: 'ai',
        content: `Bonjour ${user?.user_metadata?.first_name || ''} ! 👋 Je suis Nesti, votre assistant familial bienveillant.`,
        timestamp: new Date(),
        suggestions: [
          {
            title: "Activités Paris",
            description: "Sorties adaptées selon les âges", 
            prompt: "Quelles activités à Paris pour des enfants ?",
            emoji: "🎯"
          },
          {
            title: "Organisation",
            description: "Planning et routines familiales",
            prompt: "Comment organiser notre semaine à Paris ?",
            emoji: "📅"
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
  }, [getWelcomeMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🔥 VERSION TEMPORAIRE INTELLIGENTE
  const callNestiAI = async (prompt) => {
    setLoading(true);
  
    try {
      // 🔥 REMPLACEZ CETTE URL PAR VOTRE VRAIE URL RAILWAY
      const API_URL = 'https://nesti-ai-server.up.railway.app/api/nesti-ai';
  
      console.log('📤 Sending to AI:', prompt);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          userContext: {
            userName: user?.user_metadata?.first_name,
            location: 'Paris'
          }
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('📥 Received AI response');
      
      return data.response;
  
    } catch (error) {
      console.error('❌ AI Error:', error);
      
      // Fallback intelligent
      return `Je rencontre une difficulté de connexion avec mon serveur. 😔
  
  Mais voici ce que je peux vous dire immédiatement :
  
  **Pour les familles à Paris :**
  • Les musées sont souvent gratuits le 1er dimanche du mois
  • Les parcs (Luxembourg, Buttes-Chaumont) sont excellents pour les enfants
  • La Cité des Sciences propose des activités adaptées
  
  **Conseil rapide :** Établissez des routines stables et utilisez des timer visuels.
  
  Pouvez-vous réessayer votre question ? Le service devrait revenir rapidement. ✨`;
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (text = inputMessage) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    const aiResponse = await callNestiAI(text);
    
    const aiMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: aiResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion.prompt);
  };

  const formatMessageContent = (content) => {
    if (!content || typeof content !== 'string') {
      return <div>Message non disponible</div>;
    }

    return content.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return <br key={index} />;
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        return <div key={index} className="message-bullet">• {trimmedLine.substring(1).trim()}</div>;
      }
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        return <div key={index} className="message-bold">{trimmedLine.replace(/\*\*/g, '')}</div>;
      }
      return <div key={index}>{line}</div>;
    });
  };

  const quickActions = [
    { emoji: '🏛️', label: 'Musées Paris', prompt: 'Quels musées à Paris pour enfants ?' },
    { emoji: '🌳', label: 'Parcs Paris', prompt: 'Meilleurs parcs à Paris pour famille' },
    { emoji: '📅', label: 'Organisation', prompt: 'Comment organiser notre semaine à Paris ?' },
    { emoji: '🍽️', label: 'Repas équilibrés', prompt: 'Idées repas équilibrés pour enfants' }
  ];

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="ai-avatar">
          <span>✨</span>
        </div>
        <div className="ai-info">
          <h1>Nesti IA</h1>
          <p>Votre assistant familial bienveillant</p>
        </div>
      </div>

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

      <div className="chat-input">
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
          {loading ? <div className="send-loading"></div> : '➤'}
        </button>
      </div>
    </div>
  );
}
