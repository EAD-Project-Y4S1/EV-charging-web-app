/**
 * StationsPage.jsx
 * Manage stations: CRUD + update schedule + deactivate.
 */
import { useEffect, useState } from 'react'
import api from '../services/api'
import Input from '../components/ui/Input'
import Toast from '../components/ui/Toast'

export default function StationsPage() {
  const [stations, setStations] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ location: '', type: 'AC', slotsAvailable: 0, schedule: [] })
  const [scheduleInput, setScheduleInput] = useState('')

  useEffect(() => { refresh() }, [])

  async function refresh() {
    setError(''); setSuccess('')
    try {
      // Example: GET /api/chargingStations -> ChargingStation[]
      const res = await api.get('/api/chargingStations')
      setStations(res.data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load stations')
    }
  }

  function onAdd() {
    setEditing(null)
    setForm({ location: '', type: 'AC', slotsAvailable: 0, schedule: [] })
    setScheduleInput('')
    setShowForm(true)
  }

  function onEdit(s) {
    setEditing(s)
    setForm({ location: s.location, type: s.type, slotsAvailable: s.slotsAvailable, schedule: s.schedule || [] })
    setScheduleInput((s.schedule || []).join('\n'))
    setShowForm(true)
  }

  async function onDelete(s) {
    if (!window.confirm('Delete this station?')) return
    try {
      // Example: DELETE /api/chargingStations/{id}
      await api.delete(`/api/chargingStations/${s.id}`)
      setSuccess('Station deleted')
      refresh()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete station')
    }
  }

  async function onDeactivate(s) {
    try {
      // Example: PATCH /api/chargingStations/{id}/deactivate
      await api.patch(`/api/chargingStations/${s.id}/deactivate`)
      setSuccess('Station deactivated')
      refresh()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to deactivate station')
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    const schedule = scheduleInput.split('\n').map(s => s.trim()).filter(Boolean)
    try {
      if (editing) {
        // Example: PUT /api/chargingStations/{id}
        await api.put(`/api/chargingStations/${editing.id}`, {
          id: editing.id,
          location: form.location,
          type: form.type,
          slotsAvailable: Number(form.slotsAvailable),
          schedule
        })
        setSuccess('Station updated')
      } else {
        // Example: POST /api/chargingStations
        await api.post('/api/chargingStations', {
          location: form.location,
          type: form.type,
          slotsAvailable: Number(form.slotsAvailable)
        })
        setSuccess('Station created')
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
        <h3>Charging Stations</h3>
        <button className="btn btn-primary" onClick={onAdd}>Add Station</button>
      </div>
      <Toast type={error ? 'error' : 'success'} message={error || success} />

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-striped mb-0">
          <thead>
            <tr>
              <th>Location</th>
              <th>Type</th>
              <th>Slots</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {stations.map(s => (
              <tr key={s.id}>
                <td>{s.location}</td>
                <td>{s.type}</td>
                <td>{s.slotsAvailable}</td>
                <td>{s.status === 1 || s.status === 'Active' ? 'Active' : 'Inactive'}</td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => onEdit(s)}>Edit</button>
                  <button className="btn btn-sm btn-outline-warning me-2" onClick={() => onDeactivate(s)}>Deactivate</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(s)}>Delete</button>
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
                <h5 className="modal-title">{editing ? 'Edit Station' : 'Add Station'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <form onSubmit={onSubmit}>
                <div className="modal-body">
                  <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required placeholder="Location" />
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                      <option value="AC">AC</option>
                      <option value="DC">DC</option>
                    </select>
                  </div>
                  <Input label="Slots Available" type="number" value={form.slotsAvailable} onChange={(e) => setForm({ ...form, slotsAvailable: e.target.value })} required placeholder="0" />
                  <div className="mb-3">
                    <label className="form-label">Schedule (one per line)</label>
                    <textarea className="form-control" rows="4" value={scheduleInput} onChange={(e) => setScheduleInput(e.target.value)} placeholder="Mon 09:00-17:00\nTue 09:00-17:00"></textarea>
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


