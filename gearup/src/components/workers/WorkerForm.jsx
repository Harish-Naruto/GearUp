import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const WorkerForm = ({
  isOpen,
  onClose,
  onSubmit,
  garages,
  specializations,
  initialData = null,
  title = 'Worker Form',
  submitButtonText = 'Submit'
}) => {
  const [formData, setFormData] = useState({
    user_id: '',
    garage_id: '',
    specialization: [],
    availability: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
      saturday: { start: '', end: '' },
      sunday: { start: '', end: '' }
    },
    status: 'ACTIVE'
  });
  
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  
  useEffect(() => {
    if (initialData) {
      // If editing an existing worker
      setFormData({
        ...initialData,
        // Keep user_id and garage_id from initialData
        user_id: initialData.user_id,
        garage_id: initialData.garage_id,
        // Handle specialization array
        specialization: initialData.specialization || [],
        // Handle availability object with defaults if missing
        availability: initialData.availability || {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: { start: '', end: '' },
          sunday: { start: '', end: '' }
        },
        status: initialData.status || 'ACTIVE'
      });
      
      setSelectedSpecializations(initialData.specialization || []);
    }
    
    // Only fetch users when adding a new worker
    if (!initialData) {
      fetchNonWorkerUsers();
    }
  }, [initialData]);
  
  const fetchNonWorkerUsers = async () => {
    try {
      const response = await axios.get('/api/v1/users?role=USER', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setUsers(response.data.data.users);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleAvailabilityChange = (day, field, value) => {
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        [day]: {
          ...formData.availability[day],
          [field]: value
        }
      }
    });
  };
  
  const handleSpecializationToggle = (spec) => {
    const updatedSpecializations = selectedSpecializations.includes(spec)
      ? selectedSpecializations.filter(s => s !== spec)
      : [...selectedSpecializations, spec];
    
    setSelectedSpecializations(updatedSpecializations);
    setFormData({
      ...formData,
      specialization: updatedSpecializations
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      setLoading(false);
    } catch (err) {
      console.error('Error submitting form', err);
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {/* User selection - only show when adding new worker */}
          {!initialData && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">User</label>
              <select
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.email}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Garage selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Garage</label>
            <select
              name="garage_id"
              value={formData.garage_id}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              disabled={initialData} // Disable changing garage if editing
            >
              <option value="">Select a garage</option>
              {garages.map(garage => (
                <option key={garage.id} value={garage.id}>{garage.name}</option>
              ))}
            </select>
          </div>
          
          {/* Specializations */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Specializations</label>
            <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-16">
              {specializations.map(spec => (
                <button
                  key={spec}
                  type="button"
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedSpecializations.includes(spec)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                  onClick={() => handleSpecializationToggle(spec)}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
          
          {/* Status - only show when editing */}
          {initialData && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ON_LEAVE">On Leave</option>
              </select>
            </div>
          )}
          
          {/* Availability */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-3">Availability</label>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {days.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 capitalize">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {days.map(day => (
                <div key={`${day}-start`} className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Start</label>
                  <input
                    type="time"
                    value={formData.availability[day]?.start || ''}
                    onChange={(e) => handleAvailabilityChange(day, 'start', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  />
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2 mt-2">
              {days.map(day => (
                <div key={`${day}-end`} className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">End</label>
                  <input
                    type="time"
                    value={formData.availability[day]?.end || ''}
                    onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Submitting...' : submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkerForm;