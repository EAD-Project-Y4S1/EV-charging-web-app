/**
 * AuthContext.jsx
 * Provides authentication state, login/logout, and role information.
 * - Persists JWT in localStorage under key 'token'
 * - Example login payload:
 *   POST http://localhost:5000/api/auth/login
 *   { "username": "admin", "password": "Passw0rd!" }
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const isAuthenticated = Boolean(token)

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  function decodeJwt(token) {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (e) {
      return null
    }
  }

  async function login(credentials) {
    // credentials: { email, password }
    const response = await api.post('/api/auth/login', credentials)
    // Backend returns: { access_token, expires_at }
    const { access_token: jwt } = response.data
    const claims = decodeJwt(jwt) || {}
    const userInfo = {
      id: claims.sub,
      email: claims.email || claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
      fullName: claims.name || claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
      role:
        claims.role ||
        claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"]
    }
    setToken(jwt)
    setUser(userInfo)
    return userInfo
  }

  function logout() {
    setToken(null)
    setUser(null)
    window.location.href = '/login'
  }

  const value = useMemo(
    () => ({ token, user, isAuthenticated, login, logout }),
    [token, user, isAuthenticated]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


