// src/pages/ChatPage.js (UX/UI REFONTE)

import { useState, useRef, useEffect } from 'react';
import './ChatPage.css'; 

const AI_API_URL = '/api/nesti-ai';

const ChatPage = ({ user, familyId }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Nesti', text: "Bonjour ! Je suis Nesti, votre assistant familial expert en activités et organisation. Comment puis-je vous aider aujourd'hui ?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const firstName = user?.first_name || 'Utilisateur'; 

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (input.trim() === '' || isTyping) return;

    const userMessage = { id: Date.now(), sender: firstName, text: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.text,
          userContext: {
            userId: user.id,
            familyId: familyId,
            userName: firstName
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.statusText}`);
      }

      const data = await response.json();
      
      const aiResponse = { 
        id: Date.now() + 1, 
        sender: 'Nesti', 
        text: data.response || "Désolé, je n'ai pas pu générer de réponse.", 
        timestamp: new Date() 
      };

      setMessages(prev => [...prev, aiResponse]);

    } catch (error) {
      const errorMessage = { 
        id: Date.now() + 1, 
        sender: 'Nesti', 
        text: "🚨 Oups ! Je rencontre un problème de connexion avec OpenAI. Veuillez réessayer plus tard.", 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-window">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-row ${msg.sender === 'Nesti' ? 'nesti-msg' : 'user-msg'}`}>
            <div className="message-bubble">
              <p>{msg.text}</p>
              <span className="message-time">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message-row nesti-msg">
            <div className="message-bubble typing-indicator">
              <p>Nesti est en train d'écrire...</p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez une question à Nesti..."
          disabled={isTyping}
        />
        <button type="submit" disabled={isTyping}>
          {isTyping ? '⏳' : 'Envoyer'}
        </button>
      </form>
    </div>
  );
};

export default ChatPage;
