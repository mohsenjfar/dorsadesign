// frontend/src/hooks/useProjects.js
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { getProjects, getFeaturedProjects, getProjectTypes } from '../services/api'

export const useProjects = (initialFilters = {}) => {
  const { i18n } = useTranslation()
  const [projects, setProjects] = useState([])
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(initialFilters)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 20,
    pages: 0,
  })

  // دریافت لیست پروژه‌ها
  const fetchProjects = useCallback(async (newFilters = filters) => {
    setLoading(true)
    setError(null)
    try {
      const language = i18n.language || 'en'
      const params = {
        skip: (pagination.page - 1) * pagination.pageSize,
        limit: pagination.pageSize,
        language: language,
        ...newFilters,
      }
      const data = await getProjects(params)
      console.log('📦 Projects data from API:', data)
      setProjects(data.items || [])
      setPagination({
        total: data.total || 0,
        page: data.page || 1,
        pageSize: data.page_size || 20,
        pages: data.pages || 0,
      })
    } catch (err) {
      setError(err.message || 'خطا در دریافت پروژه‌ها')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.pageSize, filters, i18n.language])

  // دریافت پروژه‌های ویژه
  const fetchFeatured = useCallback(async () => {
    try {
      const data = await getFeaturedProjects(4)
      setFeatured(data || [])
    } catch (err) {
      console.error('Error fetching featured projects:', err)
    }
  }, [])

  // تغییر صفحه
  const changePage = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }, [])

  // تغییر فیلترها
  const changeFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 })) // بازگشت به صفحه اول
  }, [])

  // ریست فیلترها
  const resetFilters = useCallback(() => {
    setFilters({})
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  // بارگذاری اولیه
  useEffect(() => {
    fetchProjects()
    fetchFeatured()
  }, [fetchProjects, fetchFeatured])

  // بارگذاری مجدد با تغییر صفحه یا فیلترها
  useEffect(() => {
    fetchProjects()
  }, [pagination.page, filters, fetchProjects])

  return {
    projects,
    featured,
    loading,
    error,
    filters,
    pagination,
    changePage,
    changeFilter,
    resetFilters,
    refetch: fetchProjects,
  }
}

// هوک برای دریافت انواع پروژه‌ها
export const useProjectTypes = () => {
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const data = await getProjectTypes()
        setTypes(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchTypes()
  }, [])

  return { types, loading, error }
}