import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Paper, 
  TextField, 
  Grid, 
  Divider, 
  Card, 
  CardContent, 
  CardActions, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  Chip,
  Rating
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  LocationOn,
  Phone,
  Email,
  AccessTime,
  Star
} from '@mui/icons-material';
import axios from 'axios';

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
  const [serviceDialogMode, setServiceDialogMode] = useState('add');
  const [currentService, setCurrentService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 60
  });

  // For notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
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
      
      const response = await axios.get(`/api/v1/garages?${queryParams.toString()}`, {
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

  const handleOpenServiceDialog = (mode, garage, service = null) => {
    setCurrentGarage(garage);
    setServiceDialogMode(mode);
    if (mode === 'edit' && service) {
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

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const submitGarageForm = async () => {
    try {
      let response;
      
      if (dialogMode === 'create') {
        response = await axios.post('/api/v1/garages', garageForm, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        showNotification('Garage created successfully');
      } else {
        response = await axios.put(`/api/v1/garages/${currentGarage.id}`, garageForm, {
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
      await axios.post(`/api/v1/garages/${currentGarage.id}/services`, serviceForm, {
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
      await axios.delete(`/api/v1/garages/${garageId}/services/${serviceId}`, {
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
      await axios.delete(`/api/v1/garages/${garageId}`, {
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

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Garage Management
        </Typography>
        
        {/* Search and filters bar */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                placeholder="Search garages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={handleSearch}
              >
                Search
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => handleOpenGarageDialog('create')}
              >
                Add Garage
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Garages list */}
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : garages.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">No garages found</Typography>
            <Typography variant="body2" color="textSecondary">
              Create a new garage to get started
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {garages.map(garage => (
              <Grid item xs={12} md={6} key={garage.id}>
                <Card elevation={3}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">{garage.name}</Typography>
                      <Box>
                        {garage.ratings && (
                          <Box display="flex" alignItems="center">
                            <Rating value={garage.ratings} readOnly precision={0.5} size="small" />
                            <Typography variant="body2" color="textSecondary" ml={1}>
                              ({garage.total_ratings || 0})
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                    
                    <Box display="flex" alignItems="center" mb={1}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" ml={1}>
                        {garage.location?.address || 'No address provided'}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" mb={1}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2" ml={1}>
                        {garage.contact_info?.phone || 'No phone provided'}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" mb={2}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2" ml={1}>
                        {garage.contact_info?.email || 'No email provided'}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Hours of Operation
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Monday:</Typography>
                        <Typography variant="body2" color="textSecondary">Tuesday:</Typography>
                        <Typography variant="body2" color="textSecondary">Wednesday:</Typography>
                        <Typography variant="body2" color="textSecondary">Thursday:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">{getDayScheduleDisplay('monday', garage.operating_hours)}</Typography>
                        <Typography variant="body2">{getDayScheduleDisplay('tuesday', garage.operating_hours)}</Typography>
                        <Typography variant="body2">{getDayScheduleDisplay('wednesday', garage.operating_hours)}</Typography>
                        <Typography variant="body2">{getDayScheduleDisplay('thursday', garage.operating_hours)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Friday:</Typography>
                        <Typography variant="body2" color="textSecondary">Saturday:</Typography>
                        <Typography variant="body2" color="textSecondary">Sunday:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">{getDayScheduleDisplay('friday', garage.operating_hours)}</Typography>
                        <Typography variant="body2">{getDayScheduleDisplay('saturday', garage.operating_hours)}</Typography>
                        <Typography variant="body2">{getDayScheduleDisplay('sunday', garage.operating_hours)}</Typography>
                      </Grid>
                    </Grid>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2">Services</Typography>
                        <Button 
                          size="small" 
                          startIcon={<AddIcon />}
                          onClick={() => handleOpenServiceDialog('add', garage)}
                        >
                          Add Service
                        </Button>
                      </Box>
                      
                      {garage.services && garage.services.length > 0 ? (
                        <Box mt={1}>
                          {garage.services.map(service => (
                            <Box 
                              key={service.id} 
                              display="flex" 
                              justifyContent="space-between" 
                              alignItems="center"
                              p={1}
                              borderRadius={1}
                              mb={1}
                              bgcolor="background.default"
                            >
                              <Box flex={1}>
                                <Typography variant="body2">{service.name}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                  ${service.price} · {service.duration} mins
                                </Typography>
                              </Box>
                              <IconButton 
                                size="small" 
                                onClick={() => deleteService(garage.id, service.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary" mt={1}>
                          No services added yet
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenGarageDialog('edit', garage)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => deleteGarage(garage.id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Garage Create/Edit Dialog */}
      <Dialog 
        open={openGarageDialog} 
        onClose={() => setOpenGarageDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Create New Garage' : 'Edit Garage'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Garage Name"
                name="name"
                value={garageForm.name}
                onChange={handleGarageFormChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Location</Typography>
              <TextField
                fullWidth
                label="Address"
                name="location.address"
                value={garageForm.location.address}
                onChange={handleGarageFormChange}
                required
                margin="normal"
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    name="location.coordinates.latitude"
                    type="number"
                    value={garageForm.location.coordinates.latitude}
                    onChange={handleGarageFormChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    name="location.coordinates.longitude"
                    type="number"
                    value={garageForm.location.coordinates.longitude}
                    onChange={handleGarageFormChange}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Contact Information</Typography>
              <TextField
                fullWidth
                label="Phone"
                name="contact_info.phone"
                value={garageForm.contact_info.phone}
                onChange={handleGarageFormChange}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email"
                name="contact_info.email"
                type="email"
                value={garageForm.contact_info.email}
                onChange={handleGarageFormChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Website"
                name="contact_info.website"
                value={garageForm.contact_info.website}
                onChange={handleGarageFormChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Operating Hours</Typography>
              
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                <Box key={day} display="flex" alignItems="center" mb={2}>
                  <Typography variant="body2" width={100} textTransform="capitalize">
                    {day}:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Open"
                        name={`operating_hours.${day}.open`}
                        type="time"
                        value={garageForm.operating_hours[day]?.open || ''}
                        onChange={handleGarageFormChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Close"
                        name={`operating_hours.${day}.close`}
                        type="time"
                        value={garageForm.operating_hours[day]?.close || ''}
                        onChange={handleGarageFormChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGarageDialog(false)}>Cancel</Button>
          <Button onClick={submitGarageForm} variant="contained" color="primary">
            {dialogMode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Service Add Dialog */}
      <Dialog 
        open={openServiceDialog} 
        onClose={() => setOpenServiceDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add Service
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Service Name"
                name="name"
                value={serviceForm.name}
                onChange={handleServiceFormChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={serviceForm.description}
                onChange={handleServiceFormChange}
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={serviceForm.price}
                onChange={handleServiceFormChange}
                required
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                name="duration"
                type="number"
                value={serviceForm.duration}
                onChange={handleServiceFormChange}
                required
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenServiceDialog(false)}>Cancel</Button>
          <Button onClick={submitServiceForm} variant="contained" color="primary">
            Add Service
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notifications */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default GarageManagementPage;