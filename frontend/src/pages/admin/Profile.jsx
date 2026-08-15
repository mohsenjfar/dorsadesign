// frontend/src/pages/admin/Profile.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { 
  FiSave, FiX, FiUser, FiMail, FiLock, FiEye, FiEyeOff, 
  FiLoader, FiArrowLeft, FiCheckCircle 
} from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'

const Profile = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // ============================================
  // State فرم
  // ============================================
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  // ============================================
  // دریافت اطلاعات کاربر
  // ============================================
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await api.get('/api/auth/me')
        const data = response.data
        setFormData(prev => ({
          ...prev,
          full_name: data.full_name || '',
          email: data.email || '',
        }))
      } catch (err) {
        setError(err.response?.data?.detail || 'خطا در دریافت اطلاعات')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // ============================================
  // مدیریت فیلدها
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const togglePassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  // ============================================
  // ارسال فرم
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    // ✅ اعتبارسنجی رمز عبور جدید
    if (formData.new_password && formData.new_password.length < 6) {
      setError('رمز عبور جدید باید حداقل ۶ کاراکتر باشد')
      setSaving(false)
      return
    }

    if (formData.new_password !== formData.confirm_password) {
      setError('رمز عبور جدید و تکرار آن مطابقت ندارند')
      setSaving(false)
      return
    }

    try {
      // ✅ ساخت داده‌های ارسالی
      const updateData = {
        full_name: formData.full_name,
        email: formData.email,
      }

      // اگر رمز عبور جدید وارد شده، آن را هم ارسال کن
      if (formData.new_password) {
        updateData.current_password = formData.current_password
        updateData.new_password = formData.new_password
      }

      const response = await api.put('/api/auth/profile', updateData)
      
      setSuccess('اطلاعات با موفقیت به‌روزرسانی شد')
      
      // پاک کردن فیلدهای رمز عبور
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: '',
      }))

      // به‌روزرسانی اطلاعات کاربر در Context
      if (response.data) {
        // AuthContext را به‌روزرسانی کنید
        window.location.reload()
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'خطا در به‌روزرسانی اطلاعات')
    } finally {
      setSaving(false)
    }
  }

  // ============================================
  // Loading
  // ============================================
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <FiLoader className="w-10 h-10 text-primary-600 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  // ============================================
  // Render
  // ============================================
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8 max-w-3xl"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            {t('admin.profile.title')}
          </h1>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
        >
          <FiX className="w-5 h-5" />
          {t('admin.profile.cancel')}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 flex items-center gap-2">
          <FiCheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ===== اطلاعات پایه ===== */}
        <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-300">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FiUser className="w-5 h-5 text-primary-600" />
            {t('admin.profile.basic_info')}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.profile.username')}
              </label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-gray-100 dark:bg-dark-300 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {t('admin.profile.username_readonly')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.profile.full_name')}
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
                placeholder={t('admin.profile.full_name_placeholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.profile.email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
                placeholder={t('admin.profile.email_placeholder')}
                required
              />
            </div>
          </div>
        </div>

        {/* ===== تغییر رمز عبور ===== */}
        <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-300">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FiLock className="w-5 h-5 text-primary-600" />
            {t('admin.profile.change_password')}
          </h2>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t('admin.profile.password_hint')}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.profile.current_password')}
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition pr-10"
                  placeholder={t('admin.profile.current_password_placeholder')}
                />
                <button
                  type="button"
                  onClick={() => togglePassword('current')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                >
                  {showPasswords.current ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.profile.new_password')}
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition pr-10"
                  placeholder={t('admin.profile.new_password_placeholder')}
                />
                <button
                  type="button"
                  onClick={() => togglePassword('new')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                >
                  {showPasswords.new ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.profile.confirm_password')}
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition pr-10"
                  placeholder={t('admin.profile.confirm_password_placeholder')}
                />
                <button
                  type="button"
                  onClick={() => togglePassword('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                >
                  {showPasswords.confirm ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== دکمه‌ها ===== */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            {t('admin.profile.cancel')}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {saving ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                {t('admin.profile.saving')}
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5" />
                {t('admin.profile.save')}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export default Profile