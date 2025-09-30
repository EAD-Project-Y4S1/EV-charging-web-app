/**
 * UsersPage.jsx
 * Backoffice: Full CRUD for application users.
 */
import { useEffect, useState } from 'react'
import api from '../services/api'
import Input from '../components/ui/Input'
import Toast from '../components/ui/Toast'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ email: '', password: '', fullName: '', role: 'Backoffice', isActive: true })

  // Load all users
  useEffect(() => {
    refresh()
  }, [])

  // Fetch users from API
  async function refresh() {
    setError(''); setSuccess('')
    try {
      // Example: GET /api/users -> User[]
      // Response: [{ id, email, fullName, role, isActive }]
      const res = await api.get('/api/users')
      setUsers(res.data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load users')
    }
  }

  // Open create form
  function onAdd() {
    setEditing(null)
    setForm({ email: '', password: '', fullName: '', role: 'Backoffice', isActive: true })
    setShowForm(true)
  }

  // Open edit form
  function onEdit(u) {
    setEditing(u)
    setForm({ email: u.email, password: '', fullName: u.fullName, role: u.role, isActive: u.isActive })
    setShowForm(true)
  }

  // Delete user
  async function onDelete(u) {
    if (!window.confirm('Delete this user?')) return
    try {
      // Example: DELETE /api/users/{id}
      await api.delete(`/api/users/${u.id}`)
      setSuccess('User deleted')
      refresh()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete user')
    }
  }

  // Submit create or update
  async function onSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      if (editing) {
        // Example: PUT /api/users/{id}
        // Request: { email, fullName, role, isActive }
        await api.put(`/api/users/${editing.id}`, {
          email: form.email,
          fullName: form.fullName,
          role: form.role,
          isActive: form.isActive
        })
        setSuccess('User updated')
      } else {
        // Example: POST /api/users
        // Request: { email, password, fullName, role }
        await api.post('/api/users', {
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          role: form.role
        })
        setSuccess('User created')
      }
      setShowForm(false)
      refresh()
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed')
    }
  }

  // Wrap in container-like spacing and use card around table
  return (
    // Full-width content container with padding
    <div className="mt-4 p-3 p-md-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3>Users</h3>
        <button className="btn btn-primary" onClick={onAdd}>Add User</button>
      </div>
      <Toast type={error ? 'error' : 'success'} message={error || success} />

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-striped mb-0">
          <thead>
            <tr>
              <th>Email</th>
              <th>Full Name</th>
              <th>Role</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.fullName}</td>
                <td>{u.role}</td>
                <td>{u.isActive ? 'Active' : 'Inactive'}</td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => onEdit(u)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(u)}>Delete</button>
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
                <h5 className="modal-title">{editing ? 'Edit User' : 'Add User'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <form onSubmit={onSubmit}>
                <div className="modal-body">
                  <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="user@example.com" />
                  {!editing && (
                    <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="Password" />
                  )}
                  <Input label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required placeholder="Full name" />
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                      <option value="Backoffice">Backoffice</option>
                      <option value="StationOperator">StationOperator</option>
                    </select>
                  </div>
                  {editing && (
                    <div className="form-check mb-2">
                      <input className="form-check-input" type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} id="activeCheck" />
                      <label className="form-check-label" htmlFor="activeCheck">Active</label>
                    </div>
                  )}
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


