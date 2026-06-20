// frontend/src/services/api.js
import axios from 'axios'

// ایجاد نمونه Axios با تنظیمات پایه
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor برای اضافه کردن توکن به هدر (برای آینده)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ============================================
// API Functions
// ============================================

// دریافت لیست پروژه‌ها با فیلتر و صفحه‌بندی
export const getProjects = async (params = {}) => {
  try {
    const response = await api.get('/api/projects', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching projects:', error)
    throw error
  }
}

// دریافت پروژه‌های ویژه
export const getFeaturedProjects = async (limit = 4) => {
  try {
    const response = await api.get('/api/projects/featured', { params: { limit } })
    return response.data
  } catch (error) {
    console.error('Error fetching featured projects:', error)
    throw error
  }
}

// دریافت جزئیات یک پروژه با slug
export const getProjectBySlug = async (slug) => {
  try {
    const response = await api.get(`/api/projects/${slug}`)
    return response.data
  } catch (error) {
    console.error('Error fetching project details:', error)
    throw error
  }
}

// دریافت انواع پروژه‌ها (برای فیلتر)
export const getProjectTypes = async () => {
  // این را می‌توانید از API دریافت کنید یا به صورت استاتیک برگردانید
  return [
    { value: 'all', label: 'همه' },
    { value: 'residential', label: 'مسکونی' },
    { value: 'commercial', label: 'تجاری' },
    { value: 'office', label: 'اداری' },
    { value: 'villa', label: 'ویلایی' },
    { value: 'cultural', label: 'فرهنگی' },
    { value: 'educational', label: 'آموزشی' },
    { value: 'other', label: 'سایر' },
  ]
}

export default api