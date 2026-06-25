// frontend/src/services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://dorsadesign.ir',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============================================
// ✅ Interceptor برای ارسال زبان و توکن
// ============================================
api.interceptors.request.use(
  (config) => {
    // اضافه کردن زبان
    const language = localStorage.getItem('i18nextLng') || 'en'
    config.params = {
      ...config.params,
      language: language,
    }

    // ✅ اضافه کردن توکن به هدر
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ============================================
// ✅ Interceptor برای مدیریت خطاهای 401
// ============================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // اگر خطای 401 بود و قبلاً برای refresh تلاش نکرده بودیم
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        // درخواست توکن جدید
        const response = await axios.post(
          `${api.defaults.baseURL}/api/auth/refresh`,
          { refresh_token: refreshToken }
        )

        const { access_token } = response.data
        localStorage.setItem('access_token', access_token)
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

        // درخواست اصلی را با توکن جدید تکرار کن
        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return api(originalRequest)
      } catch (refreshError) {
        // اگر رفرش ناموفق بود، کاربر را به لاگین هدایت کن
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        delete api.defaults.headers.common['Authorization']
        window.location.href = '/admin/login'
        return Promise.reject(refreshError)
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
    const response = await api.get('/api/projects', { params })
    console.log('🌐 API response:', response.data)
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