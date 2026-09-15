import React from 'react'
import { Wrench } from 'lucide-react'

interface MaintenanceProps {
  siteTitle?: string
}

export const Maintenance: React.FC<MaintenanceProps> = ({ siteTitle }) => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white px-6 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto shadow-inner">
          <Wrench className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Under Scheduled Maintenance
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            {siteTitle || 'Our portfolio website'} is currently undergoing a brief update to bring you fresh works and enhanced features. Please check back soon!
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800 text-xs text-slate-500">
          Crafting something extraordinary.
        </div>
      </div>
    </main>
  )
}
