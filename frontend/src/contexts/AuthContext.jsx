// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // ============================================
  // دریافت توکن از localStorage
  // ============================================
  const getToken = () => localStorage.getItem('access_token')

  // ============================================
  // بررسی احراز هویت (بر اساس وجود توکن)
  // ============================================
  const isAuthenticated = !!user || !!getToken()

  // ============================================
  // Load user on mount و هر بار که توکن تغییر کند
  // ============================================
  useEffect(() => {
    const loadUser = async () => {
      const token = getToken()
      
      if (!token) {
        setLoading(false)
        return
      }

      // ✅ تنظیم هدر Authorization
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      try {
        const response = await api.get('/api/auth/me')
        setUser(response.data)
      } catch (error) {
        console.error('Failed to load user:', error)
        // اگر توکن نامعتبر است، آن را پاک کن
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          delete api.defaults.headers.common['Authorization']
        }
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, []) // ✅ فقط یک بار در mount

  // ============================================
  // Login
  // ============================================
  const login = async (username, password) => {
    try {
      const response = await api.post('/api/auth/login', { username, password })
      const { access_token, refresh_token } = response.data
      
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      const userResponse = await api.get('/api/auth/me')
      setUser(userResponse.data)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Login failed'
      }
    }
  }

  // ============================================
  // Logout
  // ============================================
  const logout = async () => {
    try {
      const token = getToken()
      if (token) {
        await api.post('/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      navigate('/admin/login')
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}