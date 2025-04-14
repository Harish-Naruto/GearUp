import React from 'react';
import { X } from 'lucide-react';

const WorkerDetailModal = ({ isOpen, onClose, worker }) => {
  if (!isOpen || !worker) return null;
  
  const formatAvailability = (availability) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days.map(day => {
      const timeSlot = availability?.[day];
      if (!timeSlot || !timeSlot.start || !timeSlot.end) {
        return (
          <div key={day} className="grid grid-cols-3 py-2 border-b last:border-b-0">
            <div className="capitalize font-medium">{day}</div>
            <div className="col-span-2 text-gray-500">Not available</div>
          </div>
        );
      }
      
      return (
        <div key={day} className="grid grid-cols-3 py-2 border-b last:border-b-0">
          <div className="capitalize font-medium">{day}</div>
          <div className="col-span-2">{timeSlot.start} - {timeSlot.end}</div>
        </div>
      );
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'ON_LEAVE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Worker Details</h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Left column */}
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">General Information</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="mb-3">
                    <div className="text-sm text-gray-500">Email</div>
                    <div>{worker.users?.email || 'N/A'}</div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-sm text-gray-500">Garage</div>
                    <div>{worker.garages?.name || 'N/A'}</div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-sm text-gray-500">Location</div>
                    <div>{worker.garages?.location || 'N/A'}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(worker.status)}`}>
                        {worker.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Specializations</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  {worker.specialization && worker.specialization.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {worker.specialization.map((spec, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">No specializations listed</div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right column - Availability */}
            <div>
              <h3 className="text-lg font-medium mb-2">Availability</h3>
              <div className="bg-gray-50 p-3 rounded-md">
                {worker.availability ? (
                  formatAvailability(worker.availability)
                ) : (
                  <div className="text-gray-500">No availability information</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Services offered at garage */}
          {worker.garages?.services && worker.garages.services.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Services at {worker.garages.name}</h3>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex flex-wrap gap-2">
                  {worker.garages.services.map((service, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 text-sm rounded-full bg-gray-200 text-gray-800"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-6">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDetailModal;