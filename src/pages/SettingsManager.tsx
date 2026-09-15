import React, { useState, useEffect } from 'react'
import {
  Save,
  Palette,
  Wrench,
  Sparkles,
  Sliders,
  Loader2,
  Check
} from 'lucide-react'
import { useSettings } from '../hooks/useSettings'
import { useToast } from '../components/Toast'
import type { Settings as SettingsType } from '../types'

export const SettingsManager: React.FC = () => {
  const { settings, loading, updateSettings } = useSettings()
  const { showToast } = useToast()

  const [formData, setFormData] = useState<Partial<SettingsType>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (settings) {
      setFormData(settings)
    }
  }, [settings])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleToggle = (key: 'animation_enabled' | 'maintenance_mode') => {
    setFormData((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const success = await updateSettings(formData)
    setSaving(false)

    if (success) {
      showToast('Settings saved and theme applied!', 'success')
    } else {
      showToast('Failed to save settings. Check server connection.', 'error')
    }
  }

  const creativeThemes = [
    {
      id: 'creative-purple',
      label: 'Creative Purple',
      primary: '#6c4df6',
      secondary: '#3b82f6',
      accent: '#ec4899',
      start: '#6c4df6',
      end: '#3b82f6',
      preview: 'from-[#6c4df6] to-[#3b82f6]'
    },
    {
      id: 'creative-blue',
      label: 'Creative Blue',
      primary: '#3b82f6',
      secondary: '#06b6d4',
      accent: '#6366f1',
      start: '#3b82f6',
      end: '#06b6d4',
      preview: 'from-[#3b82f6] to-[#06b6d4]'
    },
    {
      id: 'creative-sunset',
      label: 'Creative Sunset',
      primary: '#f97316',
      secondary: '#ec4899',
      accent: '#8b5cf6',
      start: '#f97316',
      end: '#ec4899',
      preview: 'from-[#f97316] to-[#ec4899]'
    },
    {
      id: 'creative-pink',
      label: 'Creative Pink',
      primary: '#ec4899',
      secondary: '#a855f7',
      accent: '#3b82f6',
      start: '#ec4899',
      end: '#8b5cf6',
      preview: 'from-[#ec4899] to-[#8b5cf6]'
    }
  ]

  const handleSelectThemePreset = (preset: typeof creativeThemes[0]) => {
    setFormData((prev) => ({
      ...prev,
      color_theme: preset.id as any,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      accent_color: preset.accent,
      gradient_start: preset.start,
      gradient_end: preset.end
    }))
  }

  if (loading && !settings) {
    return (
      <div className="py-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Website Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure SEO tags, typography themes, accent branding, and maintenance mode in SETTINGS sheet.
          </p>
        </div>

        <button
          type="submit"
          form="settings-form"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-sky-500 hover:bg-sky-400 rounded-xl transition-colors shadow-xs disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <form id="settings-form" onSubmit={handleSave} className="space-y-6">
        {/* Maintenance Mode Warning Card */}
        <div
          className={`p-6 rounded-2xl border transition-all ${
            formData.maintenance_mode
              ? 'bg-amber-500/10 border-amber-300 text-amber-950'
              : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  formData.maintenance_mode
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Maintenance Mode</h3>
                <p className="text-xs text-slate-500">
                  When enabled, visitors will see a maintenance screen. You can still access this dashboard.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('maintenance_mode')}
              className={`w-12 h-7 rounded-full transition-colors relative p-0.5 shrink-0 ${
                formData.maintenance_mode ? 'bg-amber-500' : 'bg-slate-300'
              }`}
              aria-label="Toggle maintenance mode"
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-xs transform transition-transform ${
                  formData.maintenance_mode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Branding & Theme Colors */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-sky-500" />
              Creative Color Theme & Visual Direction
            </h2>
          </div>

          {/* Theme Presets */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-slate-700">
              Creative Theme Presets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {creativeThemes.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectThemePreset(preset)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    formData.primary_color === preset.primary && formData.gradient_end === preset.end
                      ? 'border-sky-500 bg-sky-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`w-full h-8 rounded-lg bg-gradient-to-r ${preset.preview} mb-2 flex items-center justify-end px-2`}>
                    {formData.primary_color === preset.primary && formData.gradient_end === preset.end && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Individual Colors & Gradient Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
            {/* Primary Color */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="primary_color"
                  value={formData.primary_color || '#6c4df6'}
                  onChange={handleChange}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                />
                <input
                  type="text"
                  name="primary_color"
                  value={formData.primary_color || '#6c4df6'}
                  onChange={handleChange}
                  placeholder="#6c4df6"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="secondary_color"
                  value={formData.secondary_color || '#3b82f6'}
                  onChange={handleChange}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                />
                <input
                  type="text"
                  name="secondary_color"
                  value={formData.secondary_color || '#3b82f6'}
                  onChange={handleChange}
                  placeholder="#3b82f6"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
                />
              </div>
            </div>

            {/* Accent Color */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="accent_color"
                  value={formData.accent_color || '#ec4899'}
                  onChange={handleChange}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                />
                <input
                  type="text"
                  name="accent_color"
                  value={formData.accent_color || '#ec4899'}
                  onChange={handleChange}
                  placeholder="#ec4899"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Gradient Start & End Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Gradient Start</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="gradient_start"
                  value={formData.gradient_start || '#6c4df6'}
                  onChange={handleChange}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                />
                <input
                  type="text"
                  name="gradient_start"
                  value={formData.gradient_start || '#6c4df6'}
                  onChange={handleChange}
                  placeholder="#6c4df6"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Gradient End</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="gradient_end"
                  value={formData.gradient_end || '#3b82f6'}
                  onChange={handleChange}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                />
                <input
                  type="text"
                  name="gradient_end"
                  value={formData.gradient_end || '#3b82f6'}
                  onChange={handleChange}
                  placeholder="#3b82f6"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Site Metadata & SEO */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-500" />
            Website Metadata & SEO
          </h2>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Website Title Tag</label>
            <input
              type="text"
              name="site_title"
              value={formData.site_title || ''}
              onChange={handleChange}
              placeholder="e.g. Alexander Bayu — Creative Developer"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Meta Description</label>
            <textarea
              name="site_description"
              value={formData.site_description || ''}
              onChange={handleChange}
              rows={2}
              placeholder="Concise overview of your portfolio for search engines and social shares..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Footer Text</label>
            <input
              type="text"
              name="footer_text"
              value={formData.footer_text || ''}
              onChange={handleChange}
              placeholder="e.g. © 2026 Alexander Bayu. All rights reserved."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Micro-animations Toggle */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Dynamic Micro-animations</h3>
              <p className="text-xs text-slate-500">
                Subtle entrance fades, card hover elevation, and interactive transitions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleToggle('animation_enabled')}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
              formData.animation_enabled ? 'bg-sky-500' : 'bg-slate-300'
            }`}
            aria-label="Toggle animations"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                formData.animation_enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </form>
    </div>
  )
}
