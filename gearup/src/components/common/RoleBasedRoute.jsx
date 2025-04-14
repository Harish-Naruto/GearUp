"use client"

import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../../contexts/AuthContext"
import LoadingScreen from "./LoadingScreen"

const RoleBasedRoute = ({ roles, children }) => {
  const { user, isLoading } = useContext(AuthContext)

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  if (!roles.includes(user.role)) {
    // Redirect based on user role
    if (user.role === "USER") {
      return <Navigate to="/dashboard/user" replace />
    } else if (user.role === "MANAGER") {
      return <Navigate to="/dashboard/manager" replace />
    } else if (user.role === "WORKER") {
      return <Navigate to="/dashboard/worker" replace />
    } else if (user.role === "ADMIN") {
      return <Navigate to="/dashboard/admin" replace />
    } else {
      return <Navigate to="/dashboard" replace />
    }
  }

  return children
}

export default RoleBasedRoute
