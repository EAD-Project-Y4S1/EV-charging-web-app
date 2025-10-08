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
  const [totalBookings, setTotalBookings] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // GET /api/dashboard/summary -> { users, owners, stations, bookings }
        const res = await api.get('/api/dashboard/summary')
        if (mounted) setCounts(res.data)
        // Fallback total bookings count if API doesn't include it
        if (!res.data?.bookings) {
          try {
            const all = await api.get('/api/bookings/getall')
            if (mounted) setTotalBookings(Array.isArray(all.data) ? all.data.length : 0)
          } catch {}
        }
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
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h3 className="ev-page-title m-0">Dashboard</h3>
        <span className="ev-badge"><span style={{width:8,height:8,background:'#12b981',borderRadius:999}}></span> Live</span>
      </div>
      <div className="ev-subtitle mb-2">Welcome, {user?.email} ({user?.role})</div>
      <div className="mb-4" style={{maxWidth:800}}>
        Powering sustainable mobility. Monitor users, owners, stations and bookings in one place. Keep your EV charging network efficient and user-friendly.
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {/* Full-width grid: stretch cards across available width */}
      <div className="row g-4">
        {['users','owners','stations','bookings'].map((key) => (
          <div className="col-12 col-sm-6 col-lg-3 d-flex" key={key}>
            <div className="ev-stat-card w-100 text-center p-3">
              <div className="py-2">
                <div className="text-uppercase small ev-subtitle mb-1">{key}</div>
                <div className="display-6">{key === 'bookings' ? (counts?.bookings ?? totalBookings ?? '-') : (counts?.[key] ?? '-')}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard illustration */}
      <div className="text-center mt-5">
        <img
          src="https://images.unsplash.com/photo-1634733988138-bf2c7ef2c9f1?q=80&w=1200&auto=format&fit=crop"
          alt="EV charging station"
          style={{maxWidth:'100%', borderRadius:12, border:'1px solid var(--ev-border)', boxShadow:'0 8px 24px rgba(2,6,23,0.06)'}}
        />
      </div>
    </div>
  )
}


