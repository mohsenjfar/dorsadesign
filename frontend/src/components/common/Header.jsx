// frontend/src/components/common/Header.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiMenu, FiX, FiSun, FiMoon, FiUser } from 'react-icons/fi'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const { darkMode, toggleDarkMode } = useTheme()
  const { t } = useTranslation()
  const { currentLanguage, changeLanguage } = useLanguage()
  const navigate = useNavigate()

  // ============================================
  // توابع
  // ============================================
  const goToHome = (e) => {
    e?.preventDefault?.()
    setIsMenuOpen(false)
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/')
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    }
  }

  const scrollToProjects = (e) => {
    e?.preventDefault?.()
    setIsMenuOpen(false)
    if (window.location.pathname === '/') {
      const projectsSection = document.getElementById('projects')
      if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate('/')
      setTimeout(() => {
        const projectsSection = document.getElementById('projects')
        if (projectsSection) {
          projectsSection.scrollIntoView({ behavior: 'smooth' })
        }
      }, 150)
    }
  }

  const closeMenu = () => setIsMenuOpen(false)

  // ✅ رفتن به صفحه لاگین ادمین
  const goToAdminLogin = () => {
    navigate('/admin/login')
    setIsMenuOpen(false)
  }

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fa', label: 'فارسی', flag: '🇮🇷' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-100/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" onClick={goToHome} className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-2xl font-display font-bold text-primary-700 dark:text-primary-400">dorsa</span>
            <span className="text-2xl font-display font-light text-gray-600 dark:text-gray-400">design</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            <button onClick={goToHome} className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer bg-transparent border-none">
              {t('nav.home')}
            </button>
            <button onClick={scrollToProjects} className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer bg-transparent border-none">
              {t('nav.projects')}
            </button>
            <Link to="/about" onClick={closeMenu} className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {t('nav.about')}
            </Link>
            <Link to="/contact" onClick={closeMenu} className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {t('nav.contact')}
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <FiSun className="w-5 h-5 text-yellow-400" />
              ) : (
                <FiMoon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* ✅ Admin Login Button */}
            <button
              onClick={goToAdminLogin}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              aria-label="Admin Login"
              title={t('nav.admin_login')}
            >
              <FiUser className="w-5 h-5" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200 dark:border-dark-300">
            <div className="flex flex-col space-y-4">
              <button onClick={goToHome} className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer bg-transparent border-none text-left">
                {t('nav.home')}
              </button>
              <button onClick={scrollToProjects} className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer bg-transparent border-none text-left">
                {t('nav.projects')}
              </button>
              <Link to="/about" onClick={closeMenu} className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {t('nav.about')}
              </Link>
              <Link to="/contact" onClick={closeMenu} className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {t('nav.contact')}
              </Link>
              <hr className="border-gray-200 dark:border-dark-300" />
              <button onClick={goToAdminLogin} className="text-base font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors cursor-pointer bg-transparent border-none text-left">
                {t('nav.admin_login')}
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header