// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'  // ✅ اضافه کنید
import Hero from '../components/home/Hero'
import ProjectGrid from '../components/home/ProjectGrid'
import FilterBar from '../components/home/FilterBar'
import { useProjects } from '../hooks/useProjects'

const Home = () => {
  const { t } = useTranslation()  // ✅ اضافه کنید
  const location = useLocation()
  const [selectedType, setSelectedType] = useState(null)
  const { projects, loading, error, filters, changeFilter } = useProjects({
    project_type: null,
  })

  console.log('🏠 Home page projects:', projects) 
  
  useEffect(() => {
    if (location.hash === '#projects') {
      const el = document.getElementById('projects')
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' })
        }, 300)
      }
    }
  }, [location])

  const handleFilterChange = (type) => {
    setSelectedType(type)
    changeFilter('project_type', type)
  }

  return (
    <div>
      <Hero />
      
      <section id="projects" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white">
            {t('projects.title')}  {/* ✅ تغییر */}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('projects.subtitle')}  {/* ✅ تغییر */}
          </p>
        </div>
        
        <FilterBar 
          activeFilter={selectedType} 
          onFilterChange={handleFilterChange} 
        />
        
        <ProjectGrid 
          projects={projects} 
          loading={loading} 
          error={error} 
        />
      </section>
    </div>
  )
}

export default Home