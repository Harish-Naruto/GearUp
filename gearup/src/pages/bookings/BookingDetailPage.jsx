import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './BookingDetailPage.css'; // Import the CSS file

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('USER');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [workers, setWorkers] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    fetchBookingDetails();
    // Get user role from local storage or context
    const role = localStorage.getItem('userRole') || 'USER';
    setUserRole(role);
    
    if (['MANAGER', 'WORKER'].includes(role)) {
      fetchGarageWorkers();
    }
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/v1/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const bookingData = response.data.data.booking;
      setBooking(bookingData);
      setStatusUpdate(bookingData.status);
      setWorkerId(bookingData.worker_id || '');
      setPaymentStatus(bookingData.payment_status);
      setAmount(bookingData.amount || '');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch booking details');
      console.error('Error fetching booking details:', error);
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchGarageWorkers = async () => {
    try {
      const token = localStorage.getItem('token');
      // This assumes you have an endpoint to fetch workers for a garage
      // You might need to adjust this based on your actual API
      const response = await axios.get(`http://localhost:3000/api/v1/workers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setWorkers(response.data.data.workers);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = { status: statusUpdate };
      
      if (workerId) {
        payload.worker_id = workerId;
      }
      
      await axios.patch(`http://localhost:3000/api/v1/bookings/${id}/status`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Booking status updated successfully');
      fetchBookingDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
      console.error('Error updating status:', error);
    }
  };

  const handlePaymentUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = { 
        payment_status: paymentStatus
      };
      
      if (amount) {
        payload.amount = parseFloat(amount);
      }
      
      await axios.patch(`http://localhost:3000/api/v1/bookings/${id}/payment`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Payment status updated successfully');
      fetchBookingDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update payment status');
      console.error('Error updating payment status:', error);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/v1/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Booking cancelled successfully');
      navigate('/bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
      console.error('Error cancelling booking:', error);
    }
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

  // Helper function to properly display location
  const formatLocation = (location) => {
    if (!location) return 'N/A';
    // Check if location is an object
    if (typeof location === 'object') {
      // If it has an address property, use that
      if (location.address) return location.address;
      // Otherwise, stringify the object but don't render it directly
      return JSON.stringify(location);
    }
    // If it's already a string, just return it
    return location;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container">
        <div className="error-container">
          <p className="error-message">Booking not found.</p>
          <Link to="/bookings" className="back-link">
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="mb-6">
        <Link to="/bookings" className="back-link">
          &larr; Back to Bookings
        </Link>
      </div>

      <div className="booking-card">
        <div className="card-header">
          <div className="card-header-content">
            <h1 className="card-title">Booking Details</h1>
            <div>
              <span className={getStatusBadgeClass(booking.status)}>
                {booking.status}
              </span>
              <span className={`ml-2 ${getPaymentStatusBadgeClass(booking.payment_status)}`}>
                {booking.payment_status}
              </span>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="info-grid">
            <div className="info-section">
              <h2 className="info-section-title">Service Information</h2>
              <div className="info-item">
                <p className="info-label">Service Type</p>
                <p className="info-value">{booking.service_type}</p>
              </div>
              <div className="info-item">
                <p className="info-label">Description</p>
                <p className="info-value">{booking.description || 'No description provided'}</p>
              </div>
              <div className="info-item">
                <p className="info-label">Scheduled Time</p>
                <p className="info-value">{formatDate(booking.scheduled_time)}</p>
              </div>
              <div className="info-item">
                <p className="info-label">Estimated Duration</p>
                <p className="info-value">{booking.estimated_duration || 'Not specified'} minutes</p>
              </div>
              {booking.amount && (
                <div className="info-item">
                  <p className="info-label">Amount</p>
                  <p className="info-value">${booking.amount.toFixed(2)}</p>
                </div>
              )}
            </div>

            <div className="info-section">
              <h2 className="info-section-title">Garage Information</h2>
              <div className="info-item">
                <p className="info-label">Garage Name</p>
                <p className="info-value">{booking.garages?.name || 'N/A'}</p>
              </div>
              <div className="info-item">
                <p className="info-label">Location</p>
                <p className="info-value">{formatLocation(booking.garages?.location)}</p>
              </div>
              {booking.garages?.contact_info && (
                <div className="info-item">
                  <p className="info-label">Contact</p>
                  <p className="info-value">
                    {typeof booking.garages.contact_info === 'object' 
                      ? booking.garages.contact_info.phone || JSON.stringify(booking.garages.contact_info) 
                      : booking.garages.contact_info}
                  </p>
                </div>
              )}
              {booking.workers && (
                <div className="info-item">
                  <p className="info-label">Assigned Worker</p>
                  <p className="info-value">
                    {booking.workers ? `${booking.workers.specialization} Worker` : 'Not assigned yet'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons for user */}
          {userRole === 'USER' && booking.status === 'PENDING' && (
            <div className="button-group">
              <Link 
                to={`/bookings/${booking.id}/edit`}
                className="btn btn-blue"
              >
                Edit Booking
              </Link>
              <button 
                onClick={handleCancelBooking}
                className="btn btn-red"
              >
                Cancel Booking
              </button>
            </div>
          )}
          
          {/* Status management for workers/managers */}
          {(['MANAGER', 'WORKER'].includes(userRole)) && (
            <div className="form-section">
              <h2 className="form-section-title">Update Booking Status</h2>
              <form onSubmit={handleStatusUpdate} className="form-group">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select 
                      value={statusUpdate} 
                      onChange={(e) => setStatusUpdate(e.target.value)}
                      className="form-control"
                      required
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Assign Worker (Optional)</label>
                    <select 
                      value={workerId} 
                      onChange={(e) => setWorkerId(e.target.value)}
                      className="form-control"
                    >
                      <option value="">Select a worker</option>
                      {workers.map(worker => (
                        <option key={worker.id} value={worker.id}>
                          {worker.user?.name || `Worker (${worker.specialization})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <button 
                    type="submit" 
                    className="btn btn-blue"
                  >
                    Update Status
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Payment management (available to managers and potentially the user) */}
          {(['MANAGER', 'ADMIN'].includes(userRole) || 
              (userRole === 'USER' && booking.status === 'COMPLETED' && booking.payment_status === 'PENDING')) && (
            <div className="form-section">
              <h2 className="form-section-title">Update Payment Status</h2>
              <form onSubmit={handlePaymentUpdate} className="form-group">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Payment Status</label>
                    <select 
                      value={paymentStatus} 
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="form-control"
                      required
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="REFUNDED">Refunded</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>
                  
                  {['MANAGER', 'ADMIN'].includes(userRole) && (
                    <div className="form-group">
                      <label className="form-label">Amount ($)</label>
                      <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)}
                        className="form-control"
                        placeholder="Enter amount"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <button 
                    type="submit" 
                    className="btn btn-green"
                  >
                    Update Payment
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;