// frontend/src/pages/ProjectDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FiArrowLeft, 
  FiEye, 
  FiCalendar, 
  FiUser, 
  FiMaximize,
  FiMapPin,
  FiTag,
  FiChevronLeft,
  FiChevronRight,
  FiImage,
  FiX
} from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { getProjectBySlug } from '../services/api'

const ProjectDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // ✅ State برای اسلایدشو
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  // ============================================
  // دریافت داده‌ها
  // ============================================
  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getProjectBySlug(slug)
        setProject(data)
        setCurrentImageIndex(0)
      } catch (err) {
        setError(err.response?.status === 404 ? 'project_not_found' : 'error_loading')
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [slug, i18n.language])

  // ============================================
  // توابع اسلایدشو
  // ============================================
  const getGalleryImages = () => {
    if (!project?.gallery_images) return []
    return project.gallery_images.split(',').filter(img => img.trim())
  }

  const galleryImages = getGalleryImages()
  const allImages = project?.cover_image 
    ? [project.cover_image, ...galleryImages]
    : galleryImages

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  const openLightbox = (index) => {
    setCurrentImageIndex(index)
    setIsLightboxOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
    document.body.style.overflow = 'unset'
  }

  // ============================================
  // انواع پروژه
  // ============================================
  const typeLabels = {
    residential: t('projects.filter_residential'),
    commercial: t('projects.filter_commercial'),
    office: t('projects.filter_office'),
    villa: t('projects.filter_villa'),
    cultural: t('projects.filter_cultural'),
    educational: t('projects.filter_educational'),
    other: t('projects.filter_other'),
  }

  // ============================================
  // Loading
  // ============================================
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ============================================
  // Error
  // ============================================
  if (error || !project) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-xl text-red-500 mb-4">
          {error === 'project_not_found' ? t('project.not_found') : t('project.error_loading')}
        </p>
        <Link to="/" className="text-primary-600 hover:underline">
          {t('project.back_to_home')}
        </Link>
      </div>
    )
  }

  // ============================================
  // Render
  // ============================================
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      {/* ===== دکمه بازگشت ===== */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-6"
      >
        <FiArrowLeft className="w-5 h-5" />
        {t('project.back')}
      </button>

      {/* ===== اسلایدشو ===== */}
      {allImages.length > 0 && (
        <div className="relative rounded-xl overflow-hidden mb-8 bg-gray-100 dark:bg-dark-300 aspect-video">
          <img
            src={allImages[currentImageIndex]}
            alt={project.title}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => openLightbox(currentImageIndex)}
          />
          
          {/* دکمه‌های قبلی/بعدی */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <FiChevronRight className="w-6 h-6" />
              </button>
              
              {/* نشانگر تعداد تصاویر */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex 
                        ? 'w-6 bg-white' 
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== هدر پروژه ===== */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white">
          {project.title}
        </h1>
        
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
          {project.project_type && (
            <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
              {typeLabels[project.project_type] || project.project_type}
            </span>
          )}
          {project.year && (
            <span className="flex items-center gap-1">
              <FiCalendar className="w-4 h-4" />
              {project.year}
            </span>
          )}
          {project.area && (
            <span className="flex items-center gap-1">
              <FiMaximize className="w-4 h-4" />
              {project.area} {t('project.square_meters')}
            </span>
          )}
          {project.client_name && (
            <span className="flex items-center gap-1">
              <FiUser className="w-4 h-4" />
              {project.client_name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <FiEye className="w-4 h-4" />
            {project.views || 0} {t('project.views')}
          </span>
        </div>
      </div>

      {/* ===== توضیحات ===== */}
      <div className="prose dark:prose-invert max-w-none mb-8">
        {project.description && (
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            {project.description}
          </p>
        )}
        {project.full_description && (
          <div className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
            {project.full_description}
          </div>
        )}
      </div>

      {/* ===== Features ===== */}
      {project.features && project.features.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-display font-semibold text-gray-900 dark:text-white mb-4">
            {t('project.features')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {project.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-dark-300 rounded-lg"
              >
                <FiTag className="w-4 h-4 text-primary-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== گالری تصاویر ===== */}
      {galleryImages.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-display font-semibold text-gray-900 dark:text-white mb-4">
            {t('project.gallery')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative rounded-lg overflow-hidden aspect-square bg-gray-100 dark:bg-dark-300 cursor-pointer group"
                onClick={() => openLightbox(index + 1)}
              >
                <img
                  src={img.trim()}
                  alt={`${project.title} - ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <FiImage className="w-8 h-8 text-white/0 group-hover:text-white/80 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ===== Lightbox ===== */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
          >
            <FiX className="w-8 h-8" />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          
          <img
            src={allImages[currentImageIndex]}
            alt={project.title}
            className="max-w-[95vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {allImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? 'w-8 bg-white' 
                    : 'bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default ProjectDetail