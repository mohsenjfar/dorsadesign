// frontend/src/components/admin/ImageUpload.jsx
import { useState, useRef } from 'react'
import { FiUpload, FiX, FiImage } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

const ImageUpload = ({ onUpload, existingImage = null, label = 'Cover Image' }) => {
  const { t } = useTranslation()
  const [image, setImage] = useState(existingImage)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      // آپلود تصویر (بعداً به API متصل می‌شود)
      // const formData = new FormData()
      // formData.append('file', file)
      // const response = await api.post('/api/admin/projects/upload/cover', formData)
      
      // موقتاً از URL محلی استفاده می‌کنیم
      const url = URL.createObjectURL(file)
      setImage(url)
      onUpload(url, file)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeImage = () => {
    setImage(null)
    onUpload(null, null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer
          ${image ? 'border-primary-400 bg-primary-50/30 dark:bg-primary-900/10' : 'border-gray-300 dark:border-dark-400 hover:border-primary-400 dark:hover:border-primary-500'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : image ? (
          <div className="relative group">
            <img
              src={image}
              alt="Upload preview"
              className="w-full max-h-48 object-cover rounded-lg"
            />
            <button
              onClick={(e) => { e.stopPropagation(); removeImage(); }}
              className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FiX className="w-4 h-4" />
            </button>
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all rounded-lg">
              <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {t('admin.project.change_image')}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
            <FiImage className="w-12 h-12 mb-2" />
            <p className="text-sm">{t('admin.project.click_to_upload')}</p>
            <p className="text-xs mt-1">{t('admin.project.supported_formats')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageUpload