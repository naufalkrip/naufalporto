import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  CheckCircle2,
  FileEdit,
  Clock,
  Plus,
  User,
  Settings,
  Activity,
  ArrowRight
} from 'lucide-react'
import { usePortfolio } from '../hooks/usePortfolio'
import { apiGet } from '../services/api'
import type { ActivityLog } from '../types'

export const AdminDashboard: React.FC = () => {
  const { items: allItems, loading: portLoading } = usePortfolio('all')
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [logsLoading, setLogsLoading] = useState(true)

  useEffect(() => {
    async function loadLogs() {
      setLogsLoading(true)
      const { data } = await apiGet<ActivityLog[]>('getActivityLogs')
      if (data) setLogs(data)
      setLogsLoading(false)
    }
    loadLogs()
  }, [])

  const totalWorks = allItems.length
  const publishedWorks = allItems.filter((i) => i.status === 'published').length
  const draftWorks = allItems.filter((i) => i.status === 'draft').length

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status of your portfolio database and public publication state.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/portfolio"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Work</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Portfolio */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Works</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">
              {portLoading ? '...' : totalWorks}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Registered in database</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Published */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Published</span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-2">
              {portLoading ? '...' : publishedWorks}
            </div>
            <span className="text-[11px] text-emerald-600/80 mt-1 block">Live on public website</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Drafts */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Drafts</span>
            <div className="text-3xl font-extrabold text-amber-500 mt-2">
              {portLoading ? '...' : draftWorks}
            </div>
            <span className="text-[11px] text-amber-600/80 mt-1 block">Unpublished / Work in progress</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileEdit className="w-6 h-6" />
          </div>
        </div>

        {/* Last Updated */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Sync</span>
            <div className="text-base font-bold text-slate-900 mt-3 truncate">
              {allItems[0]?.updated_at
                ? new Date(allItems[0].updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Just now'}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Database active</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/admin/profile"
          className="group bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-sky-50 text-slate-700 group-hover:text-sky-600 flex items-center justify-center transition-colors">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-slate-900">Edit Profile</h4>
              <p className="text-[11px] text-slate-500">Update bio, titles, and photo</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          to="/admin/portfolio"
          className="group bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-slate-900">Manage Portfolio</h4>
              <p className="text-[11px] text-slate-500">Organize and publish projects</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          to="/admin/settings"
          className="group bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-purple-50 text-slate-700 group-hover:text-purple-600 flex items-center justify-center transition-colors">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-slate-900">Site Settings</h4>
              <p className="text-[11px] text-slate-500">Theme color & maintenance mode</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Activity Log Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-sky-500" />
            <h3 className="text-base font-bold text-slate-900">Recent System Activity</h3>
          </div>
          <span className="text-xs text-slate-400">Sheet: ACTIVITY_LOG</span>
        </div>

        <div className="divide-y divide-slate-100">
          {logsLoading ? (
            <div className="p-6 text-center text-xs text-slate-400">Loading audit history...</div>
          ) : logs.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No activity recorded yet.</div>
          ) : (
            logs.slice(0, 6).map((log) => (
              <div key={log.id} className="p-4 sm:px-6 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 uppercase ${
                      log.action === 'LOGIN'
                        ? 'bg-blue-100 text-blue-800'
                        : log.action === 'CREATE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.action === 'DELETE'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {log.action}
                  </span>
                  <div className="truncate">
                    <strong className="text-slate-800 font-semibold">{log.target}</strong>
                    <span className="text-slate-500 ml-1.5 hidden sm:inline">— {log.details}</span>
                  </div>
                </div>

                <div className="text-slate-400 text-[11px] shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
