/**
 * BookingsPage.jsx
 * Manage bookings with basic listing and placeholder actions.
 */
import { useEffect, useState } from 'react'
import api from '../services/api'

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        // GET /bookings -> [{ id, ownerName, stationName, startTime, endTime, status }]
        const res = await api.get('/bookings')
        setBookings(res.data)
      } catch (err) {
        setError('Failed to load bookings')
      }
    })()
  }, [])

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3>Bookings</h3>
        <button className="btn btn-primary">Add Booking</button>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Owner</th>
              <th>Station</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.ownerName}</td>
                <td>{b.stationName}</td>
                <td>{b.startTime}</td>
                <td>{b.endTime}</td>
                <td>{b.status}</td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-secondary me-2">Edit</button>
                  <button className="btn btn-sm btn-outline-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


