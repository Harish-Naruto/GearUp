import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';

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
      
      let url = '/api/v1/users/notifications';
      
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
      
      await axios.patch(`/api/v1/users/notifications/${id}`, {}, {
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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        
        <div className="flex gap-2">
          <button 
            className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`px-3 py-1 rounded ${filter === 'unread' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          <button 
            className={`px-3 py-1 rounded ${filter === 'read' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter('read')}
          >
            Read
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No notifications found</div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-4 rounded-lg shadow border-l-4 ${
                notification.read_status ? 'border-gray-300 bg-white' : 'border-blue-500 bg-blue-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{notification.title || 'Notification'}</h3>
                  <p className="text-gray-600 text-sm">
                    {formatNotificationTime(notification.created_at)}
                  </p>
                </div>
                
                {!notification.read_status && (
                  <button 
                    onClick={() => markAsRead(notification.id)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                  >
                    Mark as read
                  </button>
                )}
              </div>
              
              <div className="mt-2">
                <p>{notification.content || notification.message}</p>
              </div>
              
              {/* Conditionally render action buttons based on notification type */}
              {notification.action_url && (
                <div className="mt-3">
                  <a 
                    href={notification.action_url} 
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
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