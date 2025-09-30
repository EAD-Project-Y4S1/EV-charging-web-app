/**
 * DashboardPage.jsx
 * Role-specific overview with counts from API.
 */
import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()
  const [counts, setCounts] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // GET /api/dashboard/summary -> { users, owners, stations, bookings }
        const res = await api.get('/api/dashboard/summary')
        if (mounted) setCounts(res.data)
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load dashboard')
      }
    })()
    return () => { mounted = false }
  }, [])

  // Layout: Responsive grid of four equal cards with spacing and centering
  return (
    // Full-width content with padding
    <div className="mt-4 p-3 p-md-4">
      <h3 className="mb-2">Dashboard</h3>
      <div className="text-muted mb-4">Welcome, {user?.email} ({user?.role})</div>
      {error && <div className="alert alert-danger">{error}</div>}
      {/* Full-width grid: stretch cards across available width */}
      <div className="row g-4">
        {['users','owners','stations','bookings'].map((key) => (
          <div className="col-12 col-sm-6 col-lg-3 d-flex" key={key}>
            <div className="card shadow-lg w-100 text-center">
              <div className="card-body py-4">
                <div className="text-uppercase small text-muted mb-1">{key}</div>
                <div className="display-6">{counts?.[key] ?? '-'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


