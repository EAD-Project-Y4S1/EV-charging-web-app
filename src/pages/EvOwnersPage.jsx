/**
 * EvOwnersPage.jsx
 * Backoffice: CRUD owners + activate/deactivate by NIC.
 */
import { useEffect, useState } from 'react'
import api from '../services/api'

export default function EvOwnersPage() {
  const [owners, setOwners] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        // GET /owners -> [{ id, name, nic, active }]
        const res = await api.get('/owners')
        setOwners(res.data)
      } catch (err) {
        setError('Failed to load owners')
      }
    })()
  }, [])

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3>EV Owners</h3>
        <button className="btn btn-primary">Add Owner</button>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>NIC</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {owners.map(o => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.name}</td>
                <td>{o.nic}</td>
                <td>{o.active ? 'Active' : 'Inactive'}</td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-secondary me-2">Edit</button>
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


