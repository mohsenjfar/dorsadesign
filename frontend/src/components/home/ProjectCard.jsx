// frontend/src/components/home/ProjectCard.jsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiEye, FiTag, FiCalendar, FiMaximize2 } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

const ProjectCard = ({ project, index }) => {
  const { t } = useTranslation()
  
  // ============================================
  // Destructure with fallbacks
  // ============================================
  const {
    id,
    title = '',
    slug = '',
    description = '',
    cover_image = null,
    project_type = null,
    views = 0,
    features = [],
    year = null,
    area = null,
    created_at = null,
  } = project || {}

  // ============================================
  // ✅ Safe feature extraction
  // ============================================
  const getFeatures = () => {
    // اگر features آرایه باشد
    if (Array.isArray(features)) {
      return features
    }
    // اگر features آبجکت باشد (چندزبانه)
    if (features && typeof features === 'object') {
      // اولویت: زبان فعلی، سپس انگلیسی، سپس اولین مقدار
      const lang = localStorage.getItem('i18nextLng') || 'en'
      return features[lang] || features.en || Object.values(features)[0] || []
    }
    return []
  }

  const featureList = getFeatures()

  // ============================================
  // Project type labels
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
  // Format date
  // ============================================
  const formatDate = (date) => {
    if (!date) return null
    try {
      const d = new Date(date)
      return new Intl.DateTimeFormat(
        localStorage.getItem('i18nextLng') === 'fa' ? 'fa-IR' : 'en-US',
        { year: 'numeric', month: 'short', day: 'numeric' }
      ).format(d)
    } catch {
      return null
    }
  }

  const formattedDate = formatDate(created_at)

  // ============================================
  // Fallback image
  // ============================================
  const getImageUrl = (url) => {
    if (!url) return null
    // اگر URL با /uploads شروع می‌شود، به backend اشاره می‌کند
    if (url.startsWith('/uploads')) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      return `${apiUrl}${url}`
    }
    return url
  }

  const imageUrl = getImageUrl(cover_image)

  // ============================================
  // Render
  // ============================================
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: (index || 0) * 0.08 }}
      whileHover={{ y: -8 }}
      className="group bg-white dark:bg-dark-200 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 h-full flex flex-col"
    >
      <Link to={`/projects/${slug}`} className="block h-full flex flex-col">
        {/* ==========================================
            Image Section
            ========================================== */}
        <div className="relative overflow-hidden aspect-[4/3] bg-gray-200 dark:bg-dark-300 flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title || 'Project image'}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = '' // یا یک placeholder
                e.target.parentElement.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                `
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* ===== Type Badge ===== */}
          {project_type && (
            <span className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded-full shadow-lg border border-white/10">
              {typeLabels[project_type] || project_type}
            </span>
          )}

          {/* ===== Featured Badge ===== */}
          {project.is_featured && (
            <span className="absolute top-3 left-3 px-3 py-1.5 bg-amber-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-full shadow-lg">
              ⭐ {t('projects.featured') || 'Featured'}
            </span>
          )}
        </div>

        {/* ==========================================
            Content Section
            ========================================== */}
        <div className="p-5 flex-grow flex flex-col">
          {/* Title */}
          <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
            {title}
          </h3>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
            {year && (
              <span className="flex items-center gap-1">
                <FiCalendar className="w-3 h-3" />
                {year}
              </span>
            )}
            {area && (
              <span className="flex items-center gap-1">
                <FiMaximize2 className="w-3 h-3" />
                {area} {t('projects.square_meters') || 'm²'}
              </span>
            )}
            {formattedDate && (
              <span className="text-gray-400 dark:text-gray-500">
                {formattedDate}
              </span>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 flex-grow leading-relaxed">
              {description}
            </p>
          )}

          {/* ===== Features ===== */}
          {featureList.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {featureList.slice(0, 2).map((feature, idx) => (
                <span
                  key={`${id}-feature-${idx}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs rounded-full border border-primary-100 dark:border-primary-800/30"
                >
                  <FiTag className="w-3 h-3" />
                  {feature}
                </span>
              ))}
              {featureList.length > 2 && (
                <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 dark:bg-dark-300 text-gray-500 dark:text-gray-400 text-xs rounded-full">
                  +{featureList.length - 2}
                </span>
              )}
            </div>
          )}

          {/* ===== Footer ===== */}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <FiEye className="w-4 h-4" />
              <span className="font-medium">{views || 0}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {t('projects.views') || 'views'}
              </span>
            </span>
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform duration-300 flex items-center gap-1">
              {t('projects.view_details') || 'View Details'}
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default ProjectCard