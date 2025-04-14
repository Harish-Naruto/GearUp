import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';

const GarageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [garage, setGarage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingValue, setRatingValue] = useState(5);
  const [review, setReview] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { token, user, baseUrl } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    fetchGarageDetails();
    if (user) {
      setIsManager(user.role === 'MANAGER');
      setIsAdmin(user.role === 'ADMIN');
    }
  }, [id, user]);

  const fetchGarageDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/api/v1/garages/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setGarage(response.data.data.garage);
    } catch (error) {
      console.error('Error fetching garage details:', error);
      toast.error('Failed to load garage details');
      navigate('/garages');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:3000/api/v1/garages/${id}/ratings`,
        { rating: ratingValue, review },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      toast.success('Rating submitted successfully');
      setShowRatingModal(false);
      fetchGarageDetails(); // Refresh garage details to show updated rating
    } catch (error) {
      console.error('Error submitting rating:', error);
      if (error.response?.status === 403) {
        toast.error('You can only rate garages after completing a service with them');
      } else {
        toast.error('Failed to submit rating');
      }
    }
  };

  const handleDeleteGarage = async () => {
    if (window.confirm('Are you sure you want to delete this garage? This action cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:3000/api/v1/garages/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Garage deleted successfully');
        navigate('/garages');
      } catch (error) {
        console.error('Error deleting garage:', error);
        toast.error('Failed to delete garage');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-t-4 rounded-full border-gray-300 border-t-blue-500 animate-spin"></div>
      </div>
    );
  }

  if (!garage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Garage not found</h2>
          <button
            onClick={() => navigate('/garages')}
            className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Back to Garages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className="container px-4 py-8 mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/garages')}
            className={`flex items-center space-x-2 ${
              theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            <span>Back to Garages</span>
          </button>
        </div>

        <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col justify-between md:flex-row md:items-center">
            <h1 className="text-3xl font-bold mb-4 md:mb-0">{garage.name}</h1>
            <div className="flex flex-wrap gap-2">
              {(isManager && garage.manager_id === user.id || isAdmin) && (
                <button
                  onClick={() => navigate(`/garages/${id}/edit`)}
                  className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                  Edit Garage
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={handleDeleteGarage}
                  className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
                >
                  Delete Garage
                </button>
              )}
              <button
                onClick={() => navigate(`/bookings/new?garage=${id}`)}
                className={`px-4 py-2 text-white rounded-md ${
                  theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                Book Service
              </button>
              <button
                onClick={() => setShowRatingModal(true)}
                className={`px-4 py-2 text-white rounded-md ${
                  theme === 'dark' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'
                }`}
              >
                Rate Garage
              </button>
            </div>
          </div>

          <div className="flex items-center mt-4 mb-6">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(garage.ratings || 0)
                      ? 'text-yellow-400'
                      : `${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2">
                {garage.ratings ? (
                  <span>
                    {garage.ratings.toFixed(1)} ({garage.total_ratings} reviews)
                  </span>
                ) : (
                  'No ratings yet'
                )}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h2 className="text-xl font-semibold mb-2">Location</h2>
              <p>{garage.location?.address || 'Address not available'}</p>
              {garage.location?.city && <p>{garage.location.city}, {garage.location.state} {garage.location.zip}</p>}
            </div>

            <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h2 className="text-xl font-semibold mb-2">Hours</h2>
              {garage.operating_hours ? (
                <ul>
                  {Object.entries(garage.operating_hours).map(([day, hours]) => (
                    <li key={day} className="flex justify-between">
                      <span className="capitalize">{day}:</span>
                      <span>{hours || 'Closed'}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Hours not available</p>
              )}
            </div>

            <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h2 className="text-xl font-semibold mb-2">Contact</h2>
              {garage.contact_info ? (
                <div>
                  {garage.contact_info.phone && (
                    <p className="flex items-center mb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {garage.contact_info.phone}
                    </p>
                  )}
                  {garage.contact_info.email && (
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {garage.contact_info.email}
                    </p>
                  )}
                </div>
              ) : (
                <p>Contact information not available</p>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Services</h2>
            {garage.services && garage.services.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {garage.services.map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 border rounded-md ${
                      theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <h3 className="text-lg font-semibold">{service.name}</h3>
                    <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {service.description || 'No description available'}
                    </p>
                    <div className="flex justify-between mt-4">
                      <span className="font-medium">${service.price.toFixed(2)}</span>
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                        {service.duration} {service.duration === 1 ? 'hour' : 'hours'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No services available</p>
            )}
          </div>

          {garage.workers && garage.workers.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Staff</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {garage.workers.map((worker) => (
                  <div
                    key={worker.id}
                    className={`p-4 border rounded-md ${
                      theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <h3 className="text-lg font-semibold">{worker.user_id}</h3>
                    <p className="mt-2 capitalize">{worker.specialization}</p>
                    <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {worker.availability ? 'Available' : 'Not Available'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`w-full max-w-md p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold mb-4">Rate Garage</h2>
            <form onSubmit={handleRatingSubmit}>
              <div className="mb-4">
                <label className="block mb-2">Your Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRatingValue(value)}
                      className="focus:outline-none"
                    >
                      <svg
                        className={`w-8 h-8 ${
                          value <= ratingValue ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="review" className="block mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  id="review"
                  rows="4"
                  className={`w-full p-2 border rounded-md ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
                  className={`px-4 py-2 rounded-md ${
                    theme === 'dark' 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-md ${
                    theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GarageDetailPage;