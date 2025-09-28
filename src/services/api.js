/**
 * api.js
 * Axios instance with base URL and interceptors for JWT auth and 401 handling.
 */
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5148', // Backend HTTP port
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
  // Force HTTP protocol
  httpsAgent: false,
  httpAgent: true
})

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global response handler: redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
