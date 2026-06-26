// frontend/src/pages/admin/EditProject.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { 
  FiSave, FiX, FiPlus, FiTrash2, 
  FiImage, FiLoader, FiArrowLeft 
} from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'

const EditProject = () => {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { token } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  
  const MAX_GALLERY_IMAGES = 3
  
  // ============================================
  // State فرم (فقط فارسی - بدون اسلاگ)
  // ============================================
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    full_description: '',
    project_type: 'residential',
    client_name: '',
    year: '',
    area: '',
    status: 'draft',
    is_featured: false,
    features: [],
    cover_image: null,
    cover_file: null,
    gallery_images: [],
    gallery_files: [],
  })

  // ============================================
  // دریافت اطلاعات پروژه
  // ============================================
  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await api.get(`/api/admin/projects/by-id/${id}`)
        const data = response.data

        setFormData({
          title: data.title?.fa || data.title || '',
          description: data.description?.fa || data.description || '',
          full_description: data.full_description?.fa || data.full_description || '',
          project_type: data.project_type || 'residential',
          client_name: data.client_name || '',
          year: data.year || '',
          area: data.area || '',
          status: data.status || 'draft',
          is_featured: data.is_featured || false,
          features: data.features?.fa || data.features || [],
          cover_image: data.cover_image || null,
          cover_file: null,
          gallery_images: data.gallery_images ? data.gallery_images.split(',').filter(Boolean) : [],
          gallery_files: [],
        })
      } catch (err) {
        const errorMessage = err.response?.data?.detail || err.message || 'خطا در دریافت اطلاعات پروژه'
        setError(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProject()
    }
  }, [id])

  // ============================================
  // مدیریت فیلدها
  // ============================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // ============================================
  // مدیریت ویژگی‌ها
  // ============================================
  const handleFeatureChange = (index, value) => {
    setFormData(prev => {
      const newFeatures = [...prev.features]
      newFeatures[index] = value
      return { ...prev, features: newFeatures }
    })
  }

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }))
  }

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  // ============================================
  // آپلود تصویر کاور
  // ============================================
  const uploadCoverImage = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post('/api/admin/projects/upload/cover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data.url
    } catch (error) {
      console.error('Upload error:', error)
      throw new Error('خطا در آپلود تصویر کاور')
    }
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCover(true)
    setError('')

    try {
      const url = await uploadCoverImage(file)
      setFormData(prev => ({
        ...prev,
        cover_image: url,
        cover_file: null,
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUploadingCover(false)
    }
  }

  const removeCover = () => {
    setFormData(prev => ({
      ...prev,
      cover_image: null,
      cover_file: null,
    }))
  }

  // ============================================
  // آپلود تصاویر گالری با محدودیت
  // ============================================
  const uploadGalleryImages = async (files) => {
    const formData = new FormData()
    for (const file of files) {
      formData.append('files', file)
    }

    try {
      const response = await api.post('/api/admin/projects/upload/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data.urls || []
    } catch (error) {
      console.error('Upload error:', error)
      throw new Error('خطا در آپلود تصاویر گالری')
    }
  }

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const currentCount = formData.gallery_images.length
    const remainingSlots = MAX_GALLERY_IMAGES - currentCount
    
    if (files.length > remainingSlots) {
      setError(`حداکثر ${MAX_GALLERY_IMAGES} تصویر می‌توانید آپلود کنید. ${remainingSlots} جای خالی دارید.`)
      e.target.value = ''
      return
    }

    setUploadingGallery(true)
    setError('')

    try {
      const urls = await uploadGalleryImages(files)
      setFormData(prev => ({
        ...prev,
        gallery_images: [...prev.gallery_images, ...urls],
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUploadingGallery(false)
      e.target.value = ''
    }
  }

  const removeGalleryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index)
    }))
  }

  // ============================================
  // ارسال فرم (ویرایش - بدون اسلاگ)
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      if (!formData.title.trim()) {
        throw new Error('عنوان پروژه الزامی است')
      }

      const projectData = {
        title: {
          fa: formData.title
        },
        description: {
          fa: formData.description
        },
        full_description: {
          fa: formData.full_description
        },
        features: {
          fa: formData.features.filter(f => f.trim())
        },
        project_type: formData.project_type,
        client_name: formData.client_name,
        year: formData.year,
        area: formData.area,
        status: formData.status,
        is_featured: formData.is_featured,
        cover_image: formData.cover_image,
        gallery_images: formData.gallery_images.join(','),
      }

      await api.put(`/api/admin/projects/${id}`, projectData)
      navigate('/admin/dashboard')
    } catch (err) {
        const errorMessage = err.response?.data?.detail || err.message || 'خطا در ویرایش پروژه'
        setError(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage)
    } finally {
      setSaving(false)
    }
  }

  // ============================================
  // Render بخش تصاویر
  // ============================================
  const renderImageSection = () => (
    <div className="space-y-6">
      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          تصویر کاور
        </label>
        <div className="border-2 border-dashed border-gray-300 dark:border-dark-400 rounded-xl p-6 transition hover:border-primary-400 dark:hover:border-primary-500">
          {uploadingCover ? (
            <div className="flex flex-col items-center justify-center py-8">
              <FiLoader className="w-8 h-8 text-primary-600 animate-spin" />
              <p className="text-sm text-gray-500 mt-2">در حال آپلود...</p>
            </div>
          ) : formData.cover_image ? (
            <div className="relative max-w-md mx-auto">
              <img
                src={formData.cover_image}
                alt="Cover"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeCover}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <FiImage className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                برای آپلود تصویر کاور کلیک کنید
              </p>
              <label className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700 transition">
                انتخاب کاور
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          تصاویر گالری
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
            ({formData.gallery_images.length}/{MAX_GALLERY_IMAGES})
          </span>
        </label>
        <div className="border-2 border-dashed border-gray-300 dark:border-dark-400 rounded-xl p-6 transition hover:border-primary-400 dark:hover:border-primary-500">
          {uploadingGallery ? (
            <div className="flex flex-col items-center justify-center py-8">
              <FiLoader className="w-8 h-8 text-primary-600 animate-spin" />
              <p className="text-sm text-gray-500 mt-2">در حال آپلود...</p>
            </div>
          ) : formData.gallery_images.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {formData.gallery_images.map((url, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={url}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {formData.gallery_images.length < MAX_GALLERY_IMAGES && (
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-dark-400 rounded-lg cursor-pointer hover:border-primary-400 transition">
                  <FiPlus className="w-8 h-8 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">افزودن</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiImage className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                برای آپلود تصاویر گالری کلیک کنید
              </p>
              <label className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700 transition">
                انتخاب گالری
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  )

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
      className="container mx-auto px-4 py-8 max-w-4xl"
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
            ویرایش پروژه
          </h1>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
        >
          <FiX className="w-5 h-5" />
          انصراف
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ===== بخش اطلاعات پروژه (فقط فارسی) ===== */}
        <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-300">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-primary-600">🇮🇷</span>
            اطلاعات پروژه
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                عنوان پروژه *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
                required
                dir="rtl"
                placeholder="عنوان پروژه را وارد کنید"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                توضیحات کوتاه
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
                dir="rtl"
                placeholder="توضیحات کوتاه پروژه"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                توضیحات کامل
              </label>
              <textarea
                name="full_description"
                value={formData.full_description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
                dir="rtl"
                placeholder="توضیحات کامل پروژه"
              />
            </div>

            {/* ویژگی‌ها */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ویژگی‌ها
              </label>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
                      dir="rtl"
                      placeholder="یک ویژگی وارد کنید..."
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 text-red-500 hover:text-red-700 transition"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition text-sm"
                >
                  <FiPlus className="w-4 h-4" />
                  افزودن ویژگی
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== بخش اطلاعات عمومی ===== */}
        <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-300">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4">
            اطلاعات عمومی
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                نوع پروژه
              </label>
              <select
                name="project_type"
                value={formData.project_type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
              >
                <option value="residential">مسکونی</option>
                <option value="commercial">تجاری</option>
                <option value="office">اداری</option>
                <option value="villa">ویلایی</option>
                <option value="cultural">فرهنگی</option>
                <option value="educational">آموزشی</option>
                <option value="other">سایر</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                نام کارفرما
              </label>
              <input
                type="text"
                name="client_name"
                value={formData.client_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
                dir="rtl"
                placeholder="نام کارفرما"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                سال اجرا
              </label>
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
                placeholder="۱۴۰۴"
                dir="ltr"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                مساحت (متر مربع)
              </label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
                placeholder="۱۲۰۰"
                dir="ltr"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                وضعیت
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
              >
                <option value="draft">پیش‌نویس</option>
                <option value="published">منتشر شده</option>
                <option value="archived">بایگانی شده</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                پروژه ویژه
              </span>
            </label>
          </div>
        </div>

        {/* ===== بخش تصاویر ===== */}
        <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-300">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4">
            تصاویر پروژه
          </h2>
          {renderImageSection()}
        </div>

        {/* ===== دکمه‌ها ===== */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {saving ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                در حال ذخیره...
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5" />
                به‌روزرسانی پروژه
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export default EditProject