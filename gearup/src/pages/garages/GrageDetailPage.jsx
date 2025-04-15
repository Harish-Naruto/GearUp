import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';
import './GarageDetail.css'; // Import the CSS file

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
    // Set theme attribute for CSS variables
    document.documentElement.setAttribute('data-theme', theme);
    
    fetchGarageDetails();
    if (user) {
      setIsManager(user.role === 'MANAGER');
      setIsAdmin(user.role === 'ADMIN');
    }
  }, [id, user, theme]);

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

  // Format operating hours to fix the object rendering issue
  const formatOperatingHours = (hours) => {
    if (!hours) return null;
    
    const formattedHours = {};
    Object.entries(hours).forEach(([day, hourRange]) => {
      // Check if hourRange is an object with open/close properties
      if (hourRange && typeof hourRange === 'object' && 'open' in hourRange && 'close' in hourRange) {
        formattedHours[day] = `${hourRange.open} - ${hourRange.close}`;
      } else {
        // Handle string values or null/undefined
        formattedHours[day] = hourRange || 'Closed';
      }
    });
    
    return formattedHours;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!garage) {
    return (
      <div className="not-found-container">
        <div className="not-found-content">
          <h2 className="not-found-title">Garage not found</h2>
          <button
            onClick={() => navigate('/garages')}
            className="btn btn-blue"
          >
            Back to Garages
          </button>
        </div>
      </div>
    );
  }

  // Format operating hours for rendering
  const operatingHours = formatOperatingHours(garage.operating_hours);

  return (
    <div className="garage-detail-page">
      <div className="container">
        <button
          onClick={() => navigate('/garages')}
          className="back-button"
        >
          <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          <span>Back to Garages</span>
        </button>

        <div className="detail-card">
          <div className="card-header">
            <h1 className="garage-title">{garage.name}</h1>
            <div className="action-buttons">
              {(isManager && garage.manager_id === user.id || isAdmin) && (
                <button
                  onClick={() => navigate(`/garages/${id}/edit`)}
                  className="btn btn-blue"
                >
                  Edit Garage
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={handleDeleteGarage}
                  className="btn btn-red"
                >
                  Delete Garage
                </button>
              )}
              <button
                onClick={() => navigate(`/bookings/new?garage=${id}`)}
                className="btn btn-green"
              >
                Book Service
              </button>
              <button
                onClick={() => setShowRatingModal(true)}
                className="btn btn-yellow"
              >
                Rate Garage
              </button>
            </div>
          </div>

          <div className="rating-container">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`star ${i < Math.round(garage.ratings || 0) ? 'star-filled' : 'star-empty'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="rating-text">
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

          <div className="info-grid">
            <div className="info-card">
              <h2 className="info-title">Location</h2>
              <p>{garage.location?.address || 'Address not available'}</p>
              {garage.location?.city && <p>{garage.location.city}, {garage.location.state} {garage.location.zip}</p>}
            </div>

            <div className="info-card">
              <h2 className="info-title">Hours</h2>
              {operatingHours ? (
                <ul className="hours-list">
                  {Object.entries(operatingHours).map(([day, hours]) => (
                    <li key={day} className="hours-item">
                      <span className="day-name">{day}:</span>
                      <span>{hours}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Hours not available</p>
              )}
            </div>

            <div className="info-card">
              <h2 className="info-title">Contact</h2>
              {garage.contact_info ? (
                <div>
                  {garage.contact_info.phone && (
                    <p className="contact-item">
                      <svg className="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {garage.contact_info.phone}
                    </p>
                  )}
                  {garage.contact_info.email && (
                    <p className="contact-item">
                      <svg className="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          <div>
            <h2 className="section-title">Services</h2>
            {garage.services && garage.services.length > 0 ? (
              <div className="services-grid">
                {garage.services.map((service) => (
                  <div key={service.id} className="service-card">
                    <h3 className="service-title">{service.name}</h3>
                    <p className="service-description">
                      {service.description || 'No description available'}
                    </p>
                    <div className="service-meta">
                      <span className="service-price">${service.price.toFixed(2)}</span>
                      <span className="service-duration">
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
            <div>
              <h2 className="section-title">Staff</h2>
              <div className="staff-grid">
                {garage.workers.map((worker) => (
                  <div key={worker.id} className="staff-card">
                    <h3 className="staff-name">{worker.user_id}</h3>
                    <p className="staff-specialization">{worker.specialization}</p>
                    <p className="staff-availability">
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
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Rate Garage</h2>
            <form onSubmit={handleRatingSubmit}>
              <div className="form-group">
                <label className="form-label">Your Rating</label>
                <div className="rating-buttons">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRatingValue(value)}
                      className="rating-button"
                    >
                      <svg
                        className={`star ${value <= ratingValue ? 'star-filled' : 'star-empty'}`}
                        style={{ width: '2rem', height: '2rem' }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="review" className="form-label">
                  Your Review (Optional)
                </label>
                <textarea
                  id="review"
                  rows="4"
                  className="textarea"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                ></textarea>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-blue"
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