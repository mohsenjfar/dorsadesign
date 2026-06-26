// frontend/src/pages/admin/EditProject.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { 
  FiSave, FiX, FiPlus, FiTrash2, FiUpload, FiRefreshCw, 
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
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  
  // ✅ محدودیت تعداد تصاویر گالری
  const MAX_GALLERY_IMAGES = 3
  
  // ============================================
  // State فرم
  // ============================================
  const [formData, setFormData] = useState({
    // فارسی
    title_fa: '',
    description_fa: '',
    full_description_fa: '',
    // انگلیسی
    title_en: '',
    description_en: '',
    full_description_en: '',
    // مشترک
    slug: '',
    project_type: 'residential',
    client_name: '',
    year: '',
    area: '',
    status: 'draft',
    is_featured: false,
    features: { en: [], fa: [] },
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

        console.log(data)
        
        // استخراج صحیح داده‌های فارسی و انگلیسی از JSON
        setFormData({
          // فارسی
          title_fa: data.title?.fa || data.title_fa || '',
          description_fa: data.description?.fa || data.description_fa || '',
          full_description_fa: data.full_description?.fa || data.full_description_fa || '',
          // انگلیسی
          title_en: data.title?.en || data.title_en || data.title || '',
          description_en: data.description?.en || data.description_en || data.description || '',
          full_description_en: data.full_description?.en || data.full_description_en || data.full_description || '',
          // مشترک
          slug: data.slug || '',
          project_type: data.project_type || 'residential',
          client_name: data.client_name || '',
          year: data.year || '',
          area: data.area || '',
          status: data.status || 'draft',
          is_featured: data.is_featured || false,
          features: {
            en: data.features?.en || data.features || [],
            fa: data.features?.fa || [],
          },
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
  // تابع تولید اسلاگ
  // ============================================
  const generateSlug = (title) => {
    if (!title) return ''
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  useEffect(() => {
    if (!slugManuallyEdited && formData.title_en) {
      const newSlug = generateSlug(formData.title_en)
      setFormData(prev => ({ ...prev, slug: newSlug }))
    }
  }, [formData.title_en, slugManuallyEdited])

  // ============================================
  // مدیریت فیلدها
  // ============================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name === 'slug') {
      setSlugManuallyEdited(true)
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const resetSlug = () => {
    const newSlug = generateSlug(formData.title_en)
    setFormData(prev => ({ ...prev, slug: newSlug }))
    setSlugManuallyEdited(false)
  }

  // ============================================
  // مدیریت ویژگی‌ها
  // ============================================
  const handleFeatureChange = (lang, index, value) => {
    setFormData(prev => {
      const newFeatures = { ...prev.features }
      newFeatures[lang][index] = value
      return { ...prev, features: newFeatures }
    })
  }

  const addFeature = (lang) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [lang]: [...prev.features[lang], '']
      }
    }))
  }

  const removeFeature = (lang, index) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [lang]: prev.features[lang].filter((_, i) => i !== index)
      }
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

    // ✅ بررسی محدودیت تعداد
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
  // ارسال فرم (ویرایش)
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const finalSlug = formData.slug || generateSlug(formData.title_en)

        if (!formData.title_en.trim()) {
        throw new Error('عنوان انگلیسی الزامی است')
        }
        if (!formData.title_fa.trim()) {
        throw new Error('عنوان فارسی الزامی است')
        }

      const projectData = {
        title: {
          en: formData.title_en,
          fa: formData.title_fa
        },
        slug: finalSlug,
        description: {
          en: formData.description_en,
          fa: formData.description_fa
        },
        full_description: {
          en: formData.full_description_en,
          fa: formData.full_description_fa
        },
        features: {
          en: formData.features.en.filter(f => f.trim()),
          fa: formData.features.fa.filter(f => f.trim())
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
          {t('admin.project.cover_image')}
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
                {t('admin.project.click_to_upload_cover')}
              </p>
              <label className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700 transition">
                {t('admin.project.choose_cover')}
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
          {t('admin.project.gallery_images')}
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
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
                {t('admin.project.click_to_upload_gallery')}
              </p>
              <label className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700 transition">
                {t('admin.project.choose_gallery')}
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
      className="container mx-auto px-4 py-8 max-w-7xl"
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
            {t('admin.project.edit_title')}
          </h1>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
        >
          <FiX className="w-5 h-5" />
          {t('admin.project.cancel')}
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
        {/* ===== دو ستون فارسی و انگلیسی ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* فارسی */}
          <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-300">
            <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-primary-600">🇮🇷</span>
              {t('admin.project.persian_section')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.project.title')} *
                </label>
                <input
                  type="text"
                  name="title_fa"
                  value={formData.title_fa}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
                  required
                  dir="rtl"
                  placeholder="عنوان پروژه به فارسی"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.project.description')}
                </label>
                <textarea
                  name="description_fa"
                  value={formData.description_fa}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
                  dir="rtl"
                  placeholder="توضیحات کوتاه به فارسی"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.project.full_description')}
                </label>
                <textarea
                  name="full_description_fa"
                  value={formData.full_description_fa}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
                  dir="rtl"
                  placeholder="توضیحات کامل به فارسی"
                />
              </div>
              {/* ویژگی‌های فارسی */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.project.features')}
                </label>
                <div className="space-y-2">
                  {formData.features.fa.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange('fa', index, e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
                        dir="rtl"
                        placeholder="یک ویژگی وارد کنید..."
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature('fa', index)}
                        className="p-2 text-red-500 hover:text-red-700 transition"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addFeature('fa')}
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition text-sm"
                  >
                    <FiPlus className="w-4 h-4" />
                    {t('admin.project.add_feature')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* انگلیسی */}
          <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-300">
            <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-primary-600">🇬🇧</span>
              {t('admin.project.english_section')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.project.title')} *
                </label>
                <input
                  type="text"
                  name="title_en"
                  value={formData.title_en}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
                  required
                  placeholder="Project title in English"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.project.description')}
                </label>
                <textarea
                  name="description_en"
                  value={formData.description_en}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
                  placeholder="Short description in English"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.project.full_description')}
                </label>
                <textarea
                  name="full_description_en"
                  value={formData.full_description_en}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
                  placeholder="Full description in English"
                />
              </div>
              {/* ویژگی‌های انگلیسی */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.project.features')}
                </label>
                <div className="space-y-2">
                  {formData.features.en.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange('en', index, e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
                        placeholder="Enter a feature..."
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature('en', index)}
                        className="p-2 text-red-500 hover:text-red-700 transition"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addFeature('en')}
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition text-sm"
                  >
                    <FiPlus className="w-4 h-4" />
                    {t('admin.project.add_feature')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== اطلاعات عمومی ===== */}
        <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-300">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4">
            {t('admin.project.general_info')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.project.slug')} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition pr-10"
                  placeholder="auto-generated"
                />
                <button
                  type="button"
                  onClick={resetSlug}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-primary-600 transition"
                >
                  <FiRefreshCw className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {t('admin.project.slug_hint')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.project.type')}
              </label>
              <select
                name="project_type"
                value={formData.project_type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
              >
                <option value="residential">{t('projects.filter_residential')}</option>
                <option value="commercial">{t('projects.filter_commercial')}</option>
                <option value="office">{t('projects.filter_office')}</option>
                <option value="villa">{t('projects.filter_villa')}</option>
                <option value="cultural">{t('projects.filter_cultural')}</option>
                <option value="educational">{t('projects.filter_educational')}</option>
                <option value="other">{t('projects.filter_other')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.project.client')}
              </label>
              <input
                type="text"
                name="client_name"
                value={formData.client_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.project.year')}
              </label>
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
                placeholder="1404"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.project.area')}
              </label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
                placeholder="1200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.project.status')}
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
              >
                <option value="draft">{t('admin.project.draft')}</option>
                <option value="published">{t('admin.project.published')}</option>
                <option value="archived">{t('admin.project.archived')}</option>
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
                {t('admin.project.featured')}
              </span>
            </label>
          </div>
        </div>

        {/* ===== تصاویر ===== */}
        <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-300">
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4">
            {t('admin.project.images')}
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
            {t('admin.project.cancel')}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {saving ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                {t('admin.project.saving')}
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5" />
                {t('admin.project.update')}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export default EditProject