/**
 * EvOwnersPage.jsx
 * Backoffice: CRUD owners + activate/deactivate by NIC.
 */
import { useEffect, useState } from 'react'
import api from '../services/api'
import Input from '../components/ui/Input'
import Toast from '../components/ui/Toast'

export default function EvOwnersPage() {
  const [owners, setOwners] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ nic: '', name: '', email: '', phone: '', vehicleDetails: '', status: 'Active' })

  useEffect(() => {
    refresh()
  }, [])

  async function refresh() {
    setError(''); setSuccess('')
    try {
      // Example: GET /api/eVOwners -> EVOwner[]
      const res = await api.get('/api/eVOwners')
      setOwners(res.data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load owners')
    }
  }

  function onAdd() {
    setEditing(null)
    setForm({ nic: '', name: '', email: '', phone: '', vehicleDetails: '', status: 'Active' })
    setShowForm(true)
  }

  function onEdit(o) {
    setEditing(o)
    setForm({ nic: o.nic, name: o.name, email: o.email || '', phone: o.phone || '', vehicleDetails: o.vehicleDetails || '', status: o.status === 1 || o.status === 'Active' ? 'Active' : 'Inactive' })
    setShowForm(true)
  }

  async function onDelete(o) {
    if (!window.confirm('Delete this owner?')) return
    try {
      // Example: DELETE /api/eVOwners/{nic}
      await api.delete(`/api/eVOwners/${o.nic}`)
      setSuccess('Owner deleted')
      refresh()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete owner')
    }
  }

  async function onToggle(o) {
    try {
      // Example: PATCH /api/eVOwners/{nic}/activate or deactivate
      if (o.status === 1 || o.status === 'Active') {
        await api.patch(`/api/eVOwners/${o.nic}/deactivate`)
        setSuccess('Owner deactivated')
      } else {
        await api.patch(`/api/eVOwners/${o.nic}/activate`)
        setSuccess('Owner activated')
      }
      refresh()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to change status')
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      if (editing) {
        // Example: PUT /api/eVOwners/{nic}
        await api.put(`/api/eVOwners/${editing.nic}`, {
          nic: form.nic,
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
          vehicleDetails: form.vehicleDetails || null,
          status: form.status
        })
        setSuccess('Owner updated')
      } else {
        // Example: POST /api/eVOwners
        await api.post('/api/eVOwners', {
          nic: form.nic,
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
          vehicleDetails: form.vehicleDetails || null
        })
        setSuccess('Owner created')
      }
      setShowForm(false)
      refresh()
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed')
    }
  }

  function statusLabel(s) {
    return (s === 1 || s === 'Active') ? 'Active' : 'Inactive'
  }

  // Card-wrapped table and centered modal-lg for better layout
  return (
    // Full-width content container with padding
    <div className="mt-4 p-3 p-md-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3>EV Owners</h3>
        <button className="btn btn-primary" onClick={onAdd}>Add Owner</button>
      </div>
      <Toast type={error ? 'error' : 'success'} message={error || success} />

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-striped mb-0">
          <thead>
            <tr>
              <th>NIC</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {owners.map(o => (
              <tr key={o.nic}>
                <td>{o.nic}</td>
                <td>{o.name}</td>
                <td>{o.email}</td>
                <td>{o.phone}</td>
                <td>{statusLabel(o.status)}</td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => onEdit(o)}>Edit</button>
                  <button className="btn btn-sm btn-outline-warning me-2" onClick={() => onToggle(o)}>{statusLabel(o.status) === 'Active' ? 'Deactivate' : 'Activate'}</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(o)}>Delete</button>
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
                <h5 className="modal-title">{editing ? 'Edit Owner' : 'Add Owner'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <form onSubmit={onSubmit}>
                <div className="modal-body">
                  <Input label="NIC" value={form.nic} onChange={(e) => setForm({ ...form, nic: e.target.value })} required placeholder="NIC" />
                  <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Owner name" />
                  <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email(optional)" />
                  <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="phone(optional)" />
                  <Input label="Vehicle Details" value={form.vehicleDetails} onChange={(e) => setForm({ ...form, vehicleDetails: e.target.value })} placeholder="vehicle(optional)" />
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


