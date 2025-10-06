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
  const [form, setForm] = useState({
    reservationId: '',
    userId: '',
    userNic: '',
    stationName: '',
    vehicleNumber: '',
    vehicleModel: '',
    batteryCapacity: '',
    currentBattery: '',
    targetBattery: '',
    contactNumber: '',
    reservationDate: '',
    reservationTime: '',
    duration: '',
    priority: '',
    paymentMethod: '',
    specialRequirements: '',
    estimatedCost: '',
    sid: ''
  })
  const [selectedStationId, setSelectedStationId] = useState('')
  const [selectedOwnerNIC, setSelectedOwnerNIC] = useState('')
  const [loadingMode, setLoadingMode] = useState('none') // 'station', 'owner', 'none'

  useEffect(() => { 
    loadStations()
  }, [])

  async function loadAllBookings() {
    setError(''); setSuccess('')
    setLoadingMode('none')
    try {
      const res = await api.get('/api/bookings/getall')
      setBookings(res.data)
      setSelectedStationId('')
      setSelectedOwnerNIC('')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load all bookings')
      setBookings([])
    }
  }

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
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const defaultDate = tomorrow.toISOString().slice(0, 10)
    const defaultTime = '10:00'
    setForm({
      reservationId: '',
      userId: '',
      userNic: '',
      stationName: '',
      vehicleNumber: '',
      vehicleModel: '',
      batteryCapacity: '',
      currentBattery: '',
      targetBattery: '',
      contactNumber: '',
      reservationDate: defaultDate,
      reservationTime: defaultTime,
      duration: '',
      priority: '',
      paymentMethod: '',
      specialRequirements: '',
      estimatedCost: '',
      sid: ''
    })
    setShowForm(true)
  }

  function onEdit(b) {
    setEditing(b)
    setForm({
      reservationId: b.reservationId || '',
      userId: String(b.userId ?? ''),
      userNic: b.userNic || b.ownerNIC || '',
      stationName: b.stationName || '',
      vehicleNumber: b.vehicleNumber || '',
      vehicleModel: b.vehicleModel || '',
      batteryCapacity: b.batteryCapacity || '',
      currentBattery: b.currentBattery || '',
      targetBattery: b.targetBattery || '',
      contactNumber: b.contactNumber || '',
      reservationDate: b.reservationDate || (b.reservationDateTime ? new Date(b.reservationDateTime).toISOString().slice(0,10) : ''),
      reservationTime: b.reservationTime || (b.reservationDateTime ? new Date(b.reservationDateTime).toISOString().slice(11,16) : ''),
      duration: b.duration || '',
      priority: b.priority || '',
      paymentMethod: b.paymentMethod || '',
      specialRequirements: b.specialRequirements || '',
      estimatedCost: b.estimatedCost || '',
      sid: String(b.sid ?? '')
    })
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
      const backendMsg = err?.response?.data?.message || err?.response?.data?.title
      const msg = backendMsg || 'Cancel allowed only at least 12 hours before reservation'
      if (window.Swal && typeof window.Swal.fire === 'function') {
        window.Swal.fire({
          icon: 'warning',
          title: 'Cannot cancel booking',
          text: msg,
          confirmButtonText: 'OK'
        })
      } else if (window.Sweetalert2 && typeof window.Sweetalert2.fire === 'function') {
        window.Sweetalert2.fire('Cannot cancel booking', msg, 'warning')
      } else {
        setError(msg)
      }
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    
    // Validation for required backend fields
    const requiredFields = [
      ['reservationId', 'Reservation ID'],
      ['userId', 'User ID'],
      ['stationName', 'Station'],
      ['vehicleNumber', 'Vehicle Number'],
      ['vehicleModel', 'Vehicle Model'],
      ['contactNumber', 'Contact Number'],
      ['reservationDate', 'Reservation Date'],
      ['reservationTime', 'Reservation Time'],
      ['duration', 'Duration'],
      ['priority', 'Priority'],
      ['paymentMethod', 'Payment Method'],
      ['estimatedCost', 'Estimated Cost']
    ]
    for (const [key, label] of requiredFields) {
      if (!String(form[key] || '').trim()) {
        setError(`${label} is required`)
        return
      }
    }
    
    // Validate reservation datetime according to business rules
    const reservationDate = new Date(`${form.reservationDate}T${form.reservationTime}`)
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
      const payload = {
        ReservationId: form.reservationId.trim(),
        UserId: Number(form.userId),
        UserNic: form.userNic.trim() || null,
        StationName: form.stationName.trim(),
        VehicleNumber: form.vehicleNumber.trim(),
        VehicleModel: form.vehicleModel.trim(),
        BatteryCapacity: form.batteryCapacity.trim() || null,
        CurrentBattery: form.currentBattery.trim() || null,
        TargetBattery: form.targetBattery.trim() || null,
        ContactNumber: form.contactNumber.trim(),
        ReservationDate: form.reservationDate,
        ReservationTime: form.reservationTime,
        Duration: form.duration.trim(),
        Priority: form.priority.trim(),
        PaymentMethod: form.paymentMethod.trim(),
        SpecialRequirements: form.specialRequirements.trim() || null,
        EstimatedCost: form.estimatedCost.trim(),
        Sid: form.sid ? Number(form.sid) : null
      }

      if (editing) {
        await api.put(`/api/bookings/${editing.id}`, { ...payload, Id: editing.id })
        setSuccess('Booking updated')
      } else {
        await api.post('/api/bookings/create', payload)
        setSuccess('Booking created')
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
          <button className="btn btn-outline-secondary me-2" onClick={loadAllBookings}>Load All</button>
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
                const ownerNic = b.ownerNIC || b.userNic || ''
                const station = stations.find(s => s.id === b.stationId)
                const stationLabel = b.stationName || (station ? `${station.location} (${station.type === 1 ? 'AC' : 'DC'})` : (b.stationId || ''))
                const reservationIso = b.reservationDateTime || (b.reservationDate && b.reservationTime ? `${b.reservationDate} ${b.reservationTime}` : null)
                const reservationDate = reservationIso ? new Date(reservationIso) : new Date('')
                return (
                  <tr key={b.id}>
                    <td>{ownerNic}</td>
                    <td>{stationLabel}</td>
                    <td>{isNaN(reservationDate.getTime()) ? '-' : reservationDate.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${b.status === 'Active' || b.status === 1 ? 'bg-success' : 'bg-warning'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="text-end">
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
                  <div className="row g-3">
                    <div className="col-md-4">
                      <Input label="Reservation ID" value={form.reservationId} onChange={(e) => setForm({ ...form, reservationId: e.target.value })} required placeholder="Reservation ID" />
                    </div>
                    <div className="col-md-4">
                      <Input label="User ID" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} required placeholder="User ID (number)" />
                    </div>
                    <div className="col-md-4">
                      <Input label="Owner NIC (optional)" value={form.userNic} onChange={(e) => setForm({ ...form, userNic: e.target.value })} placeholder="Owner NIC" />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Station</label>
                    <select 
                      className="form-select" 
                      value={form.stationName} 
                      onChange={(e) => setForm({ ...form, stationName: e.target.value })}
                      required
                    >
                      <option value="">Select a station...</option>
                      {stations.map(station => (
                        <option key={station.id} value={station.location}>
                          {station.location} ({station.type === 1 ? 'AC' : 'DC'})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Reservation Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={form.reservationDate} 
                        onChange={(e) => setForm({ ...form, reservationDate: e.target.value })} 
                        required 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Reservation Time</label>
                      <input 
                        type="time" 
                        className="form-control" 
                        value={form.reservationTime} 
                        onChange={(e) => setForm({ ...form, reservationTime: e.target.value })} 
                        required 
                      />
                    </div>
                    <small className="form-text text-muted">
                      Reservation must be in the future and within the next 7 days
                    </small>
                  </div>

                  <div className="row g-3 mt-1">
                    <div className="col-md-6">
                      <Input label="Vehicle Number" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} required placeholder="Vehicle Number" />
                    </div>
                    <div className="col-md-6">
                      <Input label="Vehicle Model" value={form.vehicleModel} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} required placeholder="Vehicle Model" />
                    </div>
                  </div>

                  <div className="row g-3 mt-1">
                    <div className="col-md-4">
                      <Input label="Battery Capacity (optional)" value={form.batteryCapacity} onChange={(e) => setForm({ ...form, batteryCapacity: e.target.value })} placeholder="e.g., 60 kWh" />
                    </div>
                    <div className="col-md-4">
                      <Input label="Current Battery (optional)" value={form.currentBattery} onChange={(e) => setForm({ ...form, currentBattery: e.target.value })} placeholder="e.g., 30%" />
                    </div>
                    <div className="col-md-4">
                      <Input label="Target Battery (optional)" value={form.targetBattery} onChange={(e) => setForm({ ...form, targetBattery: e.target.value })} placeholder="e.g., 80%" />
                    </div>
                  </div>

                  <div className="row g-3 mt-1">
                    <div className="col-md-6">
                      <Input label="Contact Number" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} required placeholder="Contact Number" />
                    </div>
                    <div className="col-md-6">
                      <Input label="Duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required placeholder="e.g., 1h 30m" />
                    </div>
                  </div>

                  <div className="row g-3 mt-1">
                    <div className="col-md-4">
                      <Input label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} required placeholder="e.g., Normal/Urgent" />
                    </div>
                    <div className="col-md-4">
                      <Input label="Payment Method" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} required placeholder="e.g., Cash/Card" />
                    </div>
                    <div className="col-md-4">
                      <Input label="Estimated Cost" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} required placeholder="e.g., 1500" />
                    </div>
                  </div>

                  <div className="row g-3 mt-1">
                    <div className="col-md-8">
                      <Input label="Special Requirements (optional)" value={form.specialRequirements} onChange={(e) => setForm({ ...form, specialRequirements: e.target.value })} placeholder="Any notes" />
                    </div>
                    <div className="col-md-4">
                      <Input label="SID (optional)" value={form.sid} onChange={(e) => setForm({ ...form, sid: e.target.value })} placeholder="Numeric SID" />
                    </div>
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


