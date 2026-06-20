// frontend/src/pages/ProjectDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiEye, FiCalendar, FiUser, FiMaximize } from 'react-icons/fi'
import { getProjectBySlug } from '../services/api'

const ProjectDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getProjectBySlug(slug)
        setProject(data)
      } catch (err) {
        setError(err.response?.status === 404 ? 'پروژه یافت نشد' : 'خطا در دریافت پروژه')
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-xl text-red-500 mb-4">{error || 'پروژه یافت نشد'}</p>
        <Link to="/" className="text-primary-600 hover:underline">
          بازگشت به صفحه اصلی
        </Link>
      </div>
    )
  }

  const typeLabels = {
    residential: 'مسکونی',
    commercial: 'تجاری',
    office: 'اداری',
    villa: 'ویلایی',
    cultural: 'فرهنگی',
    educational: 'آموزشی',
    other: 'سایر',
  }

  const galleryImages = project.gallery_images 
    ? project.gallery_images.split(',').filter(img => img.trim())
    : []

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-6"
      >
        <FiArrowLeft className="w-5 h-5" />
        بازگشت
      </button>

      {/* Project Header */}
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
              {project.area} متر مربع
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
            {project.views || 0} بازدید
          </span>
        </div>
      </div>

      {/* Cover Image */}
      {project.cover_image && (
        <div className="rounded-xl overflow-hidden mb-8 shadow-lg">
          <img
            src={project.cover_image}
            alt={project.title}
            className="w-full max-h-[500px] object-cover"
          />
        </div>
      )}

      {/* Description */}
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

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-display font-semibold text-gray-900 dark:text-white mb-4">
            گالری تصاویر
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg overflow-hidden aspect-square bg-gray-100 dark:bg-dark-300"
              >
                <img
                  src={img.trim()}
                  alt={`${project.title} - ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default ProjectDetail