import { FiGithub, FiInstagram, FiLinkedin, FiMail } from 'react-icons/fi'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 dark:bg-dark-200 border-t border-gray-200 dark:border-dark-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Brand */}
          <div className="mb-4 md:mb-0">
            <span className="text-xl font-display font-bold text-primary-700 dark:text-primary-400">
              dorsa
            </span>
            <span className="text-xl font-display font-light text-gray-600 dark:text-gray-400">
              design
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Architecture & Design Portfolio
            </p>
          </div>

          {/* Social Links */}
          <div className="flex space-x-6">
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" aria-label="Instagram">
              <FiInstagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" aria-label="GitHub">
              <FiGithub className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" aria-label="LinkedIn">
              <FiLinkedin className="w-5 h-5" />
            </a>
            <a href="mailto:info@dorsadesign.ir" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" aria-label="Email">
              <FiMail className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-dark-300 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {currentYear} dorsadesign. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer