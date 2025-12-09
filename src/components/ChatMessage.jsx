import React from 'react';
import './ChatMessage.css';

const ChatMessage = ({ message, isUser }) => {
  const { content, time = '10:30', suggestions = [] } = message;

  return (
    <div className={`chat-message ${isUser ? 'user' : 'nesti'}`}>
      {!isUser && (
        <div className="message-avatar">
          <div className="nesti-icon">✨</div>
        </div>
      )}
      
      <div className="message-content-wrapper">
        <div className="message-bubble">
          {content}
        </div>
        
        {suggestions && suggestions.length > 0 && (
          <div className="message-suggestions">
            {suggestions.map((suggestion, idx) => (
              <div key={idx} className="suggestion-card">
                <div className="suggestion-icon">{suggestion.icon}</div>
                <div className="suggestion-info">
                  <div className="suggestion-title">{suggestion.title}</div>
                  <div className="suggestion-subtitle">{suggestion.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="message-time">{time}</div>
      </div>

      {isUser && (
        <div className="message-avatar">
          <div className="avatar avatar-sm">S</div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
