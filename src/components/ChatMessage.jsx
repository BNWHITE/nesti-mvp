import React from 'react';
import './ChatMessage.css';

export default function ChatMessage({ message, isUser }) {
  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'assistant-message'}`}>
      {!isUser && (
        <div className="message-avatar">
          <span className="ai-icon">✨</span>
        </div>
      )}
      <div className="message-content">
        <div className="message-bubble">
          <p>{message.content}</p>
          {message.suggestions && (
            <div className="message-suggestions">
              {message.suggestions.map((suggestion, index) => (
                <button key={index} className="suggestion-btn">
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="message-time">{message.time}</span>
      </div>
      {isUser && (
        <div className="message-avatar">
          <span className="user-avatar-icon">S</span>
        </div>
      )}
    </div>
  );
}
