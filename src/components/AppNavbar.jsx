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
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">EV Charging</Link>
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
            <span title="role">{user?.username} ({user?.role})</span>
            <button className="btn btn-outline-light btn-sm" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>
    </nav>
  )
}


