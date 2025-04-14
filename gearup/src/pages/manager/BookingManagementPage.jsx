import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { Spinner } from 'react-bootstrap';
import ErrorAlert from '../../components/common/ErrorAlert';
import BookingStatusBadge from '../../components/bookings/BookingStatusBadge';
import BookingDetailsModal from '../../components/bookings/BookingDetailsModal';
import AssignWorkerModal from '../../components/bookings/AssignWorkerModal';

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
  
  if (loading) return <Spinner />;
  
  const getFilteredBookings = () => {
    if (statusFilter === 'all') return bookings;
    return bookings.filter(booking => booking.status === statusFilter);
  };
  
  const filteredBookings = getFilteredBookings();
  
  return (
    <div className={`container mx-auto p-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <h1 className="text-2xl font-bold mb-6">Booking Management</h1>
      
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-lg font-semibold">Filter by Status:</h2>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded ${statusFilter === 'all' 
                ? 'bg-blue-600 text-white' 
                : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              All
            </button>
            <button 
              onClick={() => setStatusFilter('PENDING')}
              className={`px-4 py-2 rounded ${statusFilter === 'PENDING' 
                ? 'bg-yellow-500 text-white' 
                : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setStatusFilter('CONFIRMED')}
              className={`px-4 py-2 rounded ${statusFilter === 'CONFIRMED' 
                ? 'bg-blue-500 text-white' 
                : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              Confirmed
            </button>
            <button 
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-4 py-2 rounded ${statusFilter === 'IN_PROGRESS' 
                ? 'bg-indigo-500 text-white' 
                : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              In Progress
            </button>
            <button 
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-4 py-2 rounded ${statusFilter === 'COMPLETED' 
                ? 'bg-green-500 text-white' 
                : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              Completed
            </button>
            <button 
              onClick={() => setStatusFilter('CANCELLED')}
              className={`px-4 py-2 rounded ${statusFilter === 'CANCELLED' 
                ? 'bg-red-500 text-white' 
                : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              Cancelled
            </button>
          </div>
        </div>
      </div>
      
      {filteredBookings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg">No bookings found with the selected filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className={`min-w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-md rounded-lg overflow-hidden`}>
            <thead className={theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}>
              <tr>
                <th className="px-4 py-3 text-left">Booking ID</th>
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-left">Scheduled Time</th>
                <th className="px-4 py-3 text-left">Worker</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr 
                  key={booking.id} 
                  className={`border-b ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-600' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <td className="px-4 py-3">{booking.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3">{booking.service_type}</td>
                  <td className="px-4 py-3">
                    {new Date(booking.scheduled_time).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {booking.worker_id ? (
                      workers.find(w => w.id === booking.worker_id)?.name || 'Assigned'
                    ) : (
                      <span className="text-yellow-500">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <BookingStatusBadge status={booking.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={
                      booking.payment_status === 'PAID' ? 'text-green-500' :
                      booking.payment_status === 'PENDING' ? 'text-yellow-500' :
                      booking.payment_status === 'REFUNDED' ? 'text-blue-500' : 'text-red-500'
                    }>
                      {booking.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openDetailsModal(booking)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Details
                      </button>
                      
                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => openAssignModal(booking)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Assign
                        </button>
                      )}
                      
                      {booking.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleStatusChange(booking.id, 'IN_PROGRESS')}
                          className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                        >
                          Start
                        </button>
                      )}
                      
                      {booking.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleStatusChange(booking.id, 'COMPLETED')}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Complete
                        </button>
                      )}
                      
                      {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                        <button
                          onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
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
          <BookingDetailsModal
            booking={selectedBooking}
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            workers={workers}
            onStatusChange={handleStatusChange}
            theme={theme}
          />
          
          <AssignWorkerModal
            booking={selectedBooking}
            workers={workers}
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            onAssign={handleAssignWorker}
            theme={theme}
          />
        </>
      )}
    </div>
  );
};

export default BookingManagementPage;