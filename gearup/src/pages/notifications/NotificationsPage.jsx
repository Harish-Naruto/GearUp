import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import './NotificationsPage.css'; // Import the external CSS file

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'read', 'unread'

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = 'http://localhost:3000/api/v1/users/notifications';
      
      // Apply filters
      if (filter === 'read') {
        url += '?read=true';
      } else if (filter === 'unread') {
        url += '?read=false';
      }
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setNotifications(response.data.data.notifications);
    } catch (error) {
      toast.error('Failed to load notifications');
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(`http://localhost:3000/api/v1/users/notifications/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update local state to reflect the change
      setNotifications(notifications.map(notification => 
        notification.id === id 
          ? { ...notification, read_status: true } 
          : notification
      ));
      
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to update notification');
      console.error('Error marking notification as read:', error);
    }
  };

  const formatNotificationTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  // Helper function to safely get notification content
  const getNotificationContent = (notification) => {
    // Check for content property first
    if (notification.content) {
      if (typeof notification.content === 'string') {
        return notification.content;
      } else if (typeof notification.content === 'object') {
        // If content is an object, try to extract message or stringify it
        return notification.content.message || JSON.stringify(notification.content);
      }
    }
    
    // Fall back to message if content is not available
    if (notification.message) {
      if (typeof notification.message === 'string') {
        return notification.message;
      } else if (typeof notification.message === 'object') {
        // If message is an object, try to extract nested message or stringify it
        return notification.message.message || JSON.stringify(notification.message);
      }
    }
    
    // Default fallback
    return 'No content available';
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        
        <div className="filters-container">
          <button 
            className={`filter-button ${filter === 'all' ? 'filter-button-active' : 'filter-button-default'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-button ${filter === 'unread' ? 'filter-button-active' : 'filter-button-default'}`}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          <button 
            className={`filter-button ${filter === 'read' ? 'filter-button-active' : 'filter-button-default'}`}
            onClick={() => setFilter('read')}
          >
            Read
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-message">No notifications found</div>
      ) : (
        <div className="notifications-list">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.read_status ? 'notification-read' : 'notification-unread'}`}
            >
              <div className="notification-header">
                <div>
                  <h3 className="notification-title">{notification.title || 'Notification'}</h3>
                  <p className="notification-time">
                    {formatNotificationTime(notification.created_at)}
                  </p>
                </div>
                
                {!notification.read_status && (
                  <button 
                    onClick={() => markAsRead(notification.id)}
                    className="mark-read-button"
                  >
                    Mark as read
                  </button>
                )}
              </div>
              
              <div className="notification-content">
                <p>{getNotificationContent(notification)}</p>
              </div>
              
              {/* Conditionally render action buttons based on notification type */}
              {notification.action_url && (
                <div className="notification-actions">
                  <a 
                    href={notification.action_url} 
                    className="action-button"
                  >
                    {notification.action_text || 'View'}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;