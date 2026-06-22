// frontend/src/components/home/ProjectGrid.jsx
import { useTranslation } from 'react-i18next'  // ✅ اضافه کنید
import ProjectCard from './ProjectCard'
import { FiLoader } from 'react-icons/fi'

const ProjectGrid = ({ projects, loading, error }) => {
  const { t } = useTranslation()  // ✅ اضافه کنید

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <FiLoader className="w-8 h-8 text-primary-600 animate-spin" />
        <span className="mr-3 text-gray-600 dark:text-gray-400">
          {t('projects.loading')}
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{t('projects.error')}</p>
        <p className="text-sm text-gray-500 mt-2">{error}</p>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">
          {t('projects.no_projects')}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {projects.map((project, index) => (
        <ProjectCard key={project.id} project={project} index={index} />
      ))}
    </div>
  )
}

export default ProjectGrid