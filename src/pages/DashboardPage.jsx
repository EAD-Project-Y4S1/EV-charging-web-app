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
        // Example expected endpoints (adjust to backend):
        // GET /dashboard/summary -> { users, owners, stations, bookings }
        const res = await api.get('/dashboard/summary')
        if (mounted) setCounts(res.data)
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load dashboard')
      }
    })()
    return () => { mounted = false }
  }, [])

  return (
    <div>
      <h3 className="mb-4">Dashboard</h3>
      <div className="text-muted mb-3">Welcome, {user?.username} ({user?.role})</div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-3">
        {['users','owners','stations','bookings'].map((key) => (
          <div className="col-12 col-sm-6 col-lg-3" key={key}>
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="text-uppercase small text-muted">{key}</div>
                <div className="display-6">{counts?.[key] ?? '-'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


