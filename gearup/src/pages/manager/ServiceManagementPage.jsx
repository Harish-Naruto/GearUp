import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const ServiceManagementPage = () => {
  const { user, token } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  
  const [loading, setLoading] = useState(true);
  const [garage, setGarage] = useState(null);
  const [services, setServices] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: ''
  });
  const [errors, setErrors] = useState({});

  // Fetch garage data for the manager
  useEffect(() => {
    const fetchGarage = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/v1/garages/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter garages to find ones where manager_id matches current user
        const managerGarage = response.data.data.garages.find(g => g.manager_id === user.id);
        
        if (managerGarage) {
          setGarage(managerGarage);
          setServices(managerGarage.services || []);
        }
      } catch (error) {
        console.error('Error fetching garage:', error);
        toast.error('Failed to load garage information');
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      fetchGarage();
    }
  }, [user, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    }
    
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!formData.duration || isNaN(formData.duration) || parseInt(formData.duration) <= 0) {
      newErrors.duration = 'Duration must be a positive number in minutes';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const payload = {
        name: formData.name,
        description: formData.description || '',
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration)
      };
      
      const response = await axios.post(`http://localhost:3000/api/v1/garages/${garage.id}/services`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setServices(response.data.data.garage.services || []);
      toast.success('Service added successfully');
      resetForm();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Failed to add service');
    }
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || !currentService) return;
    
    try {
      // Since backend doesn't have a direct endpoint to update a single service,
      // we need to update all services
      const updatedServices = services.map(service => {
        if (service.id === currentService.id) {
          return {
            ...service,
            name: formData.name,
            description: formData.description || '',
            price: parseFloat(formData.price),
            duration: parseInt(formData.duration)
          };
        }
        return service;
      });
      
      const response = await axios.put(`http://localhost:3000/api/v1/garages/${garage.id}`, {
        services: updatedServices
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setServices(response.data.data.garage.services || []);
      toast.success('Service updated successfully');
      resetForm();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
    }
  };

  const handleRemoveService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to remove this service?')) return;
    
    try {
      await axios.delete(`http://localhost:3000/api/v1/garages/${garage.id}/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove service from local state
      setServices(services.filter(service => service.id !== serviceId));
      toast.success('Service removed successfully');
    } catch (error) {
      console.error('Error removing service:', error);
      toast.error('Failed to remove service');
    }
  };

  const openEditModal = (service) => {
    setCurrentService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration: service.duration.toString()
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: ''
    });
    setErrors({});
    setCurrentService(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!garage) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-bold mb-4">No garage found</h2>
        <p>You are not currently managing any garage.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Service Management - {garage.name}</h1>
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className={`px-4 py-2 rounded ${
              theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
            } text-white font-medium`}
          >
            Add New Service
          </button>
        </div>

        {services.length === 0 ? (
          <div className={`p-6 rounded-lg mb-6 text-center ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow'
          }`}>
            <p>No services added yet. Add your first service to get started!</p>
          </div>
        ) : (
          <div className={`overflow-x-auto rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow'
          }`}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Service Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Duration (min)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{service.name}</td>
                    <td className="px-6 py-4">{service.description || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${service.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{service.duration}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(service)}
                        className={`mr-2 px-3 py-1 rounded ${
                          theme === 'dark' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'
                        } text-white text-sm`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveService(service.id)}
                        className={`px-3 py-1 rounded ${
                          theme === 'dark' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                        } text-white text-sm`}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Service Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`max-w-md w-full p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-bold mb-4">Add New Service</h2>
            <form onSubmit={handleAddService}>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Service Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  } ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full p-2 border rounded ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium">Price ($)*</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full p-2 border rounded ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  } ${errors.price ? 'border-red-500' : ''}`}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
              
              <div className="mb-6">
                <label className="block mb-1 font-medium">Duration (minutes)*</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full p-2 border rounded ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  } ${errors.duration ? 'border-red-500' : ''}`}
                />
                {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={`px-4 py-2 rounded ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded ${
                    theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  Add Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`max-w-md w-full p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-bold mb-4">Edit Service</h2>
            <form onSubmit={handleUpdateService}>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Service Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  } ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full p-2 border rounded ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium">Price ($)*</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full p-2 border rounded ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  } ${errors.price ? 'border-red-500' : ''}`}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
              
              <div className="mb-6">
                <label className="block mb-1 font-medium">Duration (minutes)*</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full p-2 border rounded ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  } ${errors.duration ? 'border-red-500' : ''}`}
                />
                {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className={`px-4 py-2 rounded ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded ${
                    theme === 'dark' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'
                  } text-white`}
                >
                  Update Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagementPage;