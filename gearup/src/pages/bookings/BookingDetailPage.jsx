import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

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
      const response = await axios.get(`/api/v1/bookings/${id}`, {
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
      const response = await axios.get(`/api/v1/workers`, {
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
      
      await axios.patch(`/api/v1/bookings/${id}/status`, payload, {
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
      
      await axios.patch(`/api/v1/bookings/${id}/payment`, payload, {
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
      await axios.delete(`/api/v1/bookings/${id}`, {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-10 text-center">
          <p className="text-gray-500">Booking not found.</p>
          <Link to="/bookings" className="text-blue-500 hover:underline mt-4 inline-block">
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link to="/bookings" className="text-blue-500 hover:underline">
          &larr; Back to Bookings
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Booking Details</h1>
            <div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(booking.status)}`}>
                {booking.status}
              </span>
              <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusBadgeClass(booking.payment_status)}`}>
                {booking.payment_status}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Service Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Service Type</p>
                  <p className="font-medium">{booking.service_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">{booking.description || 'No description provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Scheduled Time</p>
                  <p className="font-medium">{formatDate(booking.scheduled_time)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estimated Duration</p>
                  <p className="font-medium">{booking.estimated_duration || 'Not specified'} minutes</p>
                </div>
                {booking.amount && (
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-medium">${booking.amount.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Garage Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Garage Name</p>
                  <p className="font-medium">{booking.garages?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{booking.garages?.location || 'N/A'}</p>
                </div>
                {booking.garages?.contact_info && (
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{booking.garages.contact_info}</p>
                  </div>
                )}
                {booking.workers && (
                  <div>
                    <p className="text-sm text-gray-500">Assigned Worker</p>
                    <p className="font-medium">
                      {booking.workers ? `${booking.workers.specialization} Worker` : 'Not assigned yet'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons for user */}
          {userRole === 'USER' && booking.status === 'PENDING' && (
            <div className="mt-8 flex items-center space-x-4">
              <Link 
                to={`/bookings/${booking.id}/edit`}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Edit Booking
              </Link>
              <button 
                onClick={handleCancelBooking}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Cancel Booking
              </button>
            </div>
          )}
          
          {/* Status management for workers/managers */}
          {(['MANAGER', 'WORKER'].includes(userRole)) && (
            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Update Booking Status</h2>
              <form onSubmit={handleStatusUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select 
                      value={statusUpdate} 
                      onChange={(e) => setStatusUpdate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign Worker (Optional)</label>
                    <select 
                      value={workerId} 
                      onChange={(e) => setWorkerId(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
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
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
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
            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Update Payment Status</h2>
              <form onSubmit={handlePaymentUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                    <select 
                      value={paymentStatus} 
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="REFUNDED">Refunded</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>
                  
                  {['MANAGER', 'ADMIN'].includes(userRole) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                      <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
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
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
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