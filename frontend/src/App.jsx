// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import Layout from './components/common/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import ProjectDetail from './pages/ProjectDetail'

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/projects/:slug" element={<ProjectDetail />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App