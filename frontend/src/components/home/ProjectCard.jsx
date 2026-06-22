// frontend/src/components/home/ProjectCard.jsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiEye, FiTag } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

const ProjectCard = ({ project, index }) => {
  const { t } = useTranslation()
  const { title, slug, description, cover_image, project_type, views, features } = project

  const typeLabels = {
    residential: t('projects.filter_residential'),
    commercial: t('projects.filter_commercial'),
    office: t('projects.filter_office'),
    villa: t('projects.filter_villa'),
    cultural: t('projects.filter_cultural'),
    educational: t('projects.filter_educational'),
    other: t('projects.filter_other'),
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group bg-white dark:bg-dark-200 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 h-full flex flex-col"
    >
      <Link to={`/projects/${slug}`} className="block h-full flex flex-col">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[4/3] bg-gray-200 dark:bg-dark-300 flex-shrink-0">
          {cover_image ? (
            <img
              src={cover_image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {/* Type badge */}
          {project_type && (
            <span className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full">
              {typeLabels[project_type] || project_type}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-grow flex flex-col">
          <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
            {title}
          </h3>
          
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-grow">
              {description}
            </p>
          )}

          {/* ✅ نمایش features در کارت */}
          {features && features.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {features.slice(0, 2).map((feature, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs rounded-full"
                >
                  <FiTag className="w-3 h-3" />
                  {feature}
                </span>
              ))}
              {features.length > 2 && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  +{features.length - 2}
                </span>
              )}
            </div>
          )}
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-dark-300 pt-3">
            <span className="flex items-center gap-1">
              <FiEye className="w-4 h-4" />
              {views ?? 0}
            </span>
            <span className="text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform">
              {t('projects.view_details')} →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default ProjectCard