// frontend/src/components/home/Hero.jsx
import { motion } from 'framer-motion'
import { FiArrowDown } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const Hero = () => {
  const { t } = useTranslation()  // ✅ اضافه کنید
  const navigate = useNavigate()

  const scrollToProjects = () => {
    const projectsSection = document.getElementById('projects')
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById('projects')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  }

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 1.2, delay: 0.5 },
    },
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/hero-bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />

      {/* Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 text-white">
        {/* Badge */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="inline-block mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white/90 border border-white/20"
        >
          {t('hero.badge')}  {/* ✅ تغییر */}
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="space-y-4"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight">
            <span className="text-primary-400">dorsa</span>
            <span className="text-white">design</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 font-light max-w-2xl mx-auto">
            {t('hero.subtitle')}  {/* ✅ تغییر */}
          </p>
        </motion.div>

        {/* Description */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mt-6 text-base sm:text-lg text-white/60 max-w-xl mx-auto leading-relaxed"
        >
          {t('hero.description')}  {/* ✅ تغییر */}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={scrollToProjects}
            className="inline-flex items-center justify-center px-8 py-4 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            {t('hero.cta_projects')}  {/* ✅ تغییر */}
            <FiArrowDown className="ml-2 w-4 h-4 animate-bounce" />
          </button>

          <a
            href="/about"
            className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-medium border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-0.5"
          >
            {t('hero.cta_about')}  {/* ✅ تغییر */}
          </a>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-8 right-8 z-10 cursor-pointer hidden md:block"
            onClick={scrollToProjects}
          >
            <div className="flex flex-col items-center gap-2 text-white/50 text-sm">
              <span className="tracking-widest text-xs uppercase">
                {t('hero.scroll')}
              </span>
              <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center">
                <div className="w-1 h-2 bg-white rounded-full animate-scroll-down mt-2" />
              </div>
            </div>
          </motion.div>
      </div>
    </section>
  )
}

export default Hero