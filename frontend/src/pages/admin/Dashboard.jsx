// frontend/src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { 
  FiPlus, 
  FiLogOut, 
  FiEdit, 
  FiTrash2, 
  FiEye,
  FiEyeOff,
  FiArchive,
  FiCheckCircle,
  FiUser
} from 'react-icons/fi'
import api from '../../services/api'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const { t, i18n } = useTranslation()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ============================================
  // دریافت لیست پروژه‌ها
  // ============================================
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      setError(null)
      try {
        const language = i18n.language || 'en'
        const response = await api.get('/api/projects/', {
          params: { 
            language,
            limit: 100  // دریافت همه پروژه‌ها
          }
        })
        setProjects(response.data.items || [])
      } catch (err) {
        setError('خطا در دریافت پروژه‌ها')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [i18n.language])

  // ============================================
  // حذف پروژه
  // ============================================
  const handleDelete = async (id, title) => {
    if (!window.confirm(`آیا از حذف پروژه "${title}" مطمئن هستید؟`)) return

    try {
      await api.delete(`/api/admin/projects/${id}`)
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      alert('خطا در حذف پروژه')
      console.error(err)
    }
  }

  // ============================================
  // وضعیت‌های پروژه
  // ============================================
  const getStatusBadge = (status) => {
    const statusMap = {
      draft: { label: t('admin.project.draft'), className: 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200' },
      published: { label: t('admin.project.published'), className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
      archived: { label: t('admin.project.archived'), className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
    }
    return statusMap[status] || statusMap.draft
  }

  // ============================================
  // Render
  // ============================================
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
            {t('admin.dashboard.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('admin.dashboard.welcome')} {user?.full_name || user?.username}!
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link
            to="/admin/projects/create"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <FiPlus className="w-5 h-5" />
            {t('admin.dashboard.add_project')}
          </Link>
          
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300"
          >
            <FiLogOut className="w-5 h-5" />
            {t('admin.dashboard.logout')}
          </button>
          
          <Link
            to="/admin/profile"
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300"
          >
            <FiUser className="w-5 h-5" />
            {t('admin.dashboard.profile')}
          </Link>

        </div>
      </div>

      {/* لیست پروژه‌ها */}
      <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-200 dark:border-dark-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-300">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.project.title')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.project.type')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.project.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.project.views')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.project.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-300">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {t('projects.no_projects')}
                  </td>
                </tr>
              ) : (
                projects.map((project, index) => {
                  const status = getStatusBadge(project.status)
                  const StatusIcon = project.status === 'published' ? FiCheckCircle : 
                                   project.status === 'archived' ? FiArchive : FiEyeOff

                  return (
                    <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-dark-300/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {project.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            slug: {project.slug}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {project.project_type ? t(`projects.filter_${project.project_type}`) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${status.className}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {project.views || 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/projects/${project.slug}`}
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-primary-600 transition"
                            title="مشاهده در سایت"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>

                          <Link
                            to={`/admin/projects/edit/${project.id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 transition"
                            title="ویرایش"
                          >
                            <FiEdit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(project.id, project.title)}
                            className="p-2 text-gray-400 hover:text-red-600 transition"
                            title="حذف"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* تعداد کل پروژه‌ها */}
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        {t('admin.dashboard.total_projects')}: {projects.length}
      </div>
    </div>
  )
}

export default Dashboard