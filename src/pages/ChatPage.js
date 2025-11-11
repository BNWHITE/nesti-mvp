import './ChatPage.css';

export default function ChatPage() {
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
        <div className="message ai-message">
          <div className="message-avatar">✨</div>
          <div className="message-content">
            <p>Bonjour ! Je suis Nesti, votre assistant familial. Je peux vous aider à :</p>
            <div className="suggestion-cards">
              <div className="suggestion-card">
                <span>🎯</span>
                <div>
                  <strong>Proposer des activités</strong>
                  <p>Adaptées à chaque membre</p>
                </div>
              </div>
              <div className="suggestion-card">
                <span>📅</span>
                <div>
                  <strong>Organiser votre agenda</strong>
                  <p>Équilibre vie pro/perso</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <button className="quick-btn">🎨 Activités créatives</button>
        <button className="quick-btn">⚽ Sports</button>
        <button className="quick-btn">🍽️ Restaurants</button>
        <button className="quick-btn">🎭 Culture</button>
      </div>

      <div className="chat-input">
        <button className="voice-btn">🎤</button>
        <input 
          type="text" 
          placeholder="Posez une question à Nesti..."
          className="message-input"
        />
        <button className="send-btn">➤</button>
      </div>
    </div>
  );
}
