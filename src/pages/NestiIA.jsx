import { useState, useRef, useEffect } from "react";
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid';
import './NestiIA.css';

// Mock responses for demo
const mockResponses = [
  "Bien sûr ! Je peux vous aider avec ça. Que voulez-vous savoir ?",
  "Excellente question ! Voici quelques suggestions...",
  "Je comprends. Laissez-moi vous proposer quelques idées.",
  "C'est une bonne idée ! Voulez-vous que je vous aide à organiser ça ?",
];

export default function NestiIA() {
  const [msg, setMsg] = useState("");
  const [log, setLog] = useState([
    {
      role: "assistant",
      content: "Bonjour ! Je suis Nesti IA, votre assistant familial. Comment puis-je vous aider aujourd'hui ? 😊"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [log]);

  const send = async () => {
    if (!msg.trim()) return;

    const userMessage = msg;
    setMsg("");
    setLog(l => [...l, { role: "user", content: userMessage }]);
    setIsTyping(true);

    // Simulate API call with mock response
    setTimeout(() => {
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      setLog(l => [...l, { role: "assistant", content: randomResponse }]);
      setIsTyping(false);
    }, 1000);

    /* Real API call (uncommented when ready):
    try {
      const r = await fetch("/api/nesti-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await r.json();
      const reply = data?.choices?.[0]?.message?.content || data?.result || "Réponse IA indisponible";
      setLog(l => [...l, { role: "assistant", content: reply }]);
    } catch (err) {
      setLog(l => [...l, { role: "assistant", content: "Erreur serveur" }]);
    }
    setIsTyping(false);
    */
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="nestia-page">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-icon">
          <SparklesIcon className="sparkles-icon" />
        </div>
        <div>
          <h1 className="chat-title">Nesti IA</h1>
          <p className="chat-subtitle">Votre assistant familial intelligent</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {log.map((m, i) => (
          <div key={i} className={`message ${m.role === "user" ? "user-message" : "assistant-message"}`}>
            {m.role === "assistant" && (
              <div className="message-avatar assistant-avatar">
                N
              </div>
            )}
            <div className="message-bubble">
              <p className="message-content">{m.content}</p>
            </div>
            {m.role === "user" && (
              <div className="message-avatar user-avatar">
                M
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="message assistant-message">
            <div className="message-avatar assistant-avatar">N</div>
            <div className="message-bubble typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <input
            className="chat-input"
            value={msg}
            placeholder="Demandez quelque chose à Nesti..."
            onChange={e => setMsg(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="send-btn"
            onClick={send}
            disabled={!msg.trim()}
            aria-label="Envoyer"
          >
            <PaperAirplaneIcon className="send-icon" />
          </button>
        </div>
      </div>
    </div>
  );
}
