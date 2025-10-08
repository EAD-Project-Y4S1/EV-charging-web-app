/**
 * AppNavbar.jsx
 * Top navigation bar with role-based menu visibility and logout.
 */
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AppNavbar() {
  const { user, logout } = useAuth()

  const isBackoffice = user?.role === 'Backoffice'
  const isOperator = user?.role === 'Operator'

  return (
    // Full-width, fixed, EV-themed gradient navbar
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
      {/* Changed from .container to .container-fluid for full-width navbar */}
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          {/* Simple lightning bolt icon using SVG to match EV theme */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M13 2L3 14h7l-1 8 11-12h-7l0-8z"></path>
          </svg>
          <span>EV Charging</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/dashboard">Dashboard</NavLink>
            </li>
            {isBackoffice && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/users">Users</NavLink>
              </li>
            )}
            {isBackoffice && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/ev-owners">EV Owners</NavLink>
              </li>
            )}
            {(isBackoffice || isOperator) && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/stations">Stations</NavLink>
              </li>
            )}
            {(isBackoffice || isOperator) && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/bookings">Bookings</NavLink>
              </li>
            )}
          </ul>
          <div className="d-flex align-items-center gap-3 text-white-50">
            <span title="role">{user?.email} ({user?.role})</span>
            <button className="btn btn-outline-light btn-sm" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>
    </nav>
  )
}


