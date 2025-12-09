import React, { useState, useRef, useEffect } from "react";
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import ChatMessage from "../components/ChatMessage";
import "./NestiIA.css";

// Mock initial messages
const initialMessages = [
  {
    id: 1,
    content: "Bienvenue ! 👋\n\nJe suis Nesti, votre assistant familial intelligent. Je peux vous aider à organiser vos activités, trouver des suggestions personnalisées, et bien plus encore !\n\nQue puis-je faire pour vous aujourd'hui ?",
    isUser: false,
    time: "10:30",
    suggestions: [
      "Trouver une activité pour ce weekend",
      "Organiser un événement familial",
      "Suggestions d'activités sportives"
    ]
  }
];

export default function NestiIA() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newUserMessage = {
      id: messages.length + 1,
      content: inputValue,
      isUser: true,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newUserMessage]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        content: "Je comprends votre demande. Voici quelques suggestions d'activités qui pourraient vous intéresser :\n\n• Stage de football pour Emma\n• Atelier de peinture familial\n• Randonnée en nature\n\nSouhaitez-vous plus de détails sur l'une de ces activités ?",
        isUser: false,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="nesti-ia-page">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-content">
          <span className="ai-icon-large">✨</span>
          <div className="chat-header-info">
            <h2 className="chat-title">Nesti IA</h2>
            <span className="chat-badge">Assistant familial</span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="chat-messages-container">
        <div className="chat-messages">
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              isUser={message.isUser} 
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <div className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            placeholder="Posez votre question à Nesti..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="send-btn" 
            onClick={handleSend}
            disabled={!inputValue.trim()}
          >
            <PaperAirplaneIcon className="icon-md" />
          </button>
        </div>
      </div>
    </div>
  );
}
