import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GarageManagement.css';

const GarageManagementPage = () => {
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('name');
  
  // For the create/edit garage dialog
  const [openGarageDialog, setOpenGarageDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [currentGarage, setCurrentGarage] = useState(null);
  const [garageForm, setGarageForm] = useState({
    name: '',
    location: {
      address: '',
      coordinates: {
        latitude: 0,
        longitude: 0
      }
    },
    operating_hours: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { open: '09:00', close: '18:00' },
      saturday: { open: '09:00', close: '16:00' },
      sunday: { open: '', close: '' }
    },
    contact_info: {
      phone: '',
      email: '',
      website: ''
    }
  });

  // For service management
  const [openServiceDialog, setOpenServiceDialog] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 60
  });

  // For notifications
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Fetch all garages on page load
  useEffect(() => {
    fetchGarages();
  }, []);

  const fetchGarages = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (sortOrder) queryParams.append('sort', sortOrder);
      
      const response = await axios.get(`http://localhost:3000/api/v1/garages?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setGarages(response.data.data.garages);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch garages');
      setLoading(false);
      showNotification('Failed to fetch garages', 'error');
    }
  };

  const handleSearch = () => {
    fetchGarages();
  };

  const handleSortChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
    fetchGarages();
  };

  const handleOpenGarageDialog = (mode, garage = null) => {
    setDialogMode(mode);
    if (mode === 'edit' && garage) {
      setCurrentGarage(garage);
      setGarageForm({
        name: garage.name,
        location: garage.location || {
          address: '',
          coordinates: { latitude: 0, longitude: 0 }
        },
        operating_hours: garage.operating_hours || {
          monday: { open: '09:00', close: '18:00' },
          tuesday: { open: '09:00', close: '18:00' },
          wednesday: { open: '09:00', close: '18:00' },
          thursday: { open: '09:00', close: '18:00' },
          friday: { open: '09:00', close: '18:00' },
          saturday: { open: '09:00', close: '16:00' },
          sunday: { open: '', close: '' }
        },
        contact_info: garage.contact_info || {
          phone: '',
          email: '',
          website: ''
        }
      });
    } else {
      // Reset form for create
      setCurrentGarage(null);
      setGarageForm({
        name: '',
        location: {
          address: '',
          coordinates: { latitude: 0, longitude: 0 }
        },
        operating_hours: {
          monday: { open: '09:00', close: '18:00' },
          tuesday: { open: '09:00', close: '18:00' },
          wednesday: { open: '09:00', close: '18:00' },
          thursday: { open: '09:00', close: '18:00' },
          friday: { open: '09:00', close: '18:00' },
          saturday: { open: '09:00', close: '16:00' },
          sunday: { open: '', close: '' }
        },
        contact_info: {
          phone: '',
          email: '',
          website: ''
        }
      });
    }
    setOpenGarageDialog(true);
  };

  const handleGarageFormChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested object values
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        setGarageForm(prev => ({
          ...prev,
          [parts[0]]: {
            ...prev[parts[0]],
            [parts[1]]: value
          }
        }));
      } else if (parts.length === 3) {
        setGarageForm(prev => ({
          ...prev,
          [parts[0]]: {
            ...prev[parts[0]],
            [parts[1]]: {
              ...prev[parts[0]][parts[1]],
              [parts[2]]: value
            }
          }
        }));
      } else if (parts.length === 4) {
        setGarageForm(prev => ({
          ...prev,
          [parts[0]]: {
            ...prev[parts[0]],
            [parts[1]]: {
              ...prev[parts[0]][parts[1]],
              [parts[2]]: {
                ...prev[parts[0]][parts[1]][parts[2]],
                [parts[3]]: value
              }
            }
          }
        }));
      }
    } else {
      setGarageForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleOpenServiceDialog = (garage, service = null) => {
    setCurrentGarage(garage);
    if (service) {
      setCurrentService(service);
      setServiceForm({
        name: service.name,
        description: service.description || '',
        price: service.price,
        duration: service.duration
      });
    } else {
      // Reset form for add
      setCurrentService(null);
      setServiceForm({
        name: '',
        description: '',
        price: 0,
        duration: 60
      });
    }
    setOpenServiceDialog(true);
  };

  const handleServiceFormChange = (e) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'duration' ? Number(value) : value
    }));
  };

  const showNotification = (message, type = 'success') => {
    setNotification({
      show: true,
      message,
      type
    });
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const submitGarageForm = async () => {
    try {
      let response;
      
      if (dialogMode === 'create') {
        response = await axios.post('http://localhost:3000/api/v1/garages', garageForm, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        showNotification('Garage created successfully');
      } else {
        response = await axios.put(`http://localhost:3000/api/v1/garages/${currentGarage.id}`, garageForm, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        showNotification('Garage updated successfully');
      }
      
      setOpenGarageDialog(false);
      fetchGarages();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const submitServiceForm = async () => {
    try {
      await axios.post(`http://localhost:3000/api/v1/garages/${currentGarage.id}/services`, serviceForm, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      showNotification('Service added successfully');
      setOpenServiceDialog(false);
      fetchGarages();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to add service', 'error');
    }
  };

  const deleteService = async (garageId, serviceId) => {
    try {
      await axios.delete(`http://localhost:3000/api/v1/garages/${garageId}/services/${serviceId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      showNotification('Service removed successfully');
      fetchGarages();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to remove service', 'error');
    }
  };

  const deleteGarage = async (garageId) => {
    if (!window.confirm('Are you sure you want to delete this garage?')) return;
    
    try {
      await axios.delete(`http://localhost:3000/api/v1/garages/${garageId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      showNotification('Garage deleted successfully');
      fetchGarages();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete garage', 'error');
    }
  };

  const getDayScheduleDisplay = (day, schedule) => {
    if (!schedule || !schedule[day] || !schedule[day].open || !schedule[day].close) {
      return 'Closed';
    }
    return `${schedule[day].open} - ${schedule[day].close}`;
  };

  // Calculate average rating
  const getRatingDisplay = (garage) => {
    if (!garage.ratings || garage.ratings === 0) {
      return 'No ratings yet';
    }
    return `${garage.ratings} (${garage.total_ratings || 0} reviews)`;
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Garage Management</h1>
      </div>
      
      {/* Search and filters bar */}
      <div className="search-bar">
        <div className="grid">
          <div>
            <div className="form-group">
              <input
                type="text"
                className="search-input"
                placeholder="Search garages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-outline" onClick={handleSearch}>
                <i className="btn-icon">🔍</i> Search
              </button>
              <button className="btn btn-primary" onClick={() => handleOpenGarageDialog('create')}>
                <i className="btn-icon">+</i> Add Garage
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notification */}
      {notification.show && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      {/* Garages list */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="notification notification-error">{error}</div>
      ) : garages.length === 0 ? (
        <div className="empty-state">
          <h2 className="empty-state-title">No garages found</h2>
          <p className="empty-state-message">Create a new garage to get started</p>
          <button className="btn btn-primary" onClick={() => handleOpenGarageDialog('create')}>
            <i className="btn-icon">+</i> Add Garage
          </button>
        </div>
      ) : (
        <div className="grid">
          {garages.map(garage => (
            <div key={garage.id}>
              <div className="garage-card">
                <div className="card-header">
                  <div className="card-header-content">
                    <h2 className="card-title">{garage.name}</h2>
                    <div className="rating-container">
                      <span className="rating-value">{getRatingDisplay(garage)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="info-item">
                    <span className="info-icon">📍</span>
                    <span className="info-text">
                      {garage.location?.address || 'No address provided'}
                    </span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-icon">📞</span>
                    <span className="info-text">
                      {garage.contact_info?.phone || 'No phone provided'}
                    </span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-icon">✉️</span>
                    <span className="info-text">
                      {garage.contact_info?.email || 'No email provided'}
                    </span>
                  </div>
                  
                  <div className="section-divider"></div>
                  
                  <div className="section">
                    <h3 className="section-title">Hours of Operation</h3>
                    <div className="hours-grid">
                      <div>
                        <p className="day-label">Monday:</p>
                        <p className="day-label">Tuesday:</p>
                        <p className="day-label">Wednesday:</p>
                        <p className="day-label">Thursday:</p>
                        <p className="day-label">Friday:</p>
                        <p className="day-label">Saturday:</p>
                        <p className="day-label">Sunday:</p>
                      </div>
                      <div>
                        <p className="hours-value">{getDayScheduleDisplay('monday', garage.operating_hours)}</p>
                        <p className="hours-value">{getDayScheduleDisplay('tuesday', garage.operating_hours)}</p>
                        <p className="hours-value">{getDayScheduleDisplay('wednesday', garage.operating_hours)}</p>
                        <p className="hours-value">{getDayScheduleDisplay('thursday', garage.operating_hours)}</p>
                        <p className="hours-value">{getDayScheduleDisplay('friday', garage.operating_hours)}</p>
                        <p className="hours-value">{getDayScheduleDisplay('saturday', garage.operating_hours)}</p>
                        <p className="hours-value">{getDayScheduleDisplay('sunday', garage.operating_hours)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="section-divider"></div>
                  
                  <div className="section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 className="section-title">Services</h3>
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => handleOpenServiceDialog(garage)}
                      >
                        <i className="btn-icon">+</i> Add Service
                      </button>
                    </div>
                    
                    {garage.services && garage.services.length > 0 ? (
                      <div style={{ marginTop: '1rem' }}>
                        {garage.services.map(service => (
                          <div key={service.id} className="service-item">
                            <div className="service-info">
                              <h4 className="service-name">{service.name}</h4>
                              <p className="service-details">
                                ${service.price} · {service.duration} mins
                              </p>
                            </div>
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={() => deleteService(garage.id, service.id)}
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        No services added yet
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="card-footer">
                  <button
                    className="btn btn-outline"
                    onClick={() => handleOpenGarageDialog('edit', garage)}
                  >
                    <i className="btn-icon">✏️</i> Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteGarage(garage.id)}
                  >
                    <i className="btn-icon">🗑️</i> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Garage Create/Edit Dialog */}
      {openGarageDialog && (
        <div className="dialog-overlay" onClick={() => setOpenGarageDialog(false)}>
          <div className="dialog" onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">
                {dialogMode === 'create' ? 'Create New Garage' : 'Edit Garage'}
              </h2>
            </div>
            <div className="dialog-body">
              <div className="form-group">
                <label className="form-label">Garage Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={garageForm.name}
                  onChange={handleGarageFormChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <h3 className="section-title">Location</h3>
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className="form-control"
                  name="location.address"
                  value={garageForm.location.address}
                  onChange={handleGarageFormChange}
                  required
                />
                
                <div className="form-grid" style={{ marginTop: '1rem' }}>
                  <div>
                    <label className="form-label">Latitude</label>
                    <input
                      type="number"
                      className="form-control"
                      name="location.coordinates.latitude"
                      value={garageForm.location.coordinates.latitude}
                      onChange={handleGarageFormChange}
                    />
                  </div>
                  <div>
                    <label className="form-label">Longitude</label>
                    <input
                      type="number"
                      className="form-control"
                      name="location.coordinates.longitude"
                      value={garageForm.location.coordinates.longitude}
                      onChange={handleGarageFormChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <h3 className="section-title">Contact Information</h3>
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-control"
                  name="contact_info.phone"
                  value={garageForm.contact_info.phone}
                  onChange={handleGarageFormChange}
                  required
                />
                
                <label className="form-label" style={{ marginTop: '1rem' }}>Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="contact_info.email"
                  value={garageForm.contact_info.email}
                  onChange={handleGarageFormChange}
                />
                
                <label className="form-label" style={{ marginTop: '1rem' }}>Website</label>
                <input
                  type="text"
                  className="form-control"
                  name="contact_info.website"
                  value={garageForm.contact_info.website}
                  onChange={handleGarageFormChange}
                />
              </div>
              
              <div className="form-group">
                <h3 className="section-title">Operating Hours</h3>
                
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  <div key={day} style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ textTransform: 'capitalize' }}>{day}</label>
                    <div className="form-grid">
                      <div>
                        <label className="form-label">Open</label>
                        <input
                          type="time"
                          className="form-control"
                          name={`operating_hours.${day}.open`}
                          value={garageForm.operating_hours[day]?.open || ''}
                          onChange={handleGarageFormChange}
                        />
                      </div>
                      <div>
                        <label className="form-label">Close</label>
                        <input
                          type="time"
                          className="form-control"
                          name={`operating_hours.${day}.close`}
                          value={garageForm.operating_hours[day]?.close || ''}
                          onChange={handleGarageFormChange}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="dialog-footer">
              <button className="btn btn-outline" onClick={() => setOpenGarageDialog(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={submitGarageForm}>
                {dialogMode === 'create' ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Service Add Dialog */}
      {openServiceDialog && (
        <div className="dialog-overlay" onClick={() => setOpenServiceDialog(false)}>
          <div className="dialog" onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">Add Service</h2>
            </div>
            <div className="dialog-body">
              <div className="form-group">
                <label className="form-label">Service Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={serviceForm.name}
                  onChange={handleServiceFormChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={serviceForm.description}
                  onChange={handleServiceFormChange}
                  rows={3}
                ></textarea>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="price"
                    value={serviceForm.price}
                    onChange={handleServiceFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Duration (minutes)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="duration"
                    value={serviceForm.duration}
                    onChange={handleServiceFormChange}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="dialog-footer">
              <button className="btn btn-outline" onClick={() => setOpenServiceDialog(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={submitServiceForm}>
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Dialog overlay style */}
      <style jsx>{`
        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .dialog {
          width: 90%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default GarageManagementPage;