// frontend/src/pages/About.jsx
import { motion } from 'framer-motion'
import { FiAward, FiUsers, FiBriefcase, FiHeart } from 'react-icons/fi'

const About = () => {
  const stats = [
    { icon: FiBriefcase, label: 'پروژه‌های انجام شده', value: '۵۰+' },
    { icon: FiUsers, label: 'مشتریان راضی', value: '۳۰+' },
    { icon: FiAward, label: 'جوایز طراحی', value: '۱۲' },
    { icon: FiHeart, label: 'سال‌های تجربه', value: '۸' },
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
          درباره ما
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
            داستان dorsadesign
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            dorsadesign یک استودیوی طراحی معماری است که به خلق فضاهای الهام‌بخش و کاربردی 
            با رویکردی مدرن و خلاقانه می‌پردازد. ما با تیمی از معماران و طراحان حرفه‌ای، 
            پروژه‌هایی را طراحی می‌کنیم که نه تنها زیبا، بلکه پایدار و هماهنگ با محیط زیست هستند.
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            فلسفه ما این است که هر پروژه داستانی منحصربه‌فرد دارد و ما با گوش دادن به نیازهای 
            مشتریان، این داستان را به زبان معماری ترجمه می‌کنیم.
          </p>
        </motion.div>

        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-primary-50 dark:bg-dark-200 rounded-2xl p-8"
        >
          <h3 className="text-xl font-display font-semibold text-gray-900 dark:text-white mb-4">
            چشم‌انداز ما
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            ایجاد فضاهایی که زندگی را متحول می‌کنند. ما به دنبال ترکیب هنر، علم و تکنولوژی 
            برای خلق معماری‌هایی هستیم که فراتر از زمان باشند و هویت مکانی را تعریف کنند.
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