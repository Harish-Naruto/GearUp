import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateBookingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [garages, setGarages] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([
    'OIL_CHANGE', 'BRAKE_SERVICE', 'TIRE_REPLACEMENT', 'ENGINE_TUNE_UP', 
    'INSPECTION', 'BATTERY_REPLACEMENT', 'AIR_CONDITIONING', 'OTHER'
  ]);
  
  const [formData, setFormData] = useState({
    garage_id: '',
    service_type: '',
    description: '',
    scheduled_time: '',
    estimated_duration: 60 // Default to 60 minutes
  });

  useEffect(() => {
    fetchGarages();
  }, []);

  const fetchGarages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/garages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setGarages(response.data.data.garages || []);
    } catch (error) {
      toast.error('Failed to fetch available garages');
      console.error('Error fetching garages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      // Format date-time for the API
      const bookingData = {
        ...formData,
        estimated_duration: parseInt(formData.estimated_duration)
      };
      
      const response = await axios.post('/api/v1/bookings', bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Booking created successfully!');
      navigate(`/bookings/${response.data.data.booking.id}`);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create booking';
      toast.error(errorMsg);
      console.error('Error creating booking:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to set minimum date time (current time + 1 hour)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
          <h1 className="text-2xl font-bold">Book a Service</h1>
          <p className="text-gray-500 mt-1">Schedule a service with your preferred garage</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Garage</label>
              <select
                name="garage_id"
                value={formData.garage_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="">Choose a garage</option>
                {garages.map(garage => (
                  <option key={garage.id} value={garage.id}>
                    {garage.name} - {garage.location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <select
                name="service_type"
                value={formData.service_type}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="">Select service type</option>
                {serviceTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Time</label>
              <input
                type="datetime-local"
                name="scheduled_time"
                value={formData.scheduled_time}
                onChange={handleChange}
                min={getMinDateTime()}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration (minutes)</label>
              <input
                type="number"
                name="estimated_duration"
                value={formData.estimated_duration}
                onChange={handleChange}
                min="30"
                step="30"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Please provide details about your vehicle and the specific service requirements..."
            ></textarea>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4">
            <Link
              to="/bookings"
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {submitting ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBookingPage;