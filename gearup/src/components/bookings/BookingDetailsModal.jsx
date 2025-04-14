import React from 'react';
import BookingStatusBadge from './BookingStatusBadge';

const BookingDetailsModal = ({ booking, isOpen, onClose, workers, onStatusChange, theme }) => {
  if (!isOpen || !booking) return null;

  const assignedWorker = workers.find(w => w.id === booking.worker_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        className={`relative w-full max-w-2xl rounded-lg shadow-lg p-6 ${
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-bold mb-4">Booking Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Booking ID</p>
            <p className="font-medium">{booking.id}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Service Type</p>
            <p className="font-medium">{booking.service_type}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <BookingStatusBadge status={booking.status} />
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Payment Status</p>
            <p className={
              booking.payment_status === 'PAID' ? 'text-green-500 font-medium' :
              booking.payment_status === 'PENDING' ? 'text-yellow-500 font-medium' :
              booking.payment_status === 'REFUNDED' ? 'text-blue-500 font-medium' : 'text-red-500 font-medium'
            }>
              {booking.payment_status}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled Time</p>
            <p className="font-medium">{new Date(booking.scheduled_time).toLocaleString()}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Assigned Worker</p>
            <p className="font-medium">
              {assignedWorker ? assignedWorker.name : 'Unassigned'}
            </p>
          </div>
          
          {booking.vehicle_info && (
            <>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Vehicle Make</p>
                <p className="font-medium">{booking.vehicle_info.make}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Vehicle Model</p>
                <p className="font-medium">{booking.vehicle_info.model}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Vehicle Year</p>
                <p className="font-medium">{booking.vehicle_info.year}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">License Plate</p>
                <p className="font-medium">{booking.vehicle_info.license_plate}</p>
              </div>
            </>
          )}
          
          {booking.customer_info && (
            <>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customer Name</p>
                <p className="font-medium">{booking.customer_info.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customer Phone</p>
                <p className="font-medium">{booking.customer_info.phone}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customer Email</p>
                <p className="font-medium">{booking.customer_info.email}</p>
              </div>
            </>
          )}
        </div>

        {booking.notes && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
            <p className="font-medium">{booking.notes}</p>
          </div>
        )}
        
        <div className="border-t pt-4 mt-4">
          <h3 className="font-bold mb-3">Update Status</h3>
          <div className="flex flex-wrap gap-2">
            {booking.status !== 'CONFIRMED' && booking.status !== 'CANCELLED' && (
              <button 
                onClick={() => onStatusChange(booking.id, 'CONFIRMED')}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Confirm
              </button>
            )}
            
            {booking.status !== 'IN_PROGRESS' && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
              <button 
                onClick={() => onStatusChange(booking.id, 'IN_PROGRESS')}
                className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              >
                Start Work
              </button>
            )}
            
            {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
              <button 
                onClick={() => onStatusChange(booking.id, 'COMPLETED')}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Complete
              </button>
            )}
            
            {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
              <button 
                onClick={() => onStatusChange(booking.id, 'CANCELLED')}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;