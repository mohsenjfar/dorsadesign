// frontend/src/components/home/ProjectGrid.jsx
import ProjectCard from './ProjectCard'
import { FiLoader } from 'react-icons/fi'

const ProjectGrid = ({ projects, loading, error, title = 'پروژه‌ها' }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <FiLoader className="w-8 h-8 text-primary-600 animate-spin" />
        <span className="mr-3 text-gray-600 dark:text-gray-400">در حال بارگذاری...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">خطا در بارگذاری پروژه‌ها</p>
        <p className="text-sm text-gray-500 mt-2">{error}</p>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">هیچ پروژه‌ای یافت نشد</p>
      </div>
    )
  }

  return (
    <div>
      {title && (
        <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white mb-8">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>
    </div>
  )
}

export default ProjectGrid