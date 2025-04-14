import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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
      
      const response = await axios.get('/api/v1/users/me', {
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
      
      await axios.put('/api/v1/users/me', 
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
    return <div className="flex justify-center items-center h-64">Loading profile data...</div>;
  }

  if (!user) {
    return <div className="text-center text-red-500">User not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Account Information</h2>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-1">First Name</label>
                <input 
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Last Name</label>
                <input 
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Phone</label>
                <input 
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Address</label>
                <input 
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save Changes
              </button>
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Role</p>
                <p className="font-medium">{user.role}</p>
              </div>
              <div>
                <p className="text-gray-600">First Name</p>
                <p className="font-medium">{formData.firstName || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-600">Last Name</p>
                <p className="font-medium">{formData.lastName || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone</p>
                <p className="font-medium">{formData.phone || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-600">Address</p>
                <p className="font-medium">{formData.address || 'Not set'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Worker-specific information */}
      {worker && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Worker Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {worker.garages && (
              <div>
                <p className="text-gray-600">Assigned Garage</p>
                <p className="font-medium">{worker.garages.name}</p>
              </div>
            )}
            {/* Add more worker-specific fields as needed */}
          </div>
        </div>
      )}
      
      {/* Manager-specific information */}
      {garage && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Managed Garage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Garage Name</p>
              <p className="font-medium">{garage.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Location</p>
              <p className="font-medium">{garage.location || 'Not set'}</p>
            </div>
            {/* Add more garage-specific fields as needed */}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;