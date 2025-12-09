import React, { useState } from "react";
import ChatMessage from "../components/ChatMessage";
import "./NestiIA.css";

// Mock messages
const initialMessages = [
  {
    isUser: false,
    content: "Bienvenue ! 👋\n\nJe suis Nesti, votre assistant familial intelligent. Je peux vous aider à organiser vos activités, trouver des idées et répondre à vos questions sur la vie familiale.",
    time: '10:00',
    suggestions: []
  }
];

const mockSuggestions = [
  {
    icon: '⚽',
    title: 'Stage de Football',
    subtitle: '15-20 Juillet • 2.5 km'
  },
  {
    icon: '🎨',
    title: 'Atelier Peinture',
    subtitle: 'Mercredis • 1.2 km'
  }
];

export default function NestiIA() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      isUser: true,
      content: input,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    const nestiResponse = {
      isUser: false,
      content: "Voici quelques suggestions d'activités qui pourraient vous intéresser basées sur vos préférences :",
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      suggestions: mockSuggestions
    };

    setMessages([...messages, userMessage, nestiResponse]);
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="nesti-ia-page">
      <div className="nesti-header">
        <div className="nesti-icon-large">✨</div>
        <div className="nesti-title-group">
          <h1>Nesti IA</h1>
          <span className="nesti-badge">Assistant familial</span>
        </div>
      </div>

      <div className="chat-container">
        {messages.map((message, idx) => (
          <ChatMessage key={idx} message={message} isUser={message.isUser} />
        ))}
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Posez une question à Nesti..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="send-btn" onClick={handleSend}>
          <span>📤</span>
        </button>
      </div>
    </div>
  );
}
