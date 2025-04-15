import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ServiceManagement.css';

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
      
      // Fix: Make sure we're using the correct endpoint and payload format
      const response = await axios.post(`http://localhost:3000/api/v1/garages/${garage.id}/services`, 
        { service: payload }, // Ensure the service data is nested under a "service" key if required by API
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Fix: Make sure we're correctly accessing the updated services from the response
      const updatedServices = response.data.data?.garage?.services || 
                             response.data.data?.services || 
                             response.data?.services || 
                             [];
      
      setServices(updatedServices);
      toast.success('Service added successfully');
      resetForm();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error(error.response?.data?.message || 'Failed to add service');
    }
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || !currentService) return;
    
    try {
      const updatedService = {
        id: currentService.id,
        name: formData.name,
        description: formData.description || '',
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration)
      };
      
      // Option 1: If the API supports updating a single service directly
      const response = await axios.put(
        `http://localhost:3000/api/v1/garages/${garage.id}/services/${currentService.id}`,
        { service: updatedService },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update local state based on response
      const updatedServices = services.map(service => {
        if (service.id === currentService.id) {
          return updatedService;
        }
        return service;
      });
      
      setServices(updatedServices);
      toast.success('Service updated successfully');
      resetForm();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating service:', error);
      
      // Fallback to update all services if the direct update fails
      try {
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
        
        const response = await axios.put(
          `http://localhost:3000/api/v1/garages/${garage.id}`,
          { garage: { services: updatedServices } },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setServices(updatedServices);
        toast.success('Service updated successfully');
        resetForm();
        setIsEditModalOpen(false);
      } catch (fallbackError) {
        console.error('Error in fallback update:', fallbackError);
        toast.error('Failed to update service');
      }
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
      
      // Fallback: If direct delete doesn't work, try updating the garage without this service
      try {
        const updatedServices = services.filter(service => service.id !== serviceId);
        await axios.put(
          `http://localhost:3000/api/v1/garages/${garage.id}`,
          { garage: { services: updatedServices } },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setServices(updatedServices);
        toast.success('Service removed successfully');
      } catch (fallbackError) {
        console.error('Error in fallback remove:', fallbackError);
      }
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
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!garage) {
    return (
      <div className="error-container">
        <h2 className="card-title">No garage found</h2>
        <p className="error-message">You are not currently managing any garage.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div className="card-header-content">
          <h1 className="page-title">Service Management - {garage.name}</h1>
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="btn btn-primary"
          >
            Add New Service
          </button>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="empty-state">
          <p>No services added yet. Add your first service to get started!</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="service-table">
            <thead className="table-header">
              <tr>
                <th>Service Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Duration (min)</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {services.map((service) => (
                <tr key={service.id}>
                  <td>{service.name}</td>
                  <td>{service.description || 'N/A'}</td>
                  <td>${service.price.toFixed(2)}</td>
                  <td>{service.duration}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => openEditModal(service)}
                      className="btn btn-warning btn-sm"
                      style={{ marginRight: '0.5rem' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveService(service.id)}
                      className="btn btn-danger btn-sm"
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

      {/* Add Service Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Add New Service</h2>
            </div>
            <form onSubmit={handleAddService}>
              <div className="form-group">
                <label className="form-label">Service Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`form-control ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Price ($)*</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`form-control ${errors.price ? 'border-red-500' : ''}`}
                />
                {errors.price && <p className="form-error">{errors.price}</p>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Duration (minutes)*</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="1"
                  className={`form-control ${errors.duration ? 'border-red-500' : ''}`}
                />
                {errors.duration && <p className="form-error">{errors.duration}</p>}
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
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
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Edit Service</h2>
            </div>
            <form onSubmit={handleUpdateService}>
              <div className="form-group">
                <label className="form-label">Service Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`form-control ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Price ($)*</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`form-control ${errors.price ? 'border-red-500' : ''}`}
                />
                {errors.price && <p className="form-error">{errors.price}</p>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Duration (minutes)*</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="1"
                  className={`form-control ${errors.duration ? 'border-red-500' : ''}`}
                />
                {errors.duration && <p className="form-error">{errors.duration}</p>}
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-warning"
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