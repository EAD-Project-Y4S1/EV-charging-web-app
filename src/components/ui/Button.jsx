/**
 * Button.jsx
 * Reusable button component with Bootstrap styles.
 */
export default function Button({ children, variant = 'primary', className = '', ...rest }) {
  return (
    <button className={`btn btn-${variant} ${className}`} {...rest}>{children}</button>
  )
}


