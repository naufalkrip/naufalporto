import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost } from '../services/api'
import type { Settings } from '../types'

export const THEME_PRESETS: Record<
  string,
  {
    name: string
    primary_color: string
    secondary_color: string
    accent_color: string
    gradient_start: string
    gradient_end: string
  }
> = {
  'creative-purple': {
    name: 'Creative Purple',
    primary_color: '#6c4df6',
    secondary_color: '#3b82f6',
    accent_color: '#ec4899',
    gradient_start: '#6c4df6',
    gradient_end: '#3b82f6'
  },
  'creative-blue': {
    name: 'Creative Blue',
    primary_color: '#3b82f6',
    secondary_color: '#06b6d4',
    accent_color: '#6366f1',
    gradient_start: '#3b82f6',
    gradient_end: '#06b6d4'
  },
  'creative-sunset': {
    name: 'Creative Sunset',
    primary_color: '#f97316',
    secondary_color: '#ec4899',
    accent_color: '#8b5cf6',
    gradient_start: '#f97316',
    gradient_end: '#ec4899'
  },
  'creative-pink': {
    name: 'Creative Pink',
    primary_color: '#ec4899',
    secondary_color: '#a855f7',
    accent_color: '#3b82f6',
    gradient_start: '#ec4899',
    gradient_end: '#8b5cf6'
  }
}

export function useSettings(autoSync: boolean = false) {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  const applyThemeVariables = (cfg: Settings) => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (cfg.primary_color) {
      root.style.setProperty('--color-primary', cfg.primary_color)
      root.style.setProperty('--primary', cfg.primary_color)
    }
    if (cfg.secondary_color) {
      root.style.setProperty('--color-secondary', cfg.secondary_color)
    }
    if (cfg.accent_color) {
      root.style.setProperty('--color-accent', cfg.accent_color)
      root.style.setProperty('--accent', cfg.accent_color)
    }
    if (cfg.gradient_start && cfg.gradient_end) {
      root.style.setProperty('--gradient-start', cfg.gradient_start)
      root.style.setProperty('--gradient-end', cfg.gradient_end)
      root.style.setProperty(
        '--gradient-primary',
        `linear-gradient(135deg, ${cfg.gradient_start} 0%, ${cfg.gradient_end} 100%)`
      )
    }
  }

  const fetchSettings = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true)
    try {
      const { data, error: apiErr, isDemo: demoFlag } = await apiGet<Settings>('getSettings')
      setIsDemo(demoFlag)
      if (apiErr) {
        setError(apiErr)
      } else if (data) {
        setSettings(data)
        applyThemeVariables(data)
        setError(null)
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load settings')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()

    if (autoSync) {
      const interval = setInterval(() => {
        fetchSettings(true)
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [fetchSettings, autoSync])

  const updateSettingsData = async (updates: Partial<Settings>): Promise<boolean> => {
    setLoading(true)
    try {
      const { data, error: apiErr } = await apiPost<Settings>('updateSettings', updates)
      if (apiErr) {
        setError(apiErr)
        return false
      }
      if (data) {
        setSettings((prev) => ({ ...prev, ...data } as Settings))
        applyThemeVariables(data)
        return true
      }
      return false
    } catch (err: any) {
      setError(err.message || 'Failed to update settings')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    settings,
    loading,
    error,
    isDemo,
    refresh: () => fetchSettings(false),
    updateSettings: updateSettingsData
  }
}