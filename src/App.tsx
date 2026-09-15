import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import { PublicLayout } from './layouts/PublicLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { AdminDashboard } from './pages/AdminDashboard'
import { ProfileManager } from './pages/ProfileManager'
import { PortfolioManager } from './pages/PortfolioManager'
import { ContactManager } from './pages/ContactManager'
import { SettingsManager } from './pages/SettingsManager'
import { CategoriesManager } from './pages/CategoriesManager'
import { ExperienceManager } from './pages/ExperienceManager'
import { SocialsManager } from './pages/SocialsManager'

export function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Portfolio Route */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
          </Route>

          {/* Hidden Admin Authentication Route */}
          <Route path="/secret-login" element={<Login />} />

          {/* Protected Admin CMS Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="profile" element={<ProfileManager />} />
            <Route path="experience" element={<ExperienceManager />} />
            <Route path="categories" element={<CategoriesManager />} />
            <Route path="portfolio" element={<PortfolioManager />} />
            <Route path="portfolio/categories" element={<CategoriesManager />} />
            <Route path="portfolio/projects" element={<PortfolioManager />} />
            <Route path="socials" element={<SocialsManager />} />
            <Route path="contact" element={<ContactManager />} />
            <Route path="settings" element={<SettingsManager />} />
          </Route>

          {/* Catch-all redirect to public portfolio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
