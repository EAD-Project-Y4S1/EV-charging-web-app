/**
 * Toast.jsx
 * Minimal toast/alert wrapper using Bootstrap alerts.
 */
export default function Toast({ type = 'success', message }) {
  if (!message) return null
  const className = type === 'error' ? 'alert-danger' : type === 'warning' ? 'alert-warning' : 'alert-success'
  return <div className={`alert ${className}`} role="alert">{message}</div>
}


