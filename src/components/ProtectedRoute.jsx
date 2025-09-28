/**
 * ProtectedRoute.jsx
 * Route guard that checks authentication and optional role list.
 */
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && roles.length > 0) {
    const hasRole = roles.includes(user?.role)
    if (!hasRole) {
      return <Navigate to="/" replace />
    }
  }

  return children
}


