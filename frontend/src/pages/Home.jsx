// frontend/src/pages/Home.jsx
import { useState } from 'react'
import Hero from '../components/home/Hero'
import ProjectGrid from '../components/home/ProjectGrid'
import FilterBar from '../components/home/FilterBar'
import { useProjects } from '../hooks/useProjects'

const Home = () => {
  const [selectedType, setSelectedType] = useState(null)
  const { projects, loading, error, filters, changeFilter } = useProjects({
    project_type: null,
  })

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
            پروژه‌های معماری
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            انتخاب کنید تا پروژه‌های مورد نظر را ببینید
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