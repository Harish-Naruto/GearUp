import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import ErrorAlert from '../../components/common/ErrorAlert';
import BookingStatusBadge from '../../components/bookings/BookingStatusBadge';
import BookingDetailsModal from '../../components/bookings/BookingDetailsModal';
import AssignWorkerModal from '../../components/bookings/AssignWorkerModal';
import './BookingManagement.css';

const BookingManagementPage = () => {
  const { user, token } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  useEffect(() => {
    // Verify user is a manager
    if (!user || user.role !== 'MANAGER') {
      navigate('/dashboard');
      return;
    }
    
    fetchData();
  }, [user, token, navigate, statusFilter]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch bookings
      const bookingsResponse = await axios.get('http://localhost:3000/api/v1/bookings', {
        headers: { Authorization: `Bearer ${token}` },
        params: statusFilter !== 'all' ? { status: statusFilter } : {}
      });
      
      setBookings(bookingsResponse.data.data.bookings);
      
      // Fetch workers for the garage
      const workersResponse = await axios.get('http://localhost:3000/api/v1/workers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setWorkers(workersResponse.data.data.workers);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:3000/api/v1/bookings/${bookingId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));
      
      // Close modal if open
      setIsDetailsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking status');
      console.error('Error updating status:', err);
    }
  };
  
  const handleAssignWorker = async (bookingId, workerId) => {
    try {
      // First confirm the booking
      await axios.patch(
        `http://localhost:3000/api/v1/bookings/${bookingId}/status`, 
        { 
          status: 'CONFIRMED',
          worker_id: workerId 
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'CONFIRMED', worker_id: workerId } 
          : booking
      ));
      
      // Close modal
      setIsAssignModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign worker');
      console.error('Error assigning worker:', err);
    }
  };
  
  const openDetailsModal = (booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };
  
  const openAssignModal = (booking) => {
    setSelectedBooking(booking);
    setIsAssignModalOpen(true);
  };
  
  const getFilteredBookings = () => {
    if (statusFilter === 'all') return bookings;
    return bookings.filter(booking => booking.status === statusFilter);
  };
  
  const filteredBookings = getFilteredBookings();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }
  
  return (
    <div className="container">
      <h1 className="page-title">Booking Management</h1>
      
      {error && (
        <div className="error-alert">
          <span className="error-message">{error}</span>
          <button className="close-btn" onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      <div className="management-card">
        <div className="card-body">
          <div className="filter-section">
            <h2 className="filter-title">Filter by Status:</h2>
            <div className="filter-buttons">
              <button 
                onClick={() => setStatusFilter('all')}
                className={`filter-btn ${statusFilter === 'all' ? 'filter-btn-active' : 'filter-btn-inactive'}`}
              >
                All
              </button>
              <button 
                onClick={() => setStatusFilter('PENDING')}
                className={`filter-btn ${statusFilter === 'PENDING' ? 'filter-btn-active' : 'filter-btn-inactive'}`}
              >
                Pending
              </button>
              <button 
                onClick={() => setStatusFilter('CONFIRMED')}
                className={`filter-btn ${statusFilter === 'CONFIRMED' ? 'filter-btn-active' : 'filter-btn-inactive'}`}
              >
                Confirmed
              </button>
              <button 
                onClick={() => setStatusFilter('IN_PROGRESS')}
                className={`filter-btn ${statusFilter === 'IN_PROGRESS' ? 'filter-btn-active' : 'filter-btn-inactive'}`}
              >
                In Progress
              </button>
              <button 
                onClick={() => setStatusFilter('COMPLETED')}
                className={`filter-btn ${statusFilter === 'COMPLETED' ? 'filter-btn-active' : 'filter-btn-inactive'}`}
              >
                Completed
              </button>
              <button 
                onClick={() => setStatusFilter('CANCELLED')}
                className={`filter-btn ${statusFilter === 'CANCELLED' ? 'filter-btn-active' : 'filter-btn-inactive'}`}
              >
                Cancelled
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {filteredBookings.length === 0 ? (
        <div className="empty-state">
          <p className="empty-message">No bookings found with the selected filter.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="bookings-table">
            <thead className="table-header">
              <tr>
                <th>Booking ID</th>
                <th>Service</th>
                <th>Scheduled Time</th>
                <th>Worker</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="table-row">
                  <td className="truncated-id">{booking.id.slice(0, 8)}...</td>
                  <td>{booking.service_type}</td>
                  <td>
                    {new Date(booking.scheduled_time).toLocaleString()}
                  </td>
                  <td>
                    {booking.worker_id ? (
                      workers.find(w => w.id === booking.worker_id)?.name || 'Assigned'
                    ) : (
                      <span className="worker-unassigned">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`payment-${booking.payment_status.toLowerCase()}`}>
                      {booking.payment_status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => openDetailsModal(booking)}
                        className="btn btn-blue"
                      >
                        Details
                      </button>
                      
                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => openAssignModal(booking)}
                          className="btn btn-green"
                        >
                          Assign
                        </button>
                      )}
                      
                      {booking.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleStatusChange(booking.id, 'IN_PROGRESS')}
                          className="btn btn-purple"
                        >
                          Start
                        </button>
                      )}
                      
                      {booking.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleStatusChange(booking.id, 'COMPLETED')}
                          className="btn btn-green"
                        >
                          Complete
                        </button>
                      )}
                      
                      {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                        <button
                          onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                          className="btn btn-red"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {selectedBooking && (
        <>
          {isDetailsModalOpen && (
            <BookingDetailsModal
              booking={selectedBooking}
              isOpen={isDetailsModalOpen}
              onClose={() => setIsDetailsModalOpen(false)}
              workers={workers}
              onStatusChange={handleStatusChange}
            />
          )}
          
          {isAssignModalOpen && (
            <AssignWorkerModal
              booking={selectedBooking}
              workers={workers}
              isOpen={isAssignModalOpen}
              onClose={() => setIsAssignModalOpen(false)}
              onAssign={handleAssignWorker}
            />
          )}
        </>
      )}
    </div>
  );
};

export default BookingManagementPage;