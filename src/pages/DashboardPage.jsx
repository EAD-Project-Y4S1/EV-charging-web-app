/**
 * DashboardPage.jsx
 * Role-specific overview with counts from API.
 */
import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import img1 from './img.jpg';
import img2 from './img2.png';
import img3 from './img3.webp';

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
        // Always ensure bookings count is populated even if summary omits it
        try {
          const all = await api.get('/api/bookings/getall')
          if (mounted) setTotalBookings(Array.isArray(all.data) ? all.data.length : 0)
        } catch {}
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load dashboard')
        // On error, still try to show bookings count
        try {
          const all = await api.get('/api/bookings/getall')
          if (mounted) setTotalBookings(Array.isArray(all.data) ? all.data.length : 0)
        } catch {}
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
      <div class="container my-4">
  <div class="p-4 bg-light rounded-4 shadow-sm text-center">
    <h4 class="fw-bold text-success mb-2">Powering Sustainable Mobility</h4>
    <p class="text-muted fs-5 mb-0">
      Monitor users, owners, stations, and bookings in one place. Keep your EV charging network 
      efficient and user-friendly.
    </p>
  </div>
</div>

      {error && <div className="alert alert-danger">{error}</div>}
      {/* Full-width grid: stretch cards across available width */}
        <div className="row g-4">
          {['users', 'owners', 'stations', 'bookings'].map((key) => (
          <div className="col-12 col-sm-6 col-lg-3 d-flex" key={key}>
            <div
              className="ev-stat-card w-100 text-center p-3"
              style={{
                borderRadius: '12px',
                background: '#ffffff',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.08)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="py-2">
                <div
                  className="text-uppercase small ev-subtitle mb-1"
                  style={{
                    color: '#0d6efd', // Bootstrap blue
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                  }}
                >
                  {key}
                </div>
                <div
                  className="display-6"
                  style={{
                    color: '#0d6efd',
                    fontWeight: 700,
                  }}
                >
                  {key === 'bookings'
                    ? counts?.bookings ?? totalBookings ?? '-'
                    : counts?.[key] ?? '-'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <img src={img1} alt="EV visual 1" style={{width:'100%',objectFit:'cover',borderRadius:12,border:'1px solid var(--ev-border)',boxShadow:'0 8px 24px rgba(2,6,23,0.06)',height:220}} />
          </div>
          <div className="col-12 col-md-4">
            <img src={img2} alt="EV visual 2" style={{width:'100%',objectFit:'cover',borderRadius:12,border:'1px solid var(--ev-border)',boxShadow:'0 8px 24px rgba(2,6,23,0.06)',height:220}} />
          </div>
          <div className="col-12 col-md-4">
            <img src={img3} alt="EV visual 3" style={{width:'100%',objectFit:'cover',borderRadius:12,border:'1px solid var(--ev-border)',boxShadow:'0 8px 24px rgba(2,6,23,0.06)',height:220}} />
          </div>
        </div>
      </div>
    </div>
  )
}


