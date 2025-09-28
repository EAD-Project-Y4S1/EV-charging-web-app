/**
 * StationsPage.jsx
 * Manage stations: CRUD + update schedule + activate/deactivate.
 */
import { useEffect, useState } from 'react'
import api from '../services/api'

export default function StationsPage() {
  const [stations, setStations] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        // GET /stations -> [{ id, name, location, active }]
        const res = await api.get('/stations')
        setStations(res.data)
      } catch (err) {
        setError('Failed to load stations')
      }
    })()
  }, [])

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3>Charging Stations</h3>
        <button className="btn btn-primary">Add Station</button>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Location</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {stations.map(s => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.name}</td>
                <td>{s.location}</td>
                <td>{s.active ? 'Active' : 'Inactive'}</td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-secondary me-2">Edit</button>
                  <button className="btn btn-sm btn-outline-info me-2">Update Schedule</button>
                  <button className="btn btn-sm btn-outline-warning me-2">Toggle Active</button>
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


