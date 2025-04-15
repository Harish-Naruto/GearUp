import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  UserGroupIcon, 
  StarIcon, 
  BellIcon 
} from '@heroicons/react/outline';

import { CalendarDaysIcon, Wrench } from 'lucide-react';
import './ManagerDashboard.css';

const ManagerDashboardPage = () => {
  const [garageData, setGarageData] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Get manager profile which includes their garage
        const profileResponse = await axios.get('http://localhost:3000/api/v1/users/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (profileResponse.data.data.garage) {
          setGarageData(profileResponse.data.data.garage);
          
          // Get workers for this garage
          const workersResponse = await axios.get('http://localhost:3000/api/v1/workers', {
            params: { garage_id: profileResponse.data.data.garage.id },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setWorkers(workersResponse.data.data.workers);
          
          // Get recent bookings (simplified - actual endpoint might differ)
          const bookingsResponse = await axios.get('http://localhost:3000/api/v1/bookings', {
            params: { 
              garage_id: profileResponse.data.data.garage.id,
              limit: 5
            },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setRecentBookings(bookingsResponse.data.data.bookings);
        }
        
        // Get notifications
        const notificationsResponse = await axios.get('http://localhost:3000/api/v1/users/notifications', {
          params: { read: false, limit: 5 },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setNotifications(notificationsResponse.data.data.notifications);
        
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setIsLoading(false);
        console.error(err);
      }
    };

    fetchDashboardData();
  }, []);

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.patch(`http://localhost:3000/api/v1/users/notifications/${notificationId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Update notifications list
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-box">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!garageData) {
    return (
      <div className="empty-state">
        <Wrench className="empty-icon" />
        <h2 className="empty-title">No Garage Found</h2>
        <p className="empty-message">
          You don't have a garage yet. Create one to start managing services.
        </p>
        <Link
          to="/manager/garage/create"
          className="create-button"
        >
          Create Garage
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1 className="garage-name">{garageData.name}</h1>
        <p className="garage-address">{garageData.location.address}</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <CalendarDaysIcon className="stat-icon h-5 w-5" />
            <h3 className="stat-title">Today's Bookings</h3>
          </div>
          <p className="stat-value">
            {recentBookings.filter(b => 
              new Date(b.scheduled_time).toDateString() === new Date().toDateString()
            ).length}
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <UserGroupIcon className="stat-icon h-5 w-5" />
            <h3 className="stat-title">Active Workers</h3>
          </div>
          <p className="stat-value">
            {workers.filter(w => w.status === 'ACTIVE').length}
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <Wrench className="stat-icon h-5 w-5" />
            <h3 className="stat-title">Services Offered</h3>
          </div>
          <p className="stat-value">
            {garageData.services ? garageData.services.length : 0}
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <StarIcon className="stat-icon h-5 w-5" />
            <h3 className="stat-title">Average Rating</h3>
          </div>
          <p className="stat-value">
            {garageData.ratings ? garageData.ratings.toFixed(1) : 'No ratings'}
          </p>
        </div>
      </div>

      <div className="content-grid">
        {/* Recent Bookings */}
        <div>
          <div className="dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Recent Bookings</h2>
            </div>
            <div className="card-body">
              {recentBookings.length > 0 ? (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Service</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>{booking.users?.email || 'Customer'}</td>
                          <td>{booking.service_details?.name || 'Service'}</td>
                          <td>{new Date(booking.scheduled_time).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge ${
                              booking.status === 'CONFIRMED' ? 'status-confirmed' :
                              booking.status === 'PENDING' ? 'status-pending' :
                              booking.status === 'CANCELLED' ? 'status-cancelled' :
                              'status-completed'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-4">No recent bookings found</p>
              )}
            </div>
            <div className="card-footer">
              <Link to="/manager/bookings" className="view-all">
                View All Bookings
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Quick Actions</h2>
            </div>
            <div className="card-body">
              <div className="actions-grid">
                <Link 
                  to="/manager/garage" 
                  className="action-link action-blue"
                >
                  <div className="action-icon">
                    <Wrench />
                  </div>
                  <div className="action-text">
                    <h3>Manage Garage</h3>
                    <p>Update services and details</p>
                  </div>
                </Link>
                
                <Link 
                  to="/manager/workers" 
                  className="action-link action-green"
                >
                  <div className="action-icon">
                    <UserGroupIcon className="h-8 w-8" />
                  </div>
                  <div className="action-text">
                    <h3>Manage Workers</h3>
                    <p>View and assign workers</p>
                  </div>
                </Link>
                
                <Link 
                  to="/manager/bookings/new" 
                  className="action-link action-purple"
                >
                  <div className="action-icon">
                    <CalendarDaysIcon />
                  </div>
                  <div className="action-text">
                    <h3>Create Booking</h3>
                    <p>Schedule a new service</p>
                  </div>
                </Link>
                
                <Link 
                  to="/manager/reports" 
                  className="action-link action-yellow"
                >
                  <div className="action-icon">
                    <StarIcon className="h-8 w-8" />
                  </div>
                  <div className="action-text">
                    <h3>View Reports</h3>
                    <p>Analytics and performance</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Panel */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Notifications</h2>
            <BellIcon className="h-5 w-5" />
          </div>
          <div className="card-body">
            {notifications.length > 0 ? (
              <ul className="notifications-list">
                {notifications.map(notification => (
                  <li key={notification.id} className="notification-item">
                    <div className="notification-content">
                      <div>
                        <p className="notification-message">
                          {notification.content.message}
                        </p>
                        <p className="notification-time">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="mark-read-btn"
                      >
                        Mark as read
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-4">No new notifications</p>
            )}
          </div>
          <div className="card-footer">
            <Link 
              to="/notifications" 
              className="view-all"
            >
              View All Notifications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardPage;