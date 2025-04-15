import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './CreateBookingPage.css'; // Import the external CSS file

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
      const response = await axios.get('http://localhost:3000/api/v1/garages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Garages data:', response.data.data.garages);
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
      
      const response = await axios.post('http://localhost:3000/api/v1/bookings', bookingData, {
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

  // Helper function to format garage location based on its structure
  const formatGarageLocation = (location) => {
    if (!location) return 'No location';
    
    // If location is an object with address property
    if (typeof location === 'object' && location.address) {
      return location.address;
    }
    
    // If location is a string
    if (typeof location === 'string') {
      return location;
    }
    
    // Fallback: convert object to string representation
    return JSON.stringify(location);
  };

  // Helper function to set minimum date time (current time + 1 hour)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <div>
        <Link to="/bookings" className="back-link">
          &larr; Back to Bookings
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Book a Service</h1>
          <p className="card-subtitle">Schedule a service with your preferred garage</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <div className="form-field">
              <label className="form-label">Select Garage</label>
              <select
                name="garage_id"
                value={formData.garage_id}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Choose a garage</option>
                {garages.map(garage => (
                  <option key={garage.id} value={garage.id}>
                    {garage.name} - {formatGarageLocation(garage.location)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Service Type</label>
              <select
                name="service_type"
                value={formData.service_type}
                onChange={handleChange}
                className="form-select"
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

            <div className="form-field">
              <label className="form-label">Scheduled Time</label>
              <input
                type="datetime-local"
                name="scheduled_time"
                value={formData.scheduled_time}
                onChange={handleChange}
                min={getMinDateTime()}
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label">Estimated Duration (minutes)</label>
              <input
                type="number"
                name="estimated_duration"
                value={formData.estimated_duration}
                onChange={handleChange}
                min="30"
                step="30"
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="form-textarea"
              placeholder="Please provide details about your vehicle and the specific service requirements..."
            ></textarea>
          </div>

          <div className="form-actions">
            <Link
              to="/bookings"
              className="btn btn-cancel"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
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