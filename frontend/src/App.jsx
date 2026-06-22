// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/common/Layout'
import ProtectedRoute from './components/admin/ProtectedRoute'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import ProjectDetail from './pages/ProjectDetail'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import CreateProject from './pages/admin/CreateProject'

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
          <AuthProvider>
            <Routes>
              {/* ============================================
                  Public Routes (با هدر و فوتر)
                  ============================================ */}
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/about" element={<Layout><About /></Layout>} />
              <Route path="/contact" element={<Layout><Contact /></Layout>} />
              <Route path="/projects/:slug" element={<Layout><ProjectDetail /></Layout>} />
              
              {/* ============================================
                  Admin Routes
                  ============================================ */}
              
              {/* ✅ صفحه لاگین با هدر و فوتر */}
              <Route path="/admin/login" element={<Layout><AdminLogin /></Layout>} />
              
              {/* ✅ صفحات ادمین با هدر و فوتر */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/projects/create" element={
                <ProtectedRoute>
                  <Layout>
                    <CreateProject />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App