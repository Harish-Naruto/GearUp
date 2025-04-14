import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import { Card, Container, Row, Col, Badge, Button } from 'react-bootstrap';
import { FaTools, FaCalendarAlt, FaClock, FaBriefcase } from 'react-icons/fa';

const WorkerDashboardPage = () => {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [workerData, setWorkerData] = useState(null);
  const [todaysAssignments, setTodaysAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not logged in or not a worker
    if (!user || user.role !== 'WORKER') {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Get profile data (including worker info)
        const profileRes = await axios.get('/api/v1/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (profileRes.data.data.worker) {
          setWorkerData(profileRes.data.data.worker);
          
          // Fetch today's assignments
          const workerId = profileRes.data.data.worker.id;
          const assignmentsRes = await axios.get(`/api/v1/workers/${workerId}/assignments`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { status: 'CONFIRMED,IN_PROGRESS' }
          });
          
          // Filter assignments for today
          const today = new Date().toISOString().split('T')[0];
          const todaysBookings = assignmentsRes.data.data.assignments.filter(
            a => a.scheduled_time && a.scheduled_time.startsWith(today)
          );
          setTodaysAssignments(todaysBookings);
        }

        // Fetch notifications
        const notifRes = await axios.get('/api/v1/users/notifications', {
          headers: { Authorization: `Bearer ${token}` },
          params: { read: false, limit: 5 }
        });
        setNotifications(notifRes.data.data.notifications);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, token, navigate]);

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/v1/users/notifications/${notificationId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update notifications list
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'danger';
      case 'ON_LEAVE': return 'warning';
      default: return 'secondary';
    }
  };

  const formatTimeRange = (start, end) => {
    if (!start || !end) return 'Not set';
    return `${start} - ${end}`;
  };

  const getCurrentDayAvailability = () => {
    if (!workerData || !workerData.availability) return 'Not available today';
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    const todayAvail = workerData.availability[today];
    
    return todayAvail ? formatTimeRange(todayAvail.start, todayAvail.end) : 'Not available today';
  };

  if (loading) {
    return <div className="text-center p-5">Loading dashboard...</div>;
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Worker Dashboard</h1>
      
      {/* Status Summary */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className={`mb-3 ${theme === 'dark' ? 'bg-dark text-white' : ''}`}>
            <Card.Body>
              <Card.Title>
                <FaBriefcase className="me-2" />
                Status
              </Card.Title>
              {workerData && (
                <>
                  <div className="d-flex justify-content-between align-items-center">
                    <h2>
                      <Badge bg={getStatusBadgeVariant(workerData.status)}>
                        {workerData.status || 'UNKNOWN'}
                      </Badge>
                    </h2>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => navigate('/worker/assignments')}
                    >
                      View Assignments
                    </Button>
                  </div>
                  <p className="mb-0">
                    <strong>Today's Availability:</strong> {getCurrentDayAvailability()}
                  </p>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className={`mb-3 ${theme === 'dark' ? 'bg-dark text-white' : ''}`}>
            <Card.Body>
              <Card.Title>
                <FaTools className="me-2" />
                Specializations
              </Card.Title>
              {workerData && workerData.specialization && (
                <div>
                  {workerData.specialization.length > 0 ? (
                    <div>
                      {workerData.specialization.map((spec, index) => (
                        <Badge key={index} bg="info" className="me-2 mb-2">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p>No specializations added yet.</p>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Today's Assignments */}
      <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-white' : ''}`}>
        <Card.Body>
          <Card.Title>
            <FaCalendarAlt className="me-2" />
            Today's Assignments
          </Card.Title>
          {todaysAssignments.length > 0 ? (
            <div className="list-group">
              {todaysAssignments.map(assignment => (
                <div key={assignment.id} className={`list-group-item ${theme === 'dark' ? 'bg-dark text-white border-secondary' : ''}`}>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5>{assignment.service_type || 'General Service'}</h5>
                    <Badge bg={assignment.status === 'CONFIRMED' ? 'primary' : 'success'}>
                      {assignment.status}
                    </Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small>
                      <FaClock className="me-1" />
                      {new Date(assignment.scheduled_time).toLocaleTimeString()}
                    </small>
                    <small>
                      Customer: {assignment.users.profile_data?.firstName || assignment.users.email}
                    </small>
                  </div>
                  {assignment.customer_notes && (
                    <p className="mb-1 text-muted">
                      <strong>Notes:</strong> {assignment.customer_notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No appointments scheduled for today.</p>
          )}
          <div className="mt-3">
            <Button variant="primary" onClick={() => navigate('/worker/assignments')}>
              View All Assignments
            </Button>
          </div>
        </Card.Body>
      </Card>
      
      {/* Notifications */}
      <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-white' : ''}`}>
        <Card.Body>
          <Card.Title>Recent Notifications</Card.Title>
          {notifications.length > 0 ? (
            <div className="list-group">
              {notifications.map(notification => (
                <div key={notification.id} className={`list-group-item ${theme === 'dark' ? 'bg-dark text-white border-secondary' : ''}`}>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6>{notification.content.message}</h6>
                      <small>{new Date(notification.created_at).toLocaleString()}</small>
                    </div>
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No new notifications.</p>
          )}
        </Card.Body>
      </Card>
      
      {/* Quick Actions */}
      <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-white' : ''}`}>
        <Card.Body>
          <Card.Title>Quick Actions</Card.Title>
          <div className="d-grid gap-2 d-md-flex">
            <Button onClick={() => navigate('/worker/availability')}>
              Update Availability
            </Button>
            <Button variant="outline-primary" onClick={() => navigate('/profile')}>
              Edit Profile
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default WorkerDashboardPage;