import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
 
  UserGroupIcon, 
  StarIcon, 
  BellIcon 
} from '@heroicons/react/outline';

import { CalendarDaysIcon,Wrench } from 'lucide-react';


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
        const profileResponse = await axios.get('/api/v1/users/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (profileResponse.data.data.garage) {
          setGarageData(profileResponse.data.data.garage);
          
          // Get workers for this garage
          const workersResponse = await axios.get('/api/v1/workers', {
            params: { garage_id: profileResponse.data.data.garage.id },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setWorkers(workersResponse.data.data.workers);
          
          // Get recent bookings (simplified - actual endpoint might differ)
          const bookingsResponse = await axios.get('/api/v1/bookings', {
            params: { 
              garage_id: profileResponse.data.data.garage.id,
              limit: 5
            },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setRecentBookings(bookingsResponse.data.data.bookings);
        }
        
        // Get notifications
        const notificationsResponse = await axios.get('/api/v1/users/notifications', {
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
      await axios.patch(`/api/v1/users/notifications/${notificationId}`, {}, {
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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!garageData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4">
        <Wrench className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Garage Found</h2>
        <p className="text-gray-600 mb-6 text-center">
          You don't have a garage yet. Create one to start managing services.
        </p>
        <Link
          to="/manager/garage/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Create Garage
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{garageData.name}</h1>
        <p className="text-gray-600">{garageData.location.address}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-2">
            <CalendarDaysIcon className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="font-semibold text-gray-700">Today's Bookings</h3>
          </div>
          <p className="text-2xl font-bold">
            {recentBookings.filter(b => 
              new Date(b.scheduled_time).toDateString() === new Date().toDateString()
            ).length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-2">
            <UserGroupIcon className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="font-semibold text-gray-700">Active Workers</h3>
          </div>
          <p className="text-2xl font-bold">
            {workers.filter(w => w.status === 'ACTIVE').length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-2">
            <Wrench className="h-5 w-5 text-purple-500 mr-2" />
            <h3 className="font-semibold text-gray-700">Services Offered</h3>
          </div>
          <p className="text-2xl font-bold">
            {garageData.services ? garageData.services.length : 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-2">
            <StarIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="font-semibold text-gray-700">Average Rating</h3>
          </div>
          <p className="text-2xl font-bold">
            {garageData.ratings ? garageData.ratings.toFixed(1) : 'No ratings'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Recent Bookings</h2>
            </div>
            <div className="p-4">
              {recentBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {booking.users?.email || 'Customer'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {booking.service_details?.name || 'Service'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {new Date(booking.scheduled_time).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5
                              font-semibold rounded-full
                              ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'}`
                            }>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent bookings found</p>
              )}
              <div className="mt-4 text-right">
                <Link 
                  to="/manager/bookings" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Bookings
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Quick Actions</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                to="/manager/garage" 
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
              >
                <Wrench className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold">Manage Garage</h3>
                  <p className="text-sm text-gray-600">Update services and details</p>
                </div>
              </Link>
              
              <Link 
                to="/manager/workers" 
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
              >
                <UserGroupIcon className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h3 className="font-semibold">Manage Workers</h3>
                  <p className="text-sm text-gray-600">View and assign workers</p>
                </div>
              </Link>
              
              <Link 
                to="/manager/bookings/new" 
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
              >
                <CalendarDaysIcon className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <h3 className="font-semibold">Create Booking</h3>
                  <p className="text-sm text-gray-600">Schedule a new service</p>
                </div>
              </Link>
              
              <Link 
                to="/manager/reports" 
                className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition"
              >
                <StarIcon className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <h3 className="font-semibold">View Reports</h3>
                  <p className="text-sm text-gray-600">Analytics and performance</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Notifications Panel */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Notifications</h2>
            <BellIcon className="h-5 w-5 text-gray-500" />
          </div>
          <div className="p-4">
            {notifications.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {notifications.map(notification => (
                  <li key={notification.id} className="py-4">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.content.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark as read
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">No new notifications</p>
            )}
            <div className="mt-4 text-right">
              <Link 
                to="/notifications" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Notifications
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardPage;