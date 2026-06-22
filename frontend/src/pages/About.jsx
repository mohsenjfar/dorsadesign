// frontend/src/pages/About.jsx
import { motion } from 'framer-motion'
import { FiAward, FiUsers, FiBriefcase, FiHeart } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

const About = () => {
  const { t } = useTranslation()

  const stats = [
    { icon: FiBriefcase, label: t('about.stats.projects'), value: '۵۰+' },
    { icon: FiUsers, label: t('about.stats.clients'), value: '۳۰+' },
    { icon: FiAward, label: t('about.stats.awards'), value: '۱۲' },
    { icon: FiHeart, label: t('about.stats.experience'), value: '۸' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-16"
    >
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white">
          {t('about.title')}
        </h1>
        <div className="w-20 h-1 bg-primary-600 mx-auto mt-4 rounded-full" />
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-display font-semibold text-gray-900 dark:text-white mb-4">
            {t('about.story.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            {t('about.story.paragraph1')}
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {t('about.story.paragraph2')}
          </p>
        </motion.div>

        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-primary-50 dark:bg-dark-200 rounded-2xl p-8"
        >
          <h3 className="text-xl font-display font-semibold text-gray-900 dark:text-white mb-4">
            {t('about.vision.title')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {t('about.vision.text')}
          </p>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white dark:bg-dark-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <Icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default About