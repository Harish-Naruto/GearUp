"use client"

import { useState, useContext, useEffect } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../../contexts/AuthContext"
import { ThemeContext } from "../../contexts/ThemeContext"
import { FaBars, FaBell, FaSearch, FaMoon, FaSun, FaSignOutAlt } from "react-icons/fa"
import "./DashboardHeader.css"

const DashboardHeader = ({ toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext)
  const { theme, toggleTheme } = useContext(ThemeContext)
  const [searchQuery, setSearchQuery] = useState("")
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Fetch notifications (mock data for now)
    const mockNotifications = [
      {
        id: 1,
        type: "BOOKING",
        content: { message: "New booking request" },
        read_status: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 2,
        type: "SYSTEM",
        content: { message: "Your booking status has been updated" },
        read_status: false,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 3,
        type: "PAYMENT",
        content: { message: "Payment received for booking #12345" },
        read_status: true,
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
    ]
    setNotifications(mockNotifications)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    // Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen)
  }

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "BOOKING":
        return "🗓️"
      case "SYSTEM":
        return "⚙️"
      case "PAYMENT":
        return "💰"
      default:
        return "📌"
    }
  }

  const unreadCount = notifications.filter((n) => !n.read_status).length

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </form>
      </div>

      <div className="header-right">
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>

        <div className="notification-container">
          <button className="notification-button" onClick={toggleNotifications}>
            <FaBell />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {notificationsOpen && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                <Link to="/notifications" className="view-all">
                  View All
                </Link>
              </div>
              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${!notification.read_status ? "unread" : ""}`}
                    >
                      <div className="notification-icon">{getNotificationIcon(notification.type)}</div>
                      <div className="notification-content">
                        <p className="notification-message">{notification.content.message}</p>
                        <span className="notification-time">{formatNotificationTime(notification.created_at)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-notifications">No notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="user-menu">
          <div className="user-info">
            <span className="user-name">{user?.profile_data?.name || user?.email}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button className="logout-button" onClick={logout}>
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
