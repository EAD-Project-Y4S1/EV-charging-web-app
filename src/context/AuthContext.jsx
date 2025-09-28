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

  async function login(credentials) {
    // credentials: { username, password }
    const response = await api.post('/auth/login', credentials)
    // Expected response example:
    // { token: 'jwtString', user: { id, username, role: 'Backoffice'|'Operator' } }
    const { token: jwt, user: userInfo } = response.data
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


