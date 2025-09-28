/**
 * LoginPage.jsx
 * Handles user authentication using JWT tokens from the backend API.
 * Author: EVChargingWebService
 * Date: 2025-09-27
 */
import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const response = await api.post('/api/auth/login', {
        email: form.email,
        password: form.password
      })

      const { data } = response
      
      // Call the login function from AuthContext with the token and expiry
      await login(data.access_token, new Date(data.expires_at))
      
      // Redirect to dashboard on success
      navigate('/')
    } catch (err) {
      console.error('Login error:', err)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.response?.status === 401) {
        setError('Invalid email or password')
      } else if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        setError('Cannot connect to server. Please check if the backend is running.')
      } else {
        setError(err.message || 'Login failed')
      }
      setLoading(false)
    }
  }
   
  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="card shadow-sm" style={{ maxWidth: 420, width: '100%' }}>
        <div className="card-body">
          <h5 className="card-title mb-3">Sign in</h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="alert alert-danger py-2" role="alert">
                {error}
              </div>
            )}
            <button 
              className="btn btn-primary w-100" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
          
          {/* Default credentials info for development */}
          <div className="mt-3 p-2 bg-light rounded">
            <small className="text-muted">
              <strong>Default Admin Credentials:</strong><br />
              Email: admin@evcs.local<br />
              Password: Admin#12345
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}
