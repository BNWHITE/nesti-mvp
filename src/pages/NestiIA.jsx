import { useState, useRef, useEffect } from "react";
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid';
import './NestiIA.css';

// Intelligent responses based on context
const getSmartResponse = (userMessage) => {
  const lowerMsg = userMessage.toLowerCase();
  
  // Activity suggestions
  if (lowerMsg.includes('activit') || lowerMsg.includes('faire') || lowerMsg.includes('idée')) {
    return "Je peux vous suggérer plusieurs activités familiales ! Que diriez-vous de :\n\n🎨 Atelier créatif en famille\n⚽ Sortie sportive au parc\n🍳 Cours de cuisine ensemble\n🎭 Visite culturelle\n\nQuelle tranche d'âge concerne votre recherche ?";
  }
  
  // Organization help
  if (lowerMsg.includes('organis') || lowerMsg.includes('planif') || lowerMsg.includes('agenda')) {
    return "Pour mieux organiser votre vie familiale, je vous recommande de :\n\n1. Utiliser l'Agenda pour planifier vos événements\n2. Créer des rappels pour les tâches importantes\n3. Partager les responsabilités entre membres\n4. Prévoir des moments en famille réguliers\n\nSur quoi avez-vous besoin d'aide spécifiquement ?";
  }
  
  // Education
  if (lowerMsg.includes('éducat') || lowerMsg.includes('école') || lowerMsg.includes('devoirs') || lowerMsg.includes('apprend')) {
    return "Pour accompagner l'éducation de vos enfants, voici quelques conseils :\n\n📚 Créez une routine de devoirs régulière\n⏰ Fixez des horaires d'étude adaptés\n🎯 Encouragez l'autonomie progressive\n👨‍👩‍👧 Restez impliqué et disponible\n\nQuel est votre principal défi éducatif ?";
  }
  
  // Communication
  if (lowerMsg.includes('communic') || lowerMsg.includes('parler') || lowerMsg.includes('dialog')) {
    return "La communication familiale est essentielle ! Quelques astuces :\n\n💬 Organisez des moments d'échange réguliers\n👂 Pratiquez l'écoute active\n🤝 Respectez les opinions de chacun\n📱 Utilisez le Fil Familial pour partager\n\nQue souhaitez-vous améliorer dans votre communication ?";
  }
  
  // Default responses
  const defaultResponses = [
    "Je suis là pour vous aider ! Posez-moi des questions sur l'organisation familiale, les activités, l'éducation ou la communication. 😊",
    "Excellent ! Je peux vous conseiller sur de nombreux aspects de la vie familiale. Que voulez-vous savoir ?",
    "Avec plaisir ! Je suis spécialisé dans l'aide aux familles. Comment puis-je vous accompagner ?",
    "Je comprends. Donnez-moi plus de détails et je vous proposerai des solutions adaptées à votre famille."
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

export default function NestiIA() {
  const [msg, setMsg] = useState("");
  const [log, setLog] = useState([
    {
      role: "assistant",
      content: "👋 Bonjour ! Je suis Nesti IA, votre assistant familial intelligent.\n\nJe peux vous aider avec :\n• 🎯 Suggestions d'activités personnalisées\n• 📅 Organisation et planification\n• 📚 Conseils éducatifs\n• 💬 Communication familiale\n\nComment puis-je vous aider aujourd'hui ?"
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

    // Call real API
    try {
      const r = await fetch("/api/nesti-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await r.json();
      
      // Extract response from the expected format
      const reply = data?.response || "Désolé, je n'ai pas pu répondre. Veuillez réessayer.";
      setLog(l => [...l, { role: "assistant", content: reply }]);
      setIsTyping(false);
    } catch (err) {
      console.error("Error calling Nesti AI:", err);
      // Fallback to local smart response if API fails
      const fallbackResponse = getSmartResponse(userMessage);
      setLog(l => [...l, { role: "assistant", content: `${fallbackResponse}\n\n⚠️ (Service temporairement indisponible - Réponse locale)` }]);
      setIsTyping(false);
    }
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
                🤖
              </div>
            )}
            <div className="message-bubble">
              <p className="message-content" style={{ whiteSpace: 'pre-line' }}>{m.content}</p>
            </div>
            {m.role === "user" && (
              <div className="message-avatar user-avatar">
                👤
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="message assistant-message">
            <div className="message-avatar assistant-avatar">🤖</div>
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
