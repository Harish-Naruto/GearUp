"use client"

import { useState, useContext, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { AuthContext } from "../../contexts/AuthContext"
import { ThemeContext } from "../../contexts/ThemeContext"
import { FaCar, FaUser, FaBell, FaBars, FaTimes, FaMoon, FaSun } from "react-icons/fa"
import "./Header.css"

const Header = () => {
  const { user, logout } = useContext(AuthContext)
  const { theme, toggleTheme } = useContext(ThemeContext)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen)
  }

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="header-container">
        <div className="logo-container">
          <Link to="/" className="logo">
            <FaCar className="logo-icon" />
            <span className="logo-text">Gearup</span>
          </Link>
        </div>

        <nav className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>
            Home
          </Link>
          <Link to="/garages" className={location.pathname.startsWith("/garages") ? "active" : ""}>
            Find Garages
          </Link>
          <Link to="/about" className={location.pathname === "/about" ? "active" : ""}>
            About
          </Link>
          <Link to="/contact" className={location.pathname === "/contact" ? "active" : ""}>
            Contact
          </Link>
        </nav>

        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>

          {user ? (
            <>
              <Link to="/notifications" className="notification-icon">
                <FaBell />
                <span className="notification-badge">3</span>
              </Link>
              <div className="user-menu-container">
                <button className="user-menu-button" onClick={toggleUserMenu}>
                  <FaUser />
                </button>
                {userMenuOpen && (
                  <div className="user-menu">
                    <div className="user-info">
                      <span className="user-email">{user.email}</span>
                      <span className="user-role">{user.role}</span>
                    </div>
                    <div className="user-menu-links">
                      <Link to="/dashboard">Dashboard</Link>
                      <Link to="/profile">Profile</Link>
                      <Link to="/bookings">My Bookings</Link>
                      <Link to="/vehicles">My Vehicles</Link>
                      <button onClick={logout}>Sign Out</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/auth/login" className="login-button">
                Sign In
              </Link>
              <Link to="/auth/register" className="register-button">
                Sign Up
              </Link>
            </div>
          )}

          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
