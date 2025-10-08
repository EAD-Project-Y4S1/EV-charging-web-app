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
  const [form, setForm] = useState({ email: '', password: '', fullName: '', role: '1', isActive: true })

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
    setForm({ email: '', password: '', fullName: '', role: '1', isActive: true })
    setShowForm(true)
  }

  // Open edit form
  function onEdit(u) {
    setEditing(u)
    setForm({ email: u.email, password: '', fullName: u.fullName, role: String(u.role ?? ''), isActive: u.isActive })
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
      // Basic validation
      if (!form.email.trim()) {
        setError('Email is required')
        return
      }
      if (!editing && !form.password.trim()) {
        setError('Password is required')
        return
      }
      if (!form.fullName.trim()) {
        setError('Full name is required')
        return
      }
      if (!form.role) {
        setError('Role is required')
        return
      }

      if (editing) {
        // Example: PUT /api/users/{id}
        // Request: { email, fullName, role, isActive }
        await api.put(`/api/users/${editing.id}`, {
          email: form.email,
          fullName: form.fullName,
          role: Number(form.role),
          isActive: form.isActive
        })
        setSuccess('User updated')
      } else {
        // Example: POST /api/users
        // Request: { email, password, fullName, role }
        await api.post('/api/users/create', {
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          role: Number(form.role)
        })
        setSuccess('User created')
      }

      setShowForm(false)
      refresh()
    } catch (err) {
      const backendMsg = err?.response?.data?.message || err?.response?.data?.title
      const modelErrors = err?.response?.data?.errors
      let detailed = ''
      if (modelErrors && typeof modelErrors === 'object') {
        const firstKey = Object.keys(modelErrors)[0]
        const firstMsgs = Array.isArray(modelErrors[firstKey]) ? modelErrors[firstKey] : []
        if (firstMsgs.length > 0) detailed = firstMsgs[0]
      }
      setError(detailed || backendMsg || 'Save failed')

    }
  }

  // Wrap in container-like spacing and use card around table
  return (
    // Full-width content container with padding
    <div className="mt-4 p-3 p-md-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="ev-page-title m-0">Users</h3>
        <button className="btn btn-primary" onClick={onAdd}>Add User</button>
      </div>
      <Toast type={error ? 'error' : 'success'} message={error || success} />

      <div className="ev-card">
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
                  <button className="btn btn-sm btn-outline-light me-2" onClick={() => onEdit(u)}>Edit</button>
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
                      <option value="1">Backoffice</option>
                      <option value="2">StationOperator</option>
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


