// frontend/src/contexts/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState('fa')

  useEffect(() => {
    // ذخیره زبان در localStorage
    localStorage.setItem('i18nextLng', currentLanguage)
  }, [currentLanguage])

  const changeLanguage = () => {
    // فقط فارسی
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}