import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './BookingListPage.css';

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
      case 'PENDING': return 'status-badge status-pending';
      case 'CONFIRMED': return 'status-badge status-confirmed';
      case 'IN_PROGRESS': return 'status-badge status-in-progress';
      case 'COMPLETED': return 'status-badge status-completed';
      case 'CANCELLED': return 'status-badge status-cancelled';
      default: return 'status-badge';
    }
  };

  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case 'PAID': return 'status-badge payment-paid';
      case 'PENDING': return 'status-badge payment-pending';
      case 'REFUNDED': return 'status-badge payment-refunded';
      case 'FAILED': return 'status-badge payment-failed';
      default: return 'status-badge';
    }
  };

  return (
    <div className="container">
      <div className="header-container">
        <h1 className="page-title">My Bookings</h1>
        <Link 
          to="/bookings/new" 
          className="create-booking-btn"
        >
          Book Service
        </Link>
      </div>

      <div className="filters-container">
        <h2 className="filters-title">Filters</h2>
        <div className="filters-grid">
          <div>
            <label className="filter-label">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="filter-select"
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
            <label className="filter-label">Payment Status</label>
            <select
              name="payment_status"
              value={filters.payment_status}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Payment Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="REFUNDED">Refunded</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          
          <div>
            <label className="filter-label">Sort By</label>
            <select
              value={sort}
              onChange={handleSortChange}
              className="filter-select"
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
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-text">No bookings found. Create a new booking to get started.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="bookings-table">
            <thead>
              <tr className="table-header">
                <th className="table-header-cell">Service</th>
                <th className="table-header-cell">Garage</th>
                <th className="table-header-cell">Scheduled Time</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Payment</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="table-row">
                  <td className="table-cell">{booking.service_type}</td>
                  <td className="table-cell">{booking.garages?.name || 'N/A'}</td>
                  <td className="table-cell">{formatDate(booking.scheduled_time)}</td>
                  <td className="table-cell">
                    <span className={getStatusBadgeClass(booking.status)}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={getPaymentStatusBadgeClass(booking.payment_status)}>
                      {booking.payment_status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <Link 
                      to={`/bookings/${booking.id}`}
                      className="action-link view-link"
                    >
                      View
                    </Link>
                    {booking.status === 'PENDING' && (
                      <Link 
                        to={`/bookings/${booking.id}/edit`}
                        className="action-link edit-link"
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
                        className="cancel-button"
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