/**
 * BookingsPage.jsx
 * Manage bookings with create, update, and cancel respecting business rules.
 */
import { useEffect, useState } from 'react'
import api from '../services/api'
import Input from '../components/ui/Input'
import Toast from '../components/ui/Toast'

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ownerNIC: '', stationId: '', reservationDateTime: '' })

  useEffect(() => { refresh() }, [])

  async function refresh() {
    setError(''); setSuccess('')
    try {
      // Example: GET /api/bookings -> Booking[] (if implemented, otherwise fetch by station/owner as needed)
      // For simplicity, attempt to fetch all bookings (backend may restrict based on role)
      const res = await api.get('/api/bookings')
      setBookings(res.data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load bookings')
    }
  }

  function onAdd() {
    setEditing(null)
    setForm({ ownerNIC: '', stationId: '', reservationDateTime: '' })
    setShowForm(true)
  }

  function onEdit(b) {
    setEditing(b)
    setForm({ ownerNIC: b.ownerNIC, stationId: b.stationId, reservationDateTime: b.reservationDateTime?.slice(0,16) || '' })
    setShowForm(true)
  }

  async function onCancel(b) {
    if (!window.confirm('Cancel this booking?')) return
    try {
      // Example: POST /api/bookings/{id}/cancel
      await api.post(`/api/bookings/${b.id}/cancel`)
      setSuccess('Booking cancelled')
      refresh()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to cancel booking')
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      const payload = {
        ownerNIC: form.ownerNIC,
        stationId: form.stationId,
        reservationDateTime: new Date(form.reservationDateTime).toISOString()
      }
      if (editing) {
        // Example: PUT /api/bookings/{id}
        await api.put(`/api/bookings/${editing.id}`, payload)
        setSuccess('Booking updated')
      } else {
        // Example: POST /api/bookings
        await api.post('/api/bookings', payload)
        setSuccess('Booking created')
      }
      setShowForm(false)
      refresh()
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed')
    }
  }

  return (
    // Full-width content container with padding
    <div className="mt-4 p-3 p-md-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3>Bookings</h3>
        <button className="btn btn-primary" onClick={onAdd}>Add Booking</button>
      </div>
      <Toast type={error ? 'error' : 'success'} message={error || success} />

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-striped mb-0">
          <thead>
            <tr>
              <th>Owner NIC</th>
              <th>Station ID</th>
              <th>Reservation</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id}>
                <td>{b.ownerNIC}</td>
                <td>{b.stationId}</td>
                <td>{b.reservationDateTime}</td>
                <td>{b.status}</td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => onEdit(b)}>Edit</button>
                  <button className="btn btn-sm btn-outline-warning me-2" onClick={() => onCancel(b)}>Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editing ? 'Edit Booking' : 'Add Booking'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <form onSubmit={onSubmit}>
                <div className="modal-body">
                  <Input label="Owner NIC" value={form.ownerNIC} onChange={(e) => setForm({ ...form, ownerNIC: e.target.value })} required placeholder="Owner NIC" />
                  <Input label="Station ID" value={form.stationId} onChange={(e) => setForm({ ...form, stationId: e.target.value })} required placeholder="Station ID" />
                  <div className="mb-3">
                    <label className="form-label">Reservation Date & Time</label>
                    <input type="datetime-local" className="form-control" value={form.reservationDateTime} onChange={(e) => setForm({ ...form, reservationDateTime: e.target.value })} required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


