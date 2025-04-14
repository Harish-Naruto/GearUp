"use client"

import { useContext } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { AuthContext } from "../../contexts/AuthContext"
import LoadingScreen from "./LoadingScreen"

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useContext(AuthContext)
  const location = useLocation()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!user) {
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
