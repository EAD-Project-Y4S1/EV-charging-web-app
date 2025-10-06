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
  const [stations, setStations] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ownerNIC: '', stationId: '', reservationDateTime: '' })
  const [selectedStationId, setSelectedStationId] = useState('')
  const [selectedOwnerNIC, setSelectedOwnerNIC] = useState('')
  const [loadingMode, setLoadingMode] = useState('none') // 'station', 'owner', 'none'

  useEffect(() => { 
    loadStations()
  }, [])

  // Debug function to test booking creation
  async function testBookingCreation() {
    if (stations.length === 0) {
      setError('No stations available for testing. Please load stations first.')
      return
    }
    
    // Create a valid future date (tomorrow at 2 PM)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(14, 0, 0, 0) // 2:00 PM
    
    // Try different data structures
    const testDataOptions = [
      // Option 1: camelCase (JavaScript style)
      {
        ownerNIC: "123456789V",
        stationId: stations[0].id,
        reservationDateTime: tomorrow.toISOString()
      },
      // Option 2: PascalCase (C# style)
      {
        OwnerNIC: "123456789V",
        StationId: stations[0].id,
        ReservationDateTime: tomorrow.toISOString()
      }
    ]
    
    for (let i = 0; i < testDataOptions.length; i++) {
      const testData = testDataOptions[i]
      try {
        console.log(`Testing booking creation attempt ${i + 1} with data:`, testData)
        const response = await api.post('/api/bookings/create', testData)
        console.log('Backend accepted booking data:', response.data)
        setSuccess(`Test booking creation successful with format ${i + 1}!`)
        return // Exit if successful
      } catch (err) {
        console.error(`Attempt ${i + 1} failed:`, err.response?.data)
        if (i === testDataOptions.length - 1) {
          // Last attempt failed
          setError('All test attempts failed: ' + (err.response?.data?.title || err.response?.data?.message || 'Unknown error'))
        }
      }
    }
  }

  async function loadStations() {
    try {
      // Load stations first so user can select which station's bookings to view
      const res = await api.get('/api/chargingStations')
      setStations(res.data)
    } catch (err) {
      setError('Failed to load stations')
    }
  }

  async function loadBookingsByStation(stationId) {
    if (!stationId) return
    setError(''); setSuccess('')
    setLoadingMode('station')
    try {
      const res = await api.get(`/api/bookings/station/${stationId}`)
      setBookings(res.data)
      setSelectedStationId(stationId)
      setSelectedOwnerNIC('')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load bookings for station')
      setBookings([])
    }
  }

  async function loadBookingsByOwner(ownerNIC) {
    if (!ownerNIC) return
    setError(''); setSuccess('')
    setLoadingMode('owner')
    try {
      const res = await api.get(`/api/bookings/owner/${ownerNIC}`)
      setBookings(res.data)
      setSelectedOwnerNIC(ownerNIC)
      setSelectedStationId('')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load bookings for owner')
      setBookings([])
    }
  }

  function refresh() {
    if (selectedStationId) {
      loadBookingsByStation(selectedStationId)
    } else if (selectedOwnerNIC) {
      loadBookingsByOwner(selectedOwnerNIC)
    }
  }

  function onAdd() {
    setEditing(null)
    // Set default reservation time to tomorrow at 10 AM
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)
    const defaultDateTime = tomorrow.toISOString().slice(0, 16) // Format for datetime-local input
    
    setForm({ ownerNIC: '', stationId: '', reservationDateTime: defaultDateTime })
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
    
    // Validation
    if (!form.ownerNIC.trim()) {
      setError('Owner NIC is required')
      return
    }
    
    if (!form.stationId) {
      setError('Station selection is required')
      return
    }
    
    if (!form.reservationDateTime) {
      setError('Reservation date and time is required')
      return
    }
    
    // Validate reservation datetime according to business rules
    const reservationDate = new Date(form.reservationDateTime)
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000))
    
    if (reservationDate <= now) {
      setError('Reservation must be in the future')
      return
    }
    
    if (reservationDate > sevenDaysFromNow) {
      setError('Reservation must be within the next 7 days')
      return
    }
    
    try {
      // Prepare datetime in ISO format
      const dateValue = new Date(form.reservationDateTime)
      
      // Try different payload formats
      const payloadOptions = [
        // Option 1: camelCase (JavaScript standard)
        {
          ownerNIC: form.ownerNIC.trim(),
          stationId: form.stationId,
          reservationDateTime: dateValue.toISOString()
        },
        // Option 2: PascalCase (C# standard)
        {
          OwnerNIC: form.ownerNIC.trim(),
          StationId: form.stationId,
          ReservationDateTime: dateValue.toISOString()
        }
      ]
      
      let success = false
      let lastError = null
      
      for (let i = 0; i < payloadOptions.length && !success; i++) {
        const payload = payloadOptions[i]
        console.log(`Attempt ${i + 1} - Submitting booking with payload:`, payload)
        
        try {
          if (editing) {
            // Example: PUT /api/bookings/{id}
            const updatePayload = { ...payload, id: editing.id }
            console.log('Updating booking:', updatePayload)
            await api.put(`/api/bookings/${editing.id}`, updatePayload)
            setSuccess('Booking updated')
            success = true
          } else {
            // Example: POST /api/bookings/create
            console.log('Creating booking:', payload)
            await api.post('/api/bookings/create', payload)
            setSuccess('Booking created')
            success = true
          }
        } catch (err) {
          console.error(`Attempt ${i + 1} failed:`, err.response?.data)
          lastError = err
        }
      }
      
      if (!success && lastError) {
        throw lastError
      }
      setShowForm(false)
      refresh()
    } catch (err) {
      console.error('Booking save error:', err.response?.data)
      console.error('Full error object:', err.response)
      
      // Better error message handling
      let errorMessage = 'Save failed'
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.title) {
        errorMessage = err.response.data.title
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error occurred. Please check the data and try again.'
      }
      
      setError(errorMessage)
    }
  }

  return (
    // Full-width content container with padding
    <div className="mt-4 p-3 p-md-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3>Bookings</h3>
        <div>
          <button className="btn btn-outline-info me-2" onClick={testBookingCreation}>Test Backend</button>
          <button className="btn btn-primary" onClick={onAdd}>Add Booking</button>
        </div>
      </div>
      
      {/* Filter Controls */}
      <div className="card mb-3">
        <div className="card-body">
          <h6 className="card-title">Load Bookings</h6>
          <div className="row g-3">
            <div className="col-md-5">
              <label className="form-label">By Station</label>
              <div className="d-flex">
                <select 
                  className="form-select me-2" 
                  value={selectedStationId} 
                  onChange={(e) => setSelectedStationId(e.target.value)}
                >
                  <option value="">Select a station...</option>
                  {stations.map(station => (
                    <option key={station.id} value={station.id}>
                      {station.location} ({station.type === 1 ? 'AC' : 'DC'})
                    </option>
                  ))}
                </select>
                <button 
                  className="btn btn-outline-primary" 
                  onClick={() => loadBookingsByStation(selectedStationId)}
                  disabled={!selectedStationId}
                >
                  Load
                </button>
              </div>
            </div>
            <div className="col-md-2 d-flex align-items-center justify-content-center">
              <span className="text-muted">OR</span>
            </div>
            <div className="col-md-5">
              <label className="form-label">By Owner NIC</label>
              <div className="d-flex">
                <input 
                  type="text" 
                  className="form-control me-2" 
                  placeholder="Enter Owner NIC" 
                  value={selectedOwnerNIC}
                  onChange={(e) => setSelectedOwnerNIC(e.target.value)}
                />
                <button 
                  className="btn btn-outline-primary" 
                  onClick={() => loadBookingsByOwner(selectedOwnerNIC)}
                  disabled={!selectedOwnerNIC}
                >
                  Load
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Toast type={error ? 'error' : 'success'} message={error || success} />

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-striped mb-0">
          <thead>
            <tr>
              <th>Owner NIC</th>
              <th>Station</th>
              <th>Reservation Date & Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted py-4">
                  {loadingMode === 'none' ? 
                    'Select a station or enter an owner NIC to load bookings' : 
                    'No bookings found'
                  }
                </td>
              </tr>
            ) : (
              bookings.map(b => {
                const station = stations.find(s => s.id === b.stationId)
                const reservationDate = new Date(b.reservationDateTime)
                return (
                  <tr key={b.id}>
                    <td>{b.ownerNIC}</td>
                    <td>
                      {station ? `${station.location} (${station.type === 1 ? 'AC' : 'DC'})` : b.stationId}
                    </td>
                    <td>{reservationDate.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${b.status === 'Active' || b.status === 1 ? 'bg-success' : 'bg-warning'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => onEdit(b)}>Edit</button>
                      <button className="btn btn-sm btn-outline-warning me-2" onClick={() => onCancel(b)}>Cancel</button>
                    </td>
                  </tr>
                )
              })
            )}
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
                  
                  <div className="mb-3">
                    <label className="form-label">Station</label>
                    <select 
                      className="form-select" 
                      value={form.stationId} 
                      onChange={(e) => setForm({ ...form, stationId: e.target.value })}
                      required
                    >
                      <option value="">Select a station...</option>
                      {stations.map(station => (
                        <option key={station.id} value={station.id}>
                          {station.location} ({station.type === 1 ? 'AC' : 'DC'})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Reservation Date & Time</label>
                    <input 
                      type="datetime-local" 
                      className="form-control" 
                      value={form.reservationDateTime} 
                      onChange={(e) => setForm({ ...form, reservationDateTime: e.target.value })} 
                      min={(() => {
                        const now = new Date()
                        now.setMinutes(now.getMinutes() + 30) // Add 30 minutes buffer
                        return now.toISOString().slice(0, 16)
                      })()} 
                      max={(() => {
                        const sevenDays = new Date()
                        sevenDays.setDate(sevenDays.getDate() + 7)
                        return sevenDays.toISOString().slice(0, 16)
                      })()}
                      required 
                    />
                    <small className="form-text text-muted">
                      Reservation must be in the future and within the next 7 days
                    </small>
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


