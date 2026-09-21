import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ChangePassword from './pages/ChangePassword'
import Dashboard from './pages/Dashboard'
import FindLeads from './pages/FindLeads'
import Leads from './pages/Leads'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-[#0B0E1A]">
          <Routes>
            {/* Public Routes - Landing is the default */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Navbar />
                <div className="pt-20 px-6 pb-8">
                  <Dashboard />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/find-leads" element={
              <ProtectedRoute>
                <Navbar />
                <div className="pt-20 px-6 pb-8">
                  <FindLeads />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/leads" element={
              <ProtectedRoute>
                <Navbar />
                <div className="pt-20 px-6 pb-8">
                  <Leads />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/change-password" element={
              <ProtectedRoute>
                <Navbar />
                <div className="pt-20 px-6 pb-8">
                  <ChangePassword />
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App