"use client"

import { useState, useContext } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../../contexts/AuthContext"
import { FaCar, FaEnvelope, FaLock, FaSpinner, FaUserTie, FaHardHat, FaUser, FaPhone, FaIdCard } from "react-icons/fa"
import { toast } from "react-toastify"
import "./AuthPages.css"

const RegisterPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("USER")
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useContext(AuthContext)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const userData = {
        email,
        password,
        role,
        profile_data: {
          firstName,
          lastName,
          phone
        },
      }

      const result = await register(userData)

      if (result.success) {
        toast.success("Registration successful!")
        // Redirect will be handled by the register function in AuthContext
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.")
      console.error("Registration error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <FaCar className="auth-logo-icon" />
          <h1>VehicleRepair</h1>
        </div>
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create an Account</h2>
            <p>Enter your details to create a new account</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <FaEnvelope className="input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <div className="input-with-icon">
                <FaIdCard className="input-icon" />
                <input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <div className="input-with-icon">
                <FaIdCard className="input-icon" />
                <input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone (optional)</label>
              <div className="input-with-icon">
                <FaPhone className="input-icon" />
                <input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <FaLock className="input-icon" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-with-icon">
                <FaLock className="input-icon" />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <div className="role-selector">
                <div className={`role-option ${role === "USER" ? "selected" : ""}`} onClick={() => setRole("USER")}>
                  <div className="role-option-icon">
                    <FaUser />
                  </div>
                  <div className="role-option-label">Vehicle Owner</div>
                </div>
                <div
                  className={`role-option ${role === "MANAGER" ? "selected" : ""}`}
                  onClick={() => setRole("MANAGER")}
                >
                  <div className="role-option-icon">
                    <FaUserTie />
                  </div>
                  <div className="role-option-label">Garage Manager</div>
                </div>
                <div className={`role-option ${role === "WORKER" ? "selected" : ""}`} onClick={() => setRole("WORKER")}>
                  <div className="role-option-icon">
                    <FaHardHat />
                  </div>
                  <div className="role-option-label">Garage Worker</div>
                </div>
              </div>
            </div>
            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <FaSpinner className="spinner" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <Link to="/auth/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage