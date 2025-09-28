/**
 * App.jsx
 * Root application component with routing and auth provider.
 */
import './App.css'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppNavbar } from './components/AppNavbar'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import EvOwnersPage from './pages/EvOwnersPage'
import StationsPage from './pages/StationsPage'
import BookingsPage from './pages/BookingsPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route
            path="users"
            element={
              <ProtectedRoute roles={["Backoffice"]}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="ev-owners"
            element={
              <ProtectedRoute roles={["Backoffice"]}>
                <EvOwnersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="stations"
            element={
              <ProtectedRoute roles={["Backoffice", "Operator"]}>
                <StationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="bookings"
            element={
              <ProtectedRoute roles={["Backoffice", "Operator"]}>
                <BookingsPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

function Layout() {
  return (
    <div className="container-fluid p-0">
      <AppNavbar />
      <div className="container py-4">
        <Outlet />
      </div>
    </div>
  )
}

export default App
