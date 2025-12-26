// src/components/NotificationBell.js
import { useState, useEffect, useCallback } from 'react';
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from '../services/notificationService';
import './NotificationBell.css';

// Helper pour formater le temps
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `${diffMins}min`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}j`;
};

// Icônes par type de notification
const getNotificationIcon = (type) => {
  switch (type) {
    case 'like': return '❤️';
    case 'comment': return '💬';
    case 'reply': return '↩️';
    case 'share': return '🔗';
    case 'mention': return '@';
    case 'family_invite': return '👨‍👩‍👧';
    default: return '🔔';
  }
};

export default function NotificationBell({ userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;
    const count = await getUnreadCount(userId);
    setUnreadCount(count);
  }, [userId]);

  const fetchNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    
    const { data, error } = await getNotifications(userId, 20);
    if (!error && data) {
      setNotifications(data);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchUnreadCount();
    // Refresh unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleOpen = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    // TODO: Navigation vers le post/commentaire concerné
    // if (notification.post_id) {
    //   navigate(`/post/${notification.post_id}`);
    // }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead(userId);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="notification-bell-container">
      <button className="notification-bell-btn" onClick={handleOpen}>
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="notification-overlay" onClick={handleClose} />
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  className="mark-all-read-btn"
                  onClick={handleMarkAllRead}
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>

            <div className="notification-list">
              {loading && (
                <div className="notification-loading">Chargement...</div>
              )}

              {!loading && notifications.length === 0 && (
                <div className="notification-empty">
                  <span className="empty-icon">🔕</span>
                  <p>Aucune notification</p>
                </div>
              )}

              {!loading && notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? '' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <span className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {formatTimeAgo(notification.created_at)}
                    </span>
                  </div>
                  {!notification.read && (
                    <span className="unread-dot" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
