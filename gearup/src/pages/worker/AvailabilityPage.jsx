import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';

const AvailabilityPage = () => {
  const { id } = useParams(); // Get worker ID from URL
  const { user, token } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [worker, setWorker] = useState(null);
  const [availability, setAvailability] = useState({
    monday: { start: '', end: '' },
    tuesday: { start: '', end: '' },
    wednesday: { start: '', end: '' },
    thursday: { start: '', end: '' },
    friday: { start: '', end: '' },
    saturday: { start: '', end: '' },
    sunday: { start: '', end: '' }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchWorker = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/v1/workers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setWorker(response.data.data.worker);
        
        // Initialize availability from worker data
        if (response.data.data.worker.availability) {
          setAvailability(response.data.data.worker.availability);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching worker data:', error);
        toast.error(error.response?.data?.message || 'Failed to load worker data');
        setLoading(false);
        
        // Redirect if not authorized or worker not found
        if (error.response?.status === 403 || error.response?.status === 404) {
          navigate('/dashboard');
        }
      }
    };
    
    fetchWorker();
  }, [id, token, navigate]);
  
  // Handle time input changes
  const handleTimeChange = (day, field, value) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };
  
  // Handle availability submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      await axios.put(`/api/v1/workers/${id}/availability`, {
        availability
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Availability updated successfully');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error(error.response?.data?.message || 'Failed to update availability');
      setIsSubmitting(false);
    }
  };
  
  // Check if current user is authorized to edit this worker's availability
  const isAuthorized = () => {
    if (!user || !worker) return false;
    return user.id === worker.user_id;
  };
  
  if (loading) {
    return (
      <div className={`flex justify-center items-center h-screen ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthorized()) {
    return (
      <div className={`p-8 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}>
        <h1 className="text-2xl font-bold mb-4">Unauthorized Access</h1>
        <p>You are not authorized to view or edit this worker's availability.</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Set Your Availability</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Back to Dashboard
          </button>
        </div>
        
        <div className={`p-6 rounded-lg shadow-md mb-8 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Worker Information</h2>
            <p><span className="font-medium">Name:</span> {worker.users?.profile_data?.name || 'N/A'}</p>
            <p><span className="font-medium">Email:</span> {worker.users?.email || 'N/A'}</p>
            <p><span className="font-medium">Garage:</span> {worker.garages?.name || 'N/A'}</p>
            <p><span className="font-medium">Status:</span> <span className={`font-medium ${
              worker.status === 'ACTIVE' ? 'text-green-500' : 
              worker.status === 'INACTIVE' ? 'text-red-500' : 'text-yellow-500'
            }`}>{worker.status}</span></p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Specializations:</h3>
            {worker.specialization && worker.specialization.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {worker.specialization.map((spec, index) => (
                  <span 
                    key={index} 
                    className={`px-3 py-1 rounded-full text-sm ${
                      theme === 'dark' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {spec}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No specializations listed</p>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className={`rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-6`}>
          <h2 className="text-xl font-semibold mb-4">Weekly Availability</h2>
          <p className="mb-4 text-sm">Set your working hours for each day of the week. Leave empty for days off.</p>
          
          <div className="grid gap-4 mb-6">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
              <div key={day} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-b pb-4">
                <div className="capitalize font-medium">
                  {day}
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex flex-col flex-1">
                    <label htmlFor={`${day}-start`} className="text-sm mb-1">Start Time</label>
                    <input
                      type="time"
                      id={`${day}-start`}
                      value={availability[day]?.start || ''}
                      onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                      className={`rounded p-2 ${
                        theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100'
                      }`}
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <label htmlFor={`${day}-end`} className="text-sm mb-1">End Time</label>
                    <input
                      type="time"
                      id={`${day}-end`}
                      value={availability[day]?.end || ''}
                      onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                      className={`rounded p-2 ${
                        theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100'
                      }`}
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {!availability[day]?.start && !availability[day]?.end ? (
                    'Day off'
                  ) : (
                    <>
                      {availability[day]?.start && availability[day]?.end ? (
                        `Working from ${availability[day]?.start} to ${availability[day]?.end}`
                      ) : (
                        'Please set both start and end times'
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded font-medium ${
                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 
                theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              {isSubmitting ? 'Updating...' : 'Update Availability'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AvailabilityPage;