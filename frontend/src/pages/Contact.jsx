// frontend/src/pages/Contact.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi'
import { useForm } from 'react-hook-form'

const Contact = () => {
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
      // در اینجا API ارسال فرم را وصل کنید
      console.log('Form data:', data)
      await new Promise((resolve) => setTimeout(resolve, 1500)) // شبیه‌سازی
      setIsSuccess(true)
      reset()
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (err) {
      setError('خطا در ارسال پیام. لطفاً دوباره تلاش کنید.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    { icon: FiMail, label: 'ایمیل', value: 'info@dorsadesign.ir', href: 'mailto:info@dorsadesign.ir' },
    { icon: FiPhone, label: 'تلفن', value: '+۹۸ ۲۱ ۱۲۳۴ ۵۶۷۸', href: 'tel:+982112345678' },
    { icon: FiMapPin, label: 'آدرس', value: 'تهران، خیابان ولیعصر، نبش خیابان...' },
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
          تماس با ما
        </h1>
        <div className="w-20 h-1 bg-primary-600 mx-auto mt-4 rounded-full" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          برای مشاوره و همکاری با ما در ارتباط باشید
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
            ارسال پیام
          </h2>

          {isSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-3 rounded-lg mb-4">
              پیام شما با موفقیت ارسال شد!
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
                نام و نام خانوادگی *
              </label>
              <input
                type="text"
                {...register('name', { required: 'نام الزامی است' })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-dark-400'
                } bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-600 focus:border-transparent transition`}
                placeholder="نام خود را وارد کنید"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ایمیل *
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'ایمیل الزامی است',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'ایمیل معتبر نیست',
                  },
                })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-dark-400'
                } bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-600 focus:border-transparent transition`}
                placeholder="ایمیل خود را وارد کنید"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                موضوع
              </label>
              <input
                type="text"
                {...register('subject')}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-600 focus:border-transparent transition"
                placeholder="موضوع پیام"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                پیام *
              </label>
              <textarea
                {...register('message', { required: 'پیام الزامی است' })}
                rows="5"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.message ? 'border-red-500' : 'border-gray-300 dark:border-dark-400'
                } bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-600 focus:border-transparent transition resize-none`}
                placeholder="پیام خود را بنویسید..."
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
                  در حال ارسال...
                </>
              ) : (
                <>
                  <FiSend className="w-4 h-4" />
                  ارسال پیام
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
              اطلاعات تماس
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

          {/* Map placeholder */}
          <div className="bg-gray-100 dark:bg-dark-300 rounded-2xl overflow-hidden h-48 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">📍 نقشه</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Contact