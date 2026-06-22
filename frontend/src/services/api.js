// frontend/src/services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ✅ Interceptor برای ارسال زبان به بک‌اند
api.interceptors.request.use((config) => {
  const language = localStorage.getItem('i18nextLng') || 'en'
  config.params = {
    ...config.params,
    language: language,
  }
  return config
})

// ============================================
// API Functions
// ============================================

export const getProjects = async (params = {}) => {
  try {
    const response = await api.get('/api/projects', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching projects:', error)
    throw error
  }
}

export const getFeaturedProjects = async (limit = 4) => {
  try {
    const response = await api.get('/api/projects/featured', { params: { limit } })
    return response.data
  } catch (error) {
    console.error('Error fetching featured projects:', error)
    throw error
  }
}

export const getProjectBySlug = async (slug) => {
  try {
    const response = await api.get(`/api/projects/${slug}`)
    return response.data
  } catch (error) {
    console.error('Error fetching project details:', error)
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

export default api