import React from 'react'
import { Outlet } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'
import { Maintenance } from '../components/Maintenance'

export const PublicLayout: React.FC = () => {
  const { settings } = useSettings(true)

  // Maintenance mode gate for public visitors
  if (settings?.maintenance_mode) {
    return <Maintenance siteTitle={settings?.site_title} />
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text)]">
      <Outlet />
    </div>
  )
}
