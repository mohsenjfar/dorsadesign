// frontend/src/pages/Contact.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

const Contact = () => {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setError(null)
    try {
      console.log('Form data:', data)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsSuccess(true)
      reset()
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (err) {
      setError(t('contact.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    { icon: FiMail, label: t('contact.info.email'), value: 'info@dorsadesign.ir', href: 'mailto:info@dorsadesign.ir' },
    { icon: FiPhone, label: t('contact.info.phone'), value: '+۹۸ ۲۱ ۱۲۳۴ ۵۶۷۸', href: 'tel:+982112345678' },
    { icon: FiMapPin, label: t('contact.info.address'), value: t('contact.info.address_text') },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-16"
    >
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white">
          {t('contact.title')}
        </h1>
        <div className="w-20 h-1 bg-primary-600 mx-auto mt-4 rounded-full" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          {t('contact.subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white dark:bg-dark-200 rounded-2xl p-6 md:p-8 shadow-sm"
        >
          <h2 className="text-xl font-display font-semibold text-gray-900 dark:text-white mb-6">
            {t('contact.form.title')}
          </h2>

          {isSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-3 rounded-lg mb-4">
              {t('contact.success')}
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('contact.form.name')} *
              </label>
              <input
                type="text"
                {...register('name', { required: t('contact.form.name_required') })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-dark-400'
                } bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-600`}
                placeholder={t('contact.form.name_placeholder')}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('contact.form.email')} *
              </label>
              <input
                type="email"
                {...register('email', {
                  required: t('contact.form.email_required'),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('contact.form.email_invalid'),
                  },
                })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-dark-400'
                } bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-600`}
                placeholder={t('contact.form.email_placeholder')}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('contact.form.subject')}
              </label>
              <input
                type="text"
                {...register('subject')}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-600"
                placeholder={t('contact.form.subject_placeholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('contact.form.message')} *
              </label>
              <textarea
                {...register('message', { required: t('contact.form.message_required') })}
                rows="5"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.message ? 'border-red-500' : 'border-gray-300 dark:border-dark-400'
                } bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-600 resize-none`}
                placeholder={t('contact.form.message_placeholder')}
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('contact.form.sending')}
                </>
              ) : (
                <>
                  <FiSend className="w-4 h-4" />
                  {t('contact.form.send')}
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-primary-50 dark:bg-dark-200 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-display font-semibold text-gray-900 dark:text-white mb-6">
              {t('contact.info.title')}
            </h2>
            <div className="space-y-4">
              {contactInfo.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                      <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-gray-900 dark:text-white">{item.value}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-dark-300 rounded-2xl overflow-hidden h-48 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">📍 {t('contact.map')}</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Contact