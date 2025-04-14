"use client"

import { useState, useContext } from "react"
import { Outlet } from "react-router-dom"
import { AuthContext } from "../contexts/AuthContext"
import Sidebar from "../components/navigation/Sidebar"
import DashboardHeader from "../components/navigation/DashboardHeader"
import "./DashboardLayout.css"

const DashboardLayout = () => {
  const { user } = useContext(AuthContext)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }
  
  // Make sure we're passing a string value for userRole, not an object
  const userRole = user?.role ? 
    (typeof user.role === 'object' ? JSON.stringify(user.role) : user.role) 
    : null;
  
  return (
    <div className="dashboard-layout">
      <DashboardHeader toggleSidebar={toggleSidebar} />
      <div className="dashboard-container">
        <Sidebar isOpen={sidebarOpen} userRole={userRole} />
        <main className={`dashboard-content ${sidebarOpen ? "" : "expanded"}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout