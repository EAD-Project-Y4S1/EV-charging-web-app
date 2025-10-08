/**
 * LoginPage.jsx
 * Handles user authentication using JWT tokens from the backend API.
 * Author: EVChargingWebService
 * Date: 2025-09-27
 */
import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
      await login({ email: form.email, password: form.password })
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
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #007BFF 0%, #0056b3 100%)',
        color: '#fff',
      }}
    >
      <div
        className="card shadow-lg border-0"
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: '16px',
          background: '#ffffff',
          color: '#000',
          padding: '32px 28px',
        }}
      >
        <div className="text-center mb-4">
          <div
            className="fw-bold"
            style={{
              fontSize: '1.6rem',
              color: '#007BFF',
              letterSpacing: '0.5px',
            }}
          >
            EV Charging Portal
          </div>
          <p className="text-muted mb-0">Access your dashboard securely</p>
        </div>

        <h5 className="text-center mb-3 fw-semibold">Sign in</h5>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address</label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="Enter your email"
              disabled={loading}
              style={{ borderRadius: '10px', padding: '10px 12px' }}
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              disabled={loading}
              style={{ borderRadius: '10px', padding: '10px 12px' }}
            />
          </div>

          {error && (
            <div className="alert alert-danger py-2 text-center" role="alert">
              {error}
            </div>
          )}

          <button
            className="btn w-100 fw-bold"
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#007BFF',
              color: '#fff',
              borderRadius: '10px',
              padding: '10px 0',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#0056b3')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#007BFF')}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div
          className="mt-4 text-center"
          style={{
            fontSize: '0.85rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '10px',
          }}
        >
          <strong>Default Admin Credentials:</strong>
          <div className="text-muted mt-1">
            Email: admin@evcs.local <br />
            Password: Admin#12345
          </div>
        </div>
      </div>
    </div>
  )
}
