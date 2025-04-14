import axios from "axios"
import { toast } from "react-toastify"

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token")

    // If token exists, add it to the request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear localStorage
      localStorage.removeItem("token")
      localStorage.removeItem("user")

      // Show toast notification
      toast.error("Your session has expired. Please log in again.")

      // Redirect to login page if not already there
      if (window.location.pathname !== "/auth/login") {
        window.location.href = "/auth/login"
      }
    }

    // Handle 500 server errors
    if (error.response && error.response.status >= 500) {
      toast.error("Server error. Please try again later.")
    }

    // Handle network errors
    if (error.message === "Network Error") {
      toast.error("Network error. Please check your connection.")
    }

    return Promise.reject(error)
  },
)

export default api
