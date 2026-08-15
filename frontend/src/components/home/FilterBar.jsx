// frontend/src/components/home/FilterBar.jsx
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'  // ✅ اضافه کنید
import { useProjectTypes } from '../../hooks/useProjects'

const FilterBar = ({ activeFilter, onFilterChange }) => {
  const { t } = useTranslation()
  const { types, loading } = useProjectTypes()

  // اگر types از API نمی‌آید، این را به عنوان fallback استفاده کنید
  const fallbackTypes = [
      { value: 'all', labelKey: 'projects.filter_all' },
      { value: 'residential', labelKey: 'projects.filter_residential' },
      { value: 'commercial', labelKey: 'projects.filter_commercial' },
      { value: 'office', labelKey: 'projects.filter_office' },
      { value: 'villa', labelKey: 'projects.filter_villa' },
      { value: 'cultural', labelKey: 'projects.filter_cultural' },
      { value: 'educational', labelKey: 'projects.filter_educational' },
      { value: 'other', labelKey: 'projects.filter_other' },
    ]

  const displayTypes = types.length > 0 ? types : fallbackTypes

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-8">
      {displayTypes.map((type) => (
        <motion.button
          key={type.value}
          onClick={() => onFilterChange(type.value === 'all' ? null : type.value)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            (activeFilter === type.value || (activeFilter === null && type.value === 'all'))
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-400'
          }`}
        >
          {t(type.labelKey)}
        </motion.button>
      ))}
    </div>
  )
}

export default FilterBar