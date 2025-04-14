import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import { 
  Container, 
  Card, 
  Badge, 
  Button, 
  Form, 
  Row, 
  Col, 
  Tabs, 
  Tab, 
  Alert 
} from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaUser, FaMapMarkerAlt, FaTools } from 'react-icons/fa';

const AssignmentsPage = () => {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [workerId, setWorkerId] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [activeStatus, setActiveStatus] = useState('active');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    // Redirect if not logged in or not a worker
    if (!user || user.role !== 'WORKER') {
      navigate('/login');
      return;
    }

    const fetchWorkerData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // First get worker ID from profile
        const profileRes = await axios.get('http://localhost:3000/api/v1/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!profileRes.data.data.worker) {
          throw new Error('Worker data not found');
        }
        
        setWorkerId(profileRes.data.data.worker.id);
        
        // Then fetch assignments
        const workerId = profileRes.data.data.worker.id;
        await fetchAssignments(workerId);
        
      } catch (err) {
        console.error('Error fetching worker data:', err);
        setError('Failed to load worker data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkerData();
  }, [user, token, navigate]);

  const fetchAssignments = async (id) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`http://localhost:3000/api/v1/workers/${id}/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAssignments(res.data.data.assignments);
      filterAssignments(res.data.data.assignments, activeStatus);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAssignments = (assignments, status) => {
    let filtered = [...assignments];
    
    // Filter by status
    if (status === 'active') {
      filtered = filtered.filter(a => 
        a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS'
      );
    } else if (status === 'completed') {
      filtered = filtered.filter(a => a.status === 'COMPLETED');
    } else if (status === 'cancelled') {
      filtered = filtered.filter(a => 
        a.status === 'CANCELLED' || a.status === 'NO_SHOW'
      );
    }
    
    // Apply search filter if any
    if (searchTerm) {
      filtered = filtered.filter(a => 
        (a.service_type && a.service_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.customer_notes && a.customer_notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.users && a.users.email && a.users.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.users && a.users.profile_data && a.users.profile_data.firstName && 
          a.users.profile_data.firstName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply date filter if any
    if (filterDate) {
      filtered = filtered.filter(a => 
        a.scheduled_time && a.scheduled_time.startsWith(filterDate)
      );
    }
    
    setFilteredAssignments(filtered);
  };

  const handleStatusChange = (status) => {
    setActiveStatus(status);
    filterAssignments(assignments, status);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    filterAssignments(assignments, activeStatus);
  };

  const handleDateFilter = (e) => {
    setFilterDate(e.target.value);
    filterAssignments(assignments, activeStatus);
  };

  const updateAssignmentStatus = async (assignmentId, newStatus) => {
    try {
      await axios.put(`http://localhost:3000/api/v1/bookings/${assignmentId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Refresh assignments after update
      if (workerId) {
        await fetchAssignments(workerId);
      }
    } catch (err) {
      console.error('Error updating assignment status:', err);
      setError('Failed to update assignment status. Please try again.');
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'Not scheduled';
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'primary';
      case 'IN_PROGRESS': return 'info';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'danger';
      case 'NO_SHOW': return 'warning';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return <div className="text-center p-5">Loading assignments...</div>;
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">
        <FaCalendarAlt className="me-2" />
        My Assignments
      </h1>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      {/* Filters */}
      <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-white' : ''}`}>
        <Card.Body>
          <Row>
            <Col md={6} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label>Search Assignments</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by service type, notes or customer"
                  value={searchTerm}
                  onChange={handleSearch}
                  className={theme === 'dark' ? 'bg-dark text-white' : ''}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Filter by Date</Form.Label>
                <Form.Control
                  type="date"
                  value={filterDate}
                  onChange={handleDateFilter}
                  className={theme === 'dark' ? 'bg-dark text-white' : ''}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Tabs for assignment status */}
      <Tabs
        activeKey={activeStatus}
        onSelect={handleStatusChange}
        className="mb-4"
      >
        <Tab eventKey="active" title="Active">
          {renderAssignmentsList('active')}
        </Tab>
        <Tab eventKey="completed" title="Completed">
          {renderAssignmentsList('completed')}
        </Tab>
        <Tab eventKey="cancelled" title="Cancelled">
          {renderAssignmentsList('cancelled')}
        </Tab>
      </Tabs>
    </Container>
  );

  function renderAssignmentsList(status) {
    if (filteredAssignments.length === 0) {
      return (
        <Card className={`my-3 ${theme === 'dark' ? 'bg-dark text-white' : ''}`}>
          <Card.Body className="text-center">
            <p className="mb-0">No {status} assignments found.</p>
          </Card.Body>
        </Card>
      );
    }

    return filteredAssignments.map(assignment => (
      <Card key={assignment.id} className={`mb-3 ${theme === 'dark' ? 'bg-dark text-white' : ''}`}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>{assignment.service_type || 'Service Appointment'}</h5>
            <Badge bg={getStatusBadgeVariant(assignment.status)}>
              {assignment.status}
            </Badge>
          </div>
          
          <Row className="mb-3">
            <Col md={6}>
              <p className="mb-2">
                <FaClock className="me-2" />
                <strong>Scheduled:</strong> {formatDateTime(assignment.scheduled_time)}
              </p>
              <p className="mb-2">
                <FaUser className="me-2" />
                <strong>Customer:</strong> {
                  assignment.users?.profile_data?.firstName 
                    ? `${assignment.users.profile_data.firstName} ${assignment.users.profile_data.lastName || ''}`
                    : assignment.users?.email || 'Unknown'
                }
              </p>
              {assignment.users?.profile_data?.phone && (
                <p className="mb-2">
                  <strong>Phone:</strong> {assignment.users.profile_data.phone}
                </p>
              )}
            </Col>
            <Col md={6}>
              <p className="mb-2">
                <FaMapMarkerAlt className="me-2" />
                <strong>Location:</strong> {assignment.garages?.name || 'Unknown garage'}
              </p>
              {assignment.estimated_duration && (
                <p className="mb-2">
                  <strong>Duration:</strong> {assignment.estimated_duration} minutes
                </p>
              )}
              {assignment.vehicle_details && (
                <p className="mb-2">
                  <FaTools className="me-2" />
                  <strong>Vehicle:</strong> {assignment.vehicle_details}
                </p>
              )}
            </Col>
          </Row>
          
          {assignment.customer_notes && (
            <div className="mb-3">
              <strong>Notes:</strong>
              <p className="mb-0">{assignment.customer_notes}</p>
            </div>
          )}
          
          {/* Action buttons based on status */}
          {(assignment.status === 'CONFIRMED' || assignment.status === 'IN_PROGRESS') && (
            <div className="d-flex gap-2">
              {assignment.status === 'CONFIRMED' && (
                <Button 
                  variant="primary"
                  onClick={() => updateAssignmentStatus(assignment.id, 'IN_PROGRESS')}
                >
                  Start Service
                </Button>
              )}
              {assignment.status === 'IN_PROGRESS' && (
                <Button 
                  variant="success"
                  onClick={() => updateAssignmentStatus(assignment.id, 'COMPLETED')}
                >
                  Complete Service
                </Button>
              )}
              <Button 
                variant="outline-danger"
                onClick={() => updateAssignmentStatus(assignment.id, 'CANCELLED')}
              >
                Cancel
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    ));
  }
};

export default AssignmentsPage;