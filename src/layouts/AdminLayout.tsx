import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom'
import {
  LayoutDashboard,
  UserCheck,
  Briefcase,
  Share2,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Database,
  Layers,
  FolderGit2,
  Mail
} from 'lucide-react'
import { AuthService } from '../services/auth'
import { isLiveApiConfigured } from '../services/api'
import { useToast } from '../components/Toast'

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [adminUser, setAdminUser] = useState(AuthService.getAdmin())

  // Guard: if not authenticated, immediately redirect without rendering dashboard
  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/secret-login?expired=true" replace />
  }

  // Track user activity and enforce 10-minute inactivity auto-logout
  useEffect(() => {
    setAdminUser(AuthService.getAdmin())

    let lastRecorded = Date.now()
    const handleUserActivity = () => {
      const now = Date.now()
      // Throttle localStorage updates to once every 2 seconds
      if (now - lastRecorded > 2000) {
        lastRecorded = now
        AuthService.recordActivity()
      }
    }

    const activityEvents: (keyof WindowEventMap)[] = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click'
    ]

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true })
    })

    // Active session watcher: checks every 5 seconds if 10 minutes have elapsed without activity
    const checkInterval = setInterval(() => {
      if (AuthService.isSessionTimedOut() || !AuthService.isAuthenticated()) {
        AuthService.logout()
        showToast(
          'Your session has expired due to 10 minutes of inactivity. Please login again. / Sesi Anda telah berakhir karena tidak ada aktivitas selama 10 menit.',
          'error'
        )
        navigate('/secret-login?expired=true', { replace: true })
      }
    }, 5000)

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity)
      })
      clearInterval(checkInterval)
    }
  }, [navigate, showToast])

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    AuthService.logout()
    showToast('Logged out successfully', 'info')
    navigate('/secret-login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
        {/* Sidebar Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6c4df6] to-[#ec4899] flex items-center justify-center text-white font-black text-sm shadow-sm">
              A
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-tight block leading-tight">Admin Dashboard</span>
              <span className="text-[10px] text-slate-400 font-medium">Control Center</span>
            </div>
          </div>
        </div>

        {/* Navigation items - Structured hierarchy */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Main: Dashboard */}
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-sky-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </NavLink>

          {/* Profile */}
          <NavLink
            to="/admin/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-sky-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>Profile</span>
          </NavLink>

          {/* Experience */}
          <NavLink
            to="/admin/experience"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-sky-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>Experience</span>
          </NavLink>

          {/* Portfolio Section */}
          <div className="pt-3 pb-1">
            <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Portfolio</span>
            </div>
            <div className="pl-3 space-y-1 mt-1 border-l-2 border-slate-800 ml-3">
              <NavLink
                to="/admin/portfolio/categories"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive || location.pathname === '/admin/categories'
                      ? 'bg-sky-500/20 text-sky-300 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>Categories</span>
              </NavLink>
              <NavLink
                to="/admin/portfolio/projects"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive || location.pathname === '/admin/portfolio'
                      ? 'bg-sky-500/20 text-sky-300 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Database className="w-3.5 h-3.5 shrink-0" />
                <span>Projects</span>
              </NavLink>
            </div>
          </div>

          {/* Contact Section */}
          <div className="pt-2 pb-1">
            <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Contact</span>
            </div>
            <div className="pl-3 space-y-1 mt-1 border-l-2 border-slate-800 ml-3">
              <NavLink
                to="/admin/contact"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>Contact Info</span>
              </NavLink>
              <NavLink
                to="/admin/socials"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Share2 className="w-3.5 h-3.5 shrink-0" />
                <span>Social Platforms</span>
              </NavLink>
            </div>
          </div>

          {/* Settings */}
          <div className="pt-2">
            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <SettingsIcon className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </NavLink>
          </div>
        </nav>

        {/* Backend Connection Indicator & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[11px] font-semibold text-slate-300">Data Source</span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isLiveApiConfigured ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
              ></span>
              <span>{isLiveApiConfigured ? 'Google Apps Script (Live)' : 'Local Demo Data'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-slate-400 truncate">
              <span className="font-medium text-white">{adminUser?.username || 'admin'}</span>
              <div className="text-[10px] text-slate-500 capitalize">{adminUser?.role || 'administrator'}</div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors text-xs font-medium"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Open navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Workspace & Control Panel
            </span>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] font-medium text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>10m idle logout</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View Live Website Button */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#6c4df6] transition-colors"
            >
              <span>View Public Portfolio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Logout shortcut in topbar */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-72 bg-slate-900 text-slate-300 p-6 z-10 shadow-2xl">
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6c4df6] to-[#ec4899] flex items-center justify-center text-white font-bold text-xs">
                  A
                </div>
                <span className="font-bold text-white text-base">Admin Dashboard</span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-6 space-y-2 overflow-y-auto">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/admin/profile"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>Profile</span>
              </NavLink>

              <NavLink
                to="/admin/experience"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <Briefcase className="w-4 h-4 shrink-0" />
                <span>Experience</span>
              </NavLink>

              <div className="pt-2">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Portfolio</div>
                <div className="pl-2 space-y-1">
                  <NavLink
                    to="/admin/portfolio/categories"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        isActive ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`
                    }
                  >
                    <Layers className="w-4 h-4 shrink-0" />
                    <span>Categories</span>
                  </NavLink>
                  <NavLink
                    to="/admin/portfolio/projects"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        isActive ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`
                    }
                  >
                    <Database className="w-4 h-4 shrink-0" />
                    <span>Projects</span>
                  </NavLink>
                </div>
              </div>

              <div className="pt-2">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Contact</div>
                <div className="pl-2 space-y-1">
                  <NavLink
                    to="/admin/contact"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        isActive ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`
                    }
                  >
                    <Mail className="w-4 h-4 shrink-0" />
                    <span>Contact Info</span>
                  </NavLink>
                  <NavLink
                    to="/admin/socials"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        isActive ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`
                    }
                  >
                    <Share2 className="w-4 h-4 shrink-0" />
                    <span>Social Platforms</span>
                  </NavLink>
                </div>
              </div>

              <NavLink
                to="/admin/settings"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <SettingsIcon className="w-4 h-4 shrink-0" />
                <span>Settings</span>
              </NavLink>
            </nav>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 bg-rose-950/30 hover:bg-rose-950/60 transition-colors w-full border border-rose-900/40"
            >
              <LogOut className="w-4 h-4" />
              <span>LOGOUT</span>
            </button>
          </aside>
        </div>
      )}
    </div>
  )
}
