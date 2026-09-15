import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'
import { Maintenance } from '../components/Maintenance'
import { Info, X } from 'lucide-react'

export const PublicLayout: React.FC = () => {
  const { settings, isDemo } = useSettings(true)
  const [showDemoBanner, setShowDemoBanner] = useState(true)

  // Maintenance mode gate for public visitors
  if (settings?.maintenance_mode) {
    return <Maintenance siteTitle={settings?.site_title} />
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text)]">
      {/* Informative Demo Banner (subtle, non-intrusive, dismissible) */}
      {isDemo && showDemoBanner && (
        <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 flex items-center justify-between border-b border-slate-800 z-50 sticky top-0">
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full justify-center">
            <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>
              <strong className="text-white">Demo Mode Active:</strong> Operating with local demo data. Connect Google Sheets & Apps Script in <code className="bg-slate-800 px-1 py-0.5 rounded text-sky-300">.env</code> for live cloud synchronization.
            </span>
          </div>
          <button
            onClick={() => setShowDemoBanner(false)}
            className="text-slate-400 hover:text-white p-1 ml-2"
            aria-label="Dismiss demo banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <Outlet />
    </div>
  )
}
