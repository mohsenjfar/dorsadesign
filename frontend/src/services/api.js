// frontend/src/services/api.js
import axios from 'axios'
import { supabase } from '../lib/supabaseClient'

// خالی یعنی نسبی به همون origin صفحه — هر endpoint خودش پیشوند /api/ رو داره
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

console.log('🔵 API Base URL:', API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  async (config) => {
    config.params = {
      ...config.params,
      language: 'fa',
    }

    // Supabase access token (auto-refreshed by the Supabase client).
    // Falls back to the mirrored legacy slot for safety.
    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token || localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    })  // ← برای دیباگ
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // لاگ خطا برای دیباگ
    console.error('❌ API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: originalRequest?.url,
      method: originalRequest?.method,
    })

    // NOTE: no manual refresh — Supabase rotates its own tokens.
    // A 401 on an admin/auth endpoint means the session is gone → login.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const url = originalRequest?.url || ''
      if (url.startsWith('/api/admin') || url.startsWith('/api/auth')) {
        localStorage.removeItem('access_token')
        delete api.defaults.headers.common['Authorization']
        if (window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

// ============================================
// API Functions
// ============================================

export const getProjects = async (params = {}) => {
  try {
    const response = await api.get('/api/projects/', { params })
    return response.data
  } catch (error) {
    console.error('❌ Error fetching projects:', error)
    throw error
  }
}

export const getFeaturedProjects = async (limit = 4) => {
  try {
    const response = await api.get('/api/projects/featured', { params: { limit } })
    return response.data
  } catch (error) {
    console.error('❌ Error fetching featured projects:', error)
    throw error
  }
}

export const getProjectBySlug = async (slug) => {
  try {
    const response = await api.get(`/api/projects/${slug}`)
    return response.data
  } catch (error) {
    console.error('❌ Error fetching project details:', error)
    throw error
  }
}

export const getProjectTypes = async () => {
  return [
    { value: 'all', labelKey: 'projects.filter_all' },
    { value: 'residential', labelKey: 'projects.filter_residential' },
    { value: 'commercial', labelKey: 'projects.filter_commercial' },
    { value: 'office', labelKey: 'projects.filter_office' },
    { value: 'villa', labelKey: 'projects.filter_villa' },
    { value: 'cultural', labelKey: 'projects.filter_cultural' },
    { value: 'educational', labelKey: 'projects.filter_educational' },
    { value: 'other', labelKey: 'projects.filter_other' },
  ]
}

export const getProjectById = async (id) => {
  try {
    const response = await api.get(`/api/projects/id/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching project details:', error)
    throw error
  }
}

// آپلودها روی بک‌اند سرو می‌شن نه فرانت‌اند، پس مسیرهای نسبی /uploads باید به آدرس بک‌اند اشاره کنن
export const getImageUrl = (url) => {
  if (!url) return null
  if (url.startsWith('/uploads')) {
    return `${API_BASE_URL}${url}`
  }
  return url
}

export default api