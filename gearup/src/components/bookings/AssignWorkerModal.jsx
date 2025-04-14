import React, { useState } from 'react';

const AssignWorkerModal = ({ booking, workers, isOpen, onClose, onAssign, theme }) => {
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  
  if (!isOpen || !booking) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedWorkerId) {
      onAssign(booking.id, selectedWorkerId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        className={`relative w-full max-w-md rounded-lg shadow-lg p-6 ${
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

        <h2 className="text-xl font-bold mb-4">Assign Worker</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Booking ID</p>
          <p className="font-medium">{booking.id}</p>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Service Type</p>
          <p className="font-medium">{booking.service_type}</p>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled Time</p>
          <p className="font-medium">{new Date(booking.scheduled_time).toLocaleString()}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Select Worker
            </label>
            
            {workers.length === 0 ? (
              <p className="text-red-500">No workers available</p>
            ) : (
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className={`w-full p-2 border rounded-md ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
                required
              >
                <option value="">-- Select Worker --</option>
                {workers.map(worker => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} - {worker.specialization || 'General'}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded ${
                theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={!selectedWorkerId}
              className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
                !selectedWorkerId ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Assign & Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignWorkerModal;