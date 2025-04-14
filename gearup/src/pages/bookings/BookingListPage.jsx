import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const BookingListPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    payment_status: ''
  });
  const [sort, setSort] = useState('scheduled_time');

  useEffect(() => {
    fetchBookings();
  }, [filters, sort]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.payment_status) queryParams.append('payment_status', filters.payment_status);
      if (sort) queryParams.append('sort', sort);
      
      const response = await axios.get(`http://localhost:3000/api/v1/bookings?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBookings(response.data.data.bookings);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch bookings');
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REFUNDED': return 'bg-blue-100 text-blue-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <Link 
          to="/bookings/create" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Book Service
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select
              name="payment_status"
              value={filters.payment_status}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All Payment Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="REFUNDED">Refunded</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sort}
              onChange={handleSortChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="scheduled_time">Scheduled Time (Asc)</option>
              <option value="-scheduled_time">Scheduled Time (Desc)</option>
              <option value="created_at">Creation Date (Asc)</option>
              <option value="-created_at">Creation Date (Desc)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-10 text-center">
          <p className="text-gray-500">No bookings found. Create a new booking to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-3 px-4 text-left">Service</th>
                <th className="py-3 px-4 text-left">Garage</th>
                <th className="py-3 px-4 text-left">Scheduled Time</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Payment</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">{booking.service_type}</td>
                  <td className="py-3 px-4">{booking.garages?.name || 'N/A'}</td>
                  <td className="py-3 px-4">{formatDate(booking.scheduled_time)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusBadgeClass(booking.payment_status)}`}>
                      {booking.payment_status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link 
                      to={`/bookings/${booking.id}`}
                      className="text-blue-500 hover:underline mr-3"
                    >
                      View
                    </Link>
                    {booking.status === 'PENDING' && (
                      <Link 
                        to={`/bookings/${booking.id}/edit`}
                        className="text-green-500 hover:underline mr-3"
                      >
                        Edit
                      </Link>
                    )}
                    {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this booking?')) {
                            // Handle cancel logic
                          }
                        }}
                        className="text-red-500 hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingListPage;