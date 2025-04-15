import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './UserProfile.css'; // Import the external CSS file

const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const [worker, setWorker] = useState(null);
  const [garage, setGarage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    preferences: {}
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:3000/api/v1/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const { user, worker, garage } = response.data.data;
      
      setUser(user);
      setWorker(worker);
      setGarage(garage);
      
      // Initialize form with existing profile data
      if (user.profile_data) {
        setFormData({
          firstName: user.profile_data.firstName || '',
          lastName: user.profile_data.lastName || '',
          phone: user.profile_data.phone || '',
          address: user.profile_data.address || '',
          preferences: user.profile_data.preferences || {}
        });
      }
    } catch (error) {
      toast.error('Failed to load profile data');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.put('http://localhost:3000/api/v1/users/me', 
        { 
          profile_data: formData 
        }, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchUserProfile(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading profile data...</div>;
  }

  if (!user) {
    return <div className="error-message">User not found</div>;
  }

  return (
    <div className="container">
      <h1 className="page-title">User Profile</h1>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Account Information</h2>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="button button-primary"
            >
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2">
              <div className="form-group">
                <label>First Name</label>
                <input 
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input 
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input 
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input 
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="button-group">
              <button 
                type="submit"
                className="button button-success"
              >
                Save Changes
              </button>
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="button button-gray"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2">
            <div>
              <p className="field-label">Email</p>
              <p className="field-value">{user.email}</p>
            </div>
            <div>
              <p className="field-label">Role</p>
              <p className="field-value">{user.role}</p>
            </div>
            <div>
              <p className="field-label">First Name</p>
              <p className="field-value">{formData.firstName || 'Not set'}</p>
            </div>
            <div>
              <p className="field-label">Last Name</p>
              <p className="field-value">{formData.lastName || 'Not set'}</p>
            </div>
            <div>
              <p className="field-label">Phone</p>
              <p className="field-value">{formData.phone || 'Not set'}</p>
            </div>
            <div>
              <p className="field-label">Address</p>
              <p className="field-value">{formData.address || 'Not set'}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Worker-specific information */}
      {worker && (
        <div className="card">
          <h2 className="card-title">Worker Information</h2>
          <div className="grid grid-cols-2">
            {worker.garages && (
              <div>
                <p className="field-label">Assigned Garage</p>
                <p className="field-value">{worker.garages.name}</p>
              </div>
            )}
            {/* Add more worker-specific fields as needed */}
          </div>
        </div>
      )}
      
      {/* Manager-specific information */}
      {garage && (
        <div className="card">
          <h2 className="card-title">Managed Garage</h2>
          <div className="grid grid-cols-2">
            <div>
              <p className="field-label">Garage Name</p>
              <p className="field-value">{garage.name}</p>
            </div>
            <div>
              <p className="field-label">Location</p>
              <p className="field-value">{garage.location?.address || 'Not set'}</p>
            </div>
            {/* Add more garage-specific fields as needed */}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;