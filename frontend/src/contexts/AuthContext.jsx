// frontend/src/contexts/AuthContext.jsx
// Supabase Auth (replaces the old FastAPI JWT /api/auth/* flow).
//
// Session source of truth: supabase.auth.getSession() + onAuthStateChange.
// Supabase handles token refresh internally — no manual /api/auth/refresh.
//
// Admin gating: the old backend `is_superuser` flag maps to the Supabase
// user's `role` (app_metadata.role, fallback user_metadata.role).
// This site has a single admin area: any authenticated user may enter
// (ProtectedRoute checks isAuthenticated, unchanged). `isAdmin` is exposed
// for conditional UI and equals role === 'admin'.
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Map a Supabase auth user to the app's user shape.
// Keeps legacy fields (username, full_name, is_superuser) so admin pages
// (Dashboard, Profile) keep working unchanged.
const mapUser = (sbUser) => {
  if (!sbUser) return null
  const appMeta = sbUser.app_metadata || {}
  const userMeta = sbUser.user_metadata || {}
  const role = appMeta.role || userMeta.role || 'admin'
  const email = sbUser.email || ''
  return {
    id: sbUser.id,
    email,
    username: userMeta.username || (email ? email.split('@')[0] : ''),
    full_name: userMeta.full_name || userMeta.display_name || '',
    role,
    // Back-compat with the old FastAPI `is_superuser` flag
    is_superuser: role === 'admin',
  }
}

// Mirror the Supabase access token into the legacy localStorage slot so any
// remaining readers (axios interceptor, debugging) keep working.
const mirrorToken = (session) => {
  const token = session?.access_token
  if (token) {
    localStorage.setItem('access_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token') // legacy FastAPI slot, no longer used
    delete api.defaults.headers.common['Authorization']
  }
  return token || null
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // ============================================
  // Initial session + auth state subscription
  // ============================================
  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        if (!mounted) return
        setSession(data.session || null)
        setUser(mapUser(data.session?.user))
        setToken(mirrorToken(data.session))
      } catch (error) {
        console.error('Failed to load session:', error)
        if (mounted) {
          setSession(null)
          setUser(null)
          setToken(null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return
      setSession(newSession)
      setUser(mapUser(newSession?.user))
      setToken(mirrorToken(newSession))
      setLoading(false)
    })

    return () => {
      mounted = false
      listener?.subscription?.unsubscribe()
    }
  }, [])

  const isAuthenticated = !!user && !!session
  const isAdmin = user?.role === 'admin' || !!user?.is_superuser

  // ============================================
  // Login — Supabase signInWithPassword (email + password).
  // The login form's "username" field is treated as the email address.
  // ============================================
  const login = async (username, password) => {
    try {
      const email = (username || '').trim()
      if (!email || !password) {
        return { success: false, message: 'Email and password are required' }
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      setSession(data.session)
      setUser(mapUser(data.session?.user))
      setToken(mirrorToken(data.session))
      return { success: true }
    } catch (error) {
      const msg =
        error?.message === 'Invalid login credentials'
          ? 'Invalid email or password'
          : error?.message || 'Login failed'
      return { success: false, message: msg }
    }
  }

  // ============================================
  // Logout — Supabase signOut
  // ============================================
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setSession(null)
      setUser(null)
      setToken(null)
      mirrorToken(null)
      navigate('/admin/login')
    }
  }, [navigate])

  // Re-read the current Supabase user (e.g. after a profile update)
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getUser()
      setUser(mapUser(data?.user))
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }, [])

  const getToken = () => token || localStorage.getItem('access_token')

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        refreshUser,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
