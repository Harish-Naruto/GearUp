"use client"

import { useContext } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { AuthContext } from "../../contexts/AuthContext"
import {
  FaHome,
  FaCar,
  FaCalendarAlt,
  FaTools,
  FaUsers,
  FaUserCog,
  FaBell,
  FaChartBar,
  FaCog,
  FaClipboardList,
  FaWarehouse,
  FaHardHat,
  FaUserTie,
  FaUserShield,
  FaCarAlt,
} from "react-icons/fa"
import "./Sidebar.css"

const Sidebar = ({ isOpen, userRole }) => {
  const { user } = useContext(AuthContext)
  const location = useLocation()

  // Define navigation items based on user role
  const getUserNavItems = () => {
    const commonItems = [
      { path: "/profile", icon: <FaUserCog />, label: "Profile" },
      { path: "/notifications", icon: <FaBell />, label: "Notifications" },
    ]

    switch (userRole) {
      case "USER":
        return [
          { path: "/dashboard/user", icon: <FaHome />, label: "Dashboard" },
          { path: "/bookings", icon: <FaCalendarAlt />, label: "My Bookings" },
          { path: "/vehicles", icon: <FaCarAlt />, label: "My Vehicles" },
          { path: "/garages", icon: <FaWarehouse />, label: "Find Garages" },
          ...commonItems,
        ]
      case "MANAGER":
        return [
          { path: "/dashboard/manager", icon: <FaHome />, label: "Dashboard" },
          { path: "/manager/garage", icon: <FaWarehouse />, label: "My Garage" },
          { path: "/manager/services", icon: <FaTools />, label: "Services" },
          { path: "/manager/workers", icon: <FaHardHat />, label: "Workers" },
          { path: "/manager/bookings", icon: <FaCalendarAlt />, label: "Bookings" },
          { path: "/manager/reports", icon: <FaChartBar />, label: "Reports" },
          ...commonItems,
        ]
      case "WORKER":
        return [
          { path: "/dashboard/worker", icon: <FaHome />, label: "Dashboard" },
          { path: "/worker/assignments", icon: <FaClipboardList />, label: "Assignments" },
          { path: "/worker/availability", icon: <FaCalendarAlt />, label: "Availability" },
          ...commonItems,
        ]
      case "ADMIN":
        return [
          { path: "/dashboard/admin", icon: <FaHome />, label: "Dashboard" },
          { path: "/admin/users", icon: <FaUsers />, label: "Users" },
          { path: "/admin/garages", icon: <FaWarehouse />, label: "Garages" },
          { path: "/admin/settings", icon: <FaCog />, label: "Settings" },
          { path: "/admin/reports", icon: <FaChartBar />, label: "Reports" },
          ...commonItems,
        ]
      default:
        return commonItems
    }
  }

  const navItems = getUserNavItems()

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <FaCar className="sidebar-logo-icon" />
          {isOpen && <span className="sidebar-logo-text">VehicleRepair</span>}
        </div>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.profile_data?.avatar ? (
            <img src={user.profile_data.avatar || "/placeholder.svg"} alt="User avatar" />
          ) : (
            <div className="avatar-placeholder">{user?.email?.charAt(0).toUpperCase() || "U"}</div>
          )}
        </div>
        {isOpen && (
          <div className="user-info">
            <div className="user-name">{user?.profile_data?.name || user?.email}</div>
            <div className="user-role">
              {userRole === "USER" && (
                <>
                  <FaUserTie /> Vehicle Owner
                </>
              )}
              {userRole === "MANAGER" && (
                <>
                  <FaUserTie /> Garage Manager
                </>
              )}
              {userRole === "WORKER" && (
                <>
                  <FaHardHat /> Worker
                </>
              )}
              {userRole === "ADMIN" && (
                <>
                  <FaUserShield /> Administrator
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                title={!isOpen ? item.label : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                {isOpen && <span className="nav-label">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
