"use client"

import { useState, useContext } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { AuthContext } from "../../contexts/AuthContext"
import { FaCar, FaEnvelope, FaLock, FaSpinner } from "react-icons/fa"
import { toast } from "react-toastify"
import "./AuthPages.css"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await login(email, password)

      if (result.success) {
        toast.success("Login successful!")
        // Redirect will be handled by the login function in AuthContext
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.")
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <FaCar />
          </div>
          <h1>VehicleRepair</h1>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Enter your credentials to sign in to your account</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-with-link">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password" className="forgot-password">
                  Forgot password?
                </Link>
              </div>
              <div className="input-with-icon">
                <span className="input-icon">
                  <FaLock />
                </span>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <FaSpinner className="spinner" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/auth/register" className="auth-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage