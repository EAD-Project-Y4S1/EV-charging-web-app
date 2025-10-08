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

  // Debug function to test backend requirements
  async function testBackendValidation() {
    const testData = {
      location: "Test Location",
      type: 1, // AC = 1 (enum value)
      slotsAvailable: 5,
      status: 1, // Active = 1 (enum value)
      schedule: []
    }
    
    try {
      console.log('Testing backend with correct enum data:', testData)
      const response = await api.post('/api/chargingStations', testData)
      console.log('Backend accepted data:', response.data)
      setSuccess('Test successful - backend is working!')
    } catch (err) {
      console.error('Backend validation requirements:', err.response?.data)
      setError('Test failed: ' + (err.response?.data?.title || 'Unknown error'))
    }
  }

  useEffect(() => { refresh() }, [])

  async function refresh() {
    setError(''); setSuccess('')
    try {
      // Example: GET /api/chargingStations -> ChargingStation[]
      const res = await api.get('/api/chargingStations')
      setStations(res.data)
      
      // Debug: Log the structure of existing stations to understand the expected format
      if (res.data && res.data.length > 0) {
        console.log('Sample station structure:', res.data[0])
      }
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
    // Convert enum values back to strings for the form
    const typeString = s.type === 1 ? 'AC' : 'DC'; // Convert enum back to string
    setForm({ 
      location: s.location, 
      type: typeString, 
      slotsAvailable: s.slotsAvailable, 
      schedule: s.schedule || [] 
    })
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

  async function onActivate(s) {
    try {
      // Example: POST /api/chargingStations/{id}/activate
      await api.post(`/api/chargingStations/${s.id}/activate`)
      setSuccess('Station activated')
      refresh()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to activate station')
    }
  }

  async function onDeactivate(s) {
    try {
      // Example: POST /api/chargingStations/{id}/deactivate
      await api.post(`/api/chargingStations/${s.id}/deactivate`)
      setSuccess('Station deactivated')
      refresh()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to deactivate station')
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    
    // Validation
    if (!form.location.trim()) {
      setError('Location is required')
      return
    }
    
    if (form.slotsAvailable < 0) {
      setError('Slots available must be 0 or greater')
      return
    }
    
    const schedule = scheduleInput.split('\n').map(s => s.trim()).filter(Boolean)
    
    // Prepare the station data with proper structure expected by backend
    const stationData = {
      location: form.location.trim(),
      type: form.type,
      slotsAvailable: parseInt(form.slotsAvailable) || 0,
      schedule: schedule,
      status: 1,
      isActive: true,
      // Add potential missing fields that backend might expect
      name: form.location.trim(), // Some APIs expect both name and location
      description: `${form.type} charging station at ${form.location.trim()}`,
      operatorId: null, // May be required by backend
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    try {
      if (editing) {
        // Convert string type to enum value as expected by backend
        const typeValue = form.type === 'AC' ? 1 : 2; // AC = 1, DC = 2
        
        // For updates, include the ID and use correct enum values
        const updateData = {
          id: editing.id,
          location: form.location.trim(),
          type: typeValue, // Send as enum value (1 or 2)
          slotsAvailable: parseInt(form.slotsAvailable) || 0,
          schedule: schedule,
          status: editing.status || 1 // ActiveStatus enum value
        }
        
        console.log('Updating station with data:', updateData)
        await api.put(`/api/chargingStations/${editing.id}`, updateData)
        setSuccess('Station updated')
      } else {
        // Convert string type to enum value as expected by backend
        const typeValue = form.type === 'AC' ? 1 : 2; // AC = 1, DC = 2
        
        // Create the station object that matches the backend ChargingStation model
        const createData = {
          location: form.location.trim(),
          type: typeValue, // Send as enum value (1 or 2)
          slotsAvailable: parseInt(form.slotsAvailable) || 0,
          status: 1, // ActiveStatus.Active = 1
          schedule: schedule || []
        }
        
        console.log('Creating station with data:', createData)
        const response = await api.post('/api/chargingStations', createData)
        
        setSuccess('Station created')
      }
      setShowForm(false)
      refresh()
    } catch (err) {
      console.error('Station save error:', err.response?.data)
      console.error('Full error object:', err.response)
      
      // Better error message handling
      let errorMessage = 'Save failed'
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors
        const errorMessages = []
        
        Object.keys(errors).forEach(field => {
          if (Array.isArray(errors[field])) {
            errorMessages.push(`${field}: ${errors[field].join(', ')}`)
          } else {
            errorMessages.push(`${field}: ${errors[field]}`)
          }
        })
        
        errorMessage = errorMessages.join('; ')
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.title) {
        errorMessage = err.response.data.title
      }
      
      setError(errorMessage)
    }
  }

  return (
    // Full-width content container with padding
    <div className="mt-4 p-3 p-md-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="ev-page-title m-0">Charging Stations</h3>
        <div>
          <button className="btn btn-outline-primary me-2" onClick={testBackendValidation}>Test Backend</button>
          <button className="btn btn-primary" onClick={onAdd}>Add Station</button>
        </div>
      </div>
      <Toast type={error ? 'error' : 'success'} message={error || success} />

      <div className="ev-card">
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
                <td>{s.type === 1 ? 'AC' : s.type === 2 ? 'DC' : s.type}</td>
                <td>{s.slotsAvailable}</td>
                <td>{s.status === 1 ? 'Active' : 'Inactive'}</td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-light me-2" onClick={() => onEdit(s)}>Edit</button>
                  {s.status === 1 ? (
                    <button className="btn btn-sm btn-outline-warning me-2" onClick={() => onDeactivate(s)}>Deactivate</button>
                  ) : (
                    <button className="btn btn-sm btn-outline-success me-2" onClick={() => onActivate(s)}>Activate</button>
                  )}
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
                  <button type="button" className="btn btn-outline-light" onClick={() => setShowForm(false)}>Cancel</button>
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


