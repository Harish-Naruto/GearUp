"use client"

import { createContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import api from "../utils/api"
import LoadingScreen from "../components/common/LoadingScreen"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`
    }

    setIsLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password })
      const { token, user } = response.data.data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setToken(token)
      setUser(user)

      // Redirect based on user role
      if (user.role === "USER") {
        navigate("/dashboard/user")
      } else if (user.role === "MANAGER") {
        navigate("/dashboard/manager")
      } else if (user.role === "WORKER") {
        navigate("/dashboard/worker")
      } else if (user.role === "ADMIN") {
        navigate("/dashboard/admin")
      } else {
        navigate("/dashboard")
      }

      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Login failed. Please check your credentials.",
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData)
      const { token, user } = response.data.data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setToken(token)
      setUser(user)

      // Redirect based on user role
      if (user.role === "USER") {
        navigate("/dashboard/user")
      } else if (user.role === "MANAGER") {
        navigate("/dashboard/manager")
      } else if (user.role === "WORKER") {
        navigate("/dashboard/worker")
      } else {
        navigate("/dashboard")
      }

      return { success: true }
    } catch (error) {
      console.error("Registration error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed. Please try again.",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    delete api.defaults.headers.common["Authorization"]

    setToken(null)
    setUser(null)

    navigate("/")

    toast.success("You have been logged out successfully")
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put("/users/me", profileData)
      const updatedUser = { ...user, ...response.data.data.user }

      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)

      return { success: true }
    } catch (error) {
      console.error("Profile update error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update profile.",
      }
    }
  }

  const forgotPassword = async (email) => {
    try {
      await api.post("/auth/forgot-password", { email })
      return { success: true }
    } catch (error) {
      console.error("Forgot password error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to process request.",
      }
    }
  }

  const resetPassword = async (token, password) => {
    try {
      await api.post("/auth/reset-password", { token, password })
      return { success: true }
    } catch (error) {
      console.error("Reset password error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Failed to reset password.",
      }
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
