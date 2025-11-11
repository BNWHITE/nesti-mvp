import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import './ChatPage.css';

export default function ChatPage({ user, familyId }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Messages de bienvenue initiaux
  const getWelcomeMessages = useCallback(() => {
    return [
      {
        id: 1,
        type: 'ai',
        content: `Bonjour ${user?.user_metadata?.first_name || ''} ! 👋 Je suis Nesti, votre assistant familial bienveillant.`,
        timestamp: new Date(),
        suggestions: [
          {
            title: "Proposer des activités",
            description: "Adaptées à chaque membre",
            prompt: "Propose des activités adaptées pour aujourd'hui",
            emoji: "🎯"
          },
          {
            title: "Organiser l'agenda", 
            description: "Équilibre vie pro/perso",
            prompt: "Aide-moi à organiser notre semaine",
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

  // 🔥 VERSION SIMULÉE SANS API EXTERNE
  const callNestiAI = async (prompt) => {
    setLoading(true);

    // Simulation de chargement
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // RÉPONSES PRÉDÉFINIES INTELLIGENTES
      const responses = {
        'bonjour': `Bonjour ${user?.user_metadata?.first_name || ''} ! 👋 
Je suis ravi de vous retrouver ! Comment puis-je vous aider aujourd'hui ?

🎯 **Activités adaptées** pour vos enfants
📅 **Organisation** de votre semaine familiale  
💡 **Conseils éducatifs** bienveillants
🏡 **Aménagement** d'espaces calmes
🍽️ **Idées repas** équilibrés et rapides

De quoi avez-vous besoin ? ✨`,

        'activité': `Voici des activités adaptées selon les moments : 🎯

**Pour aujourd'hui (activités calmes) :**
• **Parc de Bercy** - 30 min - Espaces verts apaisants
• **Lecture interactive** - 20 min - Histoires participatives  
• **Puzzle sensoriel** - 25 min - Développe la concentration
• **Dessin libre** - 15 min - Expression créative

**Pour ce week-end (sorties) :**
• **Musée en famille** - Visite avec livret jeu
• **Atelier cuisine** - Recette simple ensemble
• **Jeu en extérieur** - Parc avec aires de jeux

**Conseil :** Alternez activités calmes et dynamiques pour maintenir l'équilibre.`,

        'organisation': `Voici un modèle d'organisation équilibrée : 📅

**Semaine type recommandée :**
• **Lundi** : Devoirs (20min) + Temps calme (15min)
• **Mardi** : Sport doux (30min) + Jeux créatifs  
• **Mercredi** : Sortie découverte (1h) + Repos
• **Jeudi** : Jeux société (30min) + Lecture
• **Vendredi** : Temps libre + Bilan semaine

**Astuces :**
• Utilisez des timer visuels
• Créez des routines stables
• Prévoir des transitions douces
• Célébrez les petites réussites`,

        'conseil': `En tant qu'assistant familial, je vous recommande : 💡

**Pour le quotidien :**
• Établir des routines visuelles stables
• Créer des espaces calmes dédiés
• Utiliser des minuteurs pour les transitions
• Verbaliser les émotions ensemble

**Communication :**
• Reformuler ce que l'enfant exprime
• Valoriser les efforts plus que les résultats
• Maintenir un ton positif et encourageant
• Prendre le temps des retrouvailles`,

        'repas': `Idées de repas équilibrés et appréciés : 🍽️

**Rapides (15-20 min) :**
• Omelette aux légumes + salade
• Wrap poulet/avocat + crudités
• Pâtes complètes sauce tomate maison

**Plats familiaux :**
• Bowl de riz + protéines + légumes
• Mini-pizzas sur pain pita
• Parmentier de patate douce

**Astuces :**
• Impliquer les enfants dans la préparation
• Présentation ludique et colorée
• Goûter ensemble sans distraction`,

        'default': `Je comprends votre demande ! 🤔

En tant qu'assistant familial Nesti, je peux vous aider sur :

🎯 **Activités adaptées** - Selon âges et besoins
📅 **Organisation** - Planning et routines  
💡 **Conseils éducatifs** - Communication positive
🏡 **Environnement** - Espaces calmes et stimulants
🍽️ **Nutrition** - Repas équilibrés et pratiques
😴 **Sommeil** - Routines du coucher apaisantes

**Pour une réponse plus précise, dites-moi :**
• L'âge des enfants concernés ?
• Le type de besoin (calme, énergie, créativité) ?
• Le moment de la journée ?

Je suis là pour vous accompagner ! 💫`
      };

      const lowerPrompt = prompt.toLowerCase();
      
      if (lowerPrompt.includes('bonjour') || lowerPrompt.includes('salut') || lowerPrompt.includes('coucou')) 
        return responses.bonjour;
      if (lowerPrompt.includes('activité') || lowerPrompt.includes('sortie') || lowerPrompt.includes('jeu') || lowerPrompt.includes('loisir'))
        return responses.activité;
      if (lowerPrompt.includes('organisation') || lowerPrompt.includes('agenda') || lowerPrompt.includes('planning') || lowerPrompt.includes('semaine'))
        return responses.organisation;
      if (lowerPrompt.includes('conseil') || lowerPrompt.includes('aide') || lowerPrompt.includes('problème') || lowerPrompt.includes('difficulté'))
        return responses.conseil;
      if (lowerPrompt.includes('repas') || lowerPrompt.includes('manger') || lowerPrompt.includes('cuisine') || lowerPrompt.includes('nourriture'))
        return responses.repas;
      
      return responses.default;

    } catch (error) {
      console.error('Erreur IA:', error);
      return `Je suis désolé, je rencontre un petit problème technique. 😔

Mais je peux toujours vous aider ! Voici ce que je propose :

🎯 **Activités adaptées** pour tous les âges
📅 **Organisation** du temps familial
💡 **Conseils** éducatifs bienveillants  
🍽️ **Idées repas** équilibrés et rapides

Que souhaitez-vous explorer ensemble ? ✨`;
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
    
    // Réponse IA
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

  // 🔥 CORRECTION DE LA FONCTION formatMessageContent
  const formatMessageContent = (content) => {
    if (!content || typeof content !== 'string') {
      return <div>Message non disponible</div>;
    }

    return content.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        return <br key={index} />;
      }
      
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        return (
          <div key={index} className="message-bullet">
            • {trimmedLine.substring(1).trim()}
          </div>
        );
      }
      
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        return (
          <div key={index} className="message-bold">
            {trimmedLine.replace(/\*\*/g, '')}
          </div>
        );
      }
      
      return <div key={index}>{line}</div>;
    });
  };

  const quickActions = [
    { emoji: '🎨', label: 'Activités calmes', prompt: 'Propose des activités calmes pour cet après-midi' },
    { emoji: '⚽', label: 'Sports adaptés', prompt: 'Quels sports pour un enfant plein d énergie' },
    { emoji: '🍽️', label: 'Idées repas', prompt: 'Donne des idées de repas équilibrés et rapides' },
    { emoji: '📅', label: 'Organisation', prompt: 'Comment organiser notre semaine familiale' }
  ];

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
