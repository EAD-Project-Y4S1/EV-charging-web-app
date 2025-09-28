/**
 * UsersPage.jsx
 * Backoffice: CRUD users (placeholder layout with table and form trigger).
 */
import { useEffect, useState } from 'react'
import api from '../services/api'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        // GET /users -> [{ id, username, role }]
        const res = await api.get('/users')
        setUsers(res.data)
      } catch (err) {
        setError('Failed to load users')
      }
    })()
  }, [])

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3>Users</h3>
        <button className="btn btn-primary">Add User</button>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.role}</td>
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


