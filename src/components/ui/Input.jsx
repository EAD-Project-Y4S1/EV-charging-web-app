/**
 * Input.jsx
 * Reusable input component (Bootstrap form-control wrapper).
 */
export default function Input({ label, type = 'text', value, onChange, required, placeholder }) {
  return (
    <div className="mb-3">
      {label && <label className="form-label">{label}</label>}
      <input
        type={type}
        className="form-control"
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
      />
    </div>
  )
}


