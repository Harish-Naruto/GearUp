"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { FaCar, FaCalendarAlt, FaMapMarkerAlt, FaTools, FaExclamationCircle } from "react-icons/fa"
import api from "../../utils/api"
import { toast } from "react-toastify"
import "./DashboardPages.css"

const UserDashboardPage = () => {
  const [recentBookings, setRecentBookings] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState({
    bookings: true,
    vehicles: true,
    notifications: true,
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch recent bookings
        const bookingsResponse = await api.get("http://localhost:3000/bookings", {
          params: {
            limit: 5,
            sort: "-created_at",
          },
        })
        setRecentBookings(bookingsResponse.data.data.bookings)
        setLoading((prev) => ({ ...prev, bookings: false }))

        // Fetch vehicles (mock data for now)
        // In a real app, you would have a vehicles endpoint
        const mockVehicles = [
          {
            id: "1",
            make: "Toyota",
            model: "Camry",
            year: 2019,
            license_plate: "ABC123",
            last_service: "2023-01-15",
          },
          {
            id: "2",
            make: "Honda",
            model: "Civic",
            year: 2020,
            license_plate: "XYZ789",
            last_service: "2023-03-22",
          },
        ]
        setVehicles(mockVehicles)
        setLoading((prev) => ({ ...prev, vehicles: false }))

        // Fetch notifications
        const notificationsResponse = await api.get("http://localhost:3000/users/notifications")
        setNotifications(notificationsResponse.data.data.notifications)
        setLoading((prev) => ({ ...prev, notifications: false }))
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast.error("Failed to load dashboard data")
        setLoading({
          bookings: false,
          vehicles: false,
          notifications: false,
        })
      }
    }

    fetchDashboardData()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "status-pending"
      case "CONFIRMED":
        return "status-confirmed"
      case "IN_PROGRESS":
        return "status-progress"
      case "COMPLETED":
        return "status-completed"
      case "CANCELLED":
        return "status-cancelled"
      default:
        return "status-default"
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>User Dashboard</h1>
        <p>Welcome back! Here's an overview of your vehicle services.</p>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-cards">
          <Link to="/garages" className="action-card">
            <div className="action-icon">
              <FaCar />
            </div>
            <div className="action-text">Find Garages</div>
          </Link>
          <Link to="/bookings" className="action-card">
            <div className="action-icon">
              <FaCalendarAlt />
            </div>
            <div className="action-text">My Bookings</div>
          </Link>
          <Link to="/bookings/new" className="action-card">
            <div className="action-icon">
              <FaTools />
            </div>
            <div className="action-text">New Booking</div>
          </Link>
          <Link to="/vehicles" className="action-card">
            <div className="action-icon">
              <FaMapMarkerAlt />
            </div>
            <div className="action-text">My Vehicles</div>
          </Link>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card recent-bookings">
          <div className="card-header">
            <h2>Recent Bookings</h2>
            <Link to="/bookings" className="view-all">
              View All
            </Link>
          </div>
          <div className="card-content">
            {loading.bookings ? (
              <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
              </div>
            ) : recentBookings.length > 0 ? (
              <div className="booking-list">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="booking-item">
                    <div className="booking-details">
                      <div className={`booking-status ${getStatusColor(booking.status)}`}>{booking.status}</div>
                      <div className="booking-service">{booking.service_type}</div>
                      <div className="booking-garage">{booking.garages?.name || "Unknown Garage"}</div>
                      <div className="booking-date">{formatDate(booking.scheduled_time)}</div>
                    </div>
                    <Link to={`/bookings/${booking.id}`} className="booking-view-btn">
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FaExclamationCircle className="empty-icon" />
                <h3>No bookings found</h3>
                <p>You haven't made any bookings yet.</p>
                <Link to="/bookings/new" className="btn btn-primary">
                  Book a Service
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card my-vehicles">
          <div className="card-header">
            <h2>My Vehicles</h2>
            <Link to="/vehicles" className="view-all">
              View All
            </Link>
          </div>
          <div className="card-content">
            {loading.vehicles ? (
              <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
              </div>
            ) : vehicles.length > 0 ? (
              <div className="vehicle-list">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="vehicle-item">
                    <div className="vehicle-icon">
                      <FaCar />
                    </div>
                    <div className="vehicle-details">
                      <div className="vehicle-name">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </div>
                      <div className="vehicle-plate">{vehicle.license_plate}</div>
                      <div className="vehicle-service">Last service: {formatDate(vehicle.last_service)}</div>
                    </div>
                    <Link to={`/vehicles/${vehicle.id}`} className="vehicle-view-btn">
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FaExclamationCircle className="empty-icon" />
                <h3>No vehicles found</h3>
                <p>You haven't added any vehicles yet.</p>
                <Link to="/vehicles/new" className="btn btn-primary">
                  Add Vehicle
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card notifications">
          <div className="card-header">
            <h2>Notifications</h2>
            <Link to="/notifications" className="view-all">
              View All
            </Link>
          </div>
          <div className="card-content">
            {loading.notifications ? (
              <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
              </div>
            ) : notifications.length > 0 ? (
              <div className="notification-list">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read_status ? "unread" : ""}`}
                  >
                    <div className="notification-content">
                      <div className="notification-message">{notification.content.message}</div>
                      <div className="notification-time">{formatDate(notification.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FaExclamationCircle className="empty-icon" />
                <h3>No notifications</h3>
                <p>You don't have any notifications yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboardPage
