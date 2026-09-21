import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`)
      if (response.data.success) {
        setUser(response.data.data)
      } else {
        logout()
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      })
      
      if (response.data.success) {
        const { token, user } = response.data.data
        localStorage.setItem('token', token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setToken(token)
        setUser(user)
        return { success: true }
      }
      return { success: false, error: 'Login failed' }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      }
    }
  }

  const signup = async (email, password, fullName) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/signup`, {
        email,
        password,
        full_name: fullName
      })
      
      if (response.data.success) {
        return { success: true }
      }
      return { success: false, error: 'Signup failed' }
    } catch (error) {
      console.error('Signup error:', error)
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Signup failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/change-password`, {
        current_password: currentPassword,
        new_password: newPassword
      })
      
      if (response.data.success) {
        return { success: true }
      }
      return { success: false, error: 'Password change failed' }
    } catch (error) {
      console.error('Change password error:', error)
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Password change failed' 
      }
    }
  }

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email
      })
      
      if (response.data.success) {
        return { success: true, data: response.data.data }
      }
      return { success: false, error: 'Request failed' }
    } catch (error) {
      console.error('Forgot password error:', error)
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Request failed' 
      }
    }
  }

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        new_password: newPassword
      })
      
      if (response.data.success) {
        return { success: true }
      }
      return { success: false, error: 'Reset failed' }
    } catch (error) {
      console.error('Reset password error:', error)
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Reset failed' 
      }
    }
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    changePassword,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}