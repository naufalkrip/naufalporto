import React, { useState, useEffect } from 'react'
import {
  Mail,
  MessageSquare,
  Globe,
  Save,
  Loader2
} from 'lucide-react'
import { GithubIcon, LinkedinIcon, InstagramIcon } from '../components/SocialIcons'
import { useProfile } from '../hooks/useProfile'
import { useToast } from '../components/Toast'

interface ChannelState {
  key: string
  label: string
  icon: any
  value: string
  enabled: boolean
  placeholder: string
}

export const ContactManager: React.FC = () => {
  const { profile, loading, updateProfile } = useProfile()
  const { showToast } = useToast()

  const [channels, setChannels] = useState<ChannelState[]>([
    { key: 'email', label: 'Email', icon: Mail, value: '', enabled: true, placeholder: 'hello@example.com' },
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, value: '', enabled: true, placeholder: '+6281234567890' },
    { key: 'linkedin', label: 'LinkedIn', icon: LinkedinIcon, value: '', enabled: true, placeholder: 'https://linkedin.com/in/username' },
    { key: 'github', label: 'GitHub', icon: GithubIcon, value: '', enabled: true, placeholder: 'https://github.com/username' },
    { key: 'instagram', label: 'Instagram', icon: InstagramIcon, value: '', enabled: true, placeholder: 'https://instagram.com/username' },
    { key: 'website', label: 'Other Website', icon: Globe, value: '', enabled: true, placeholder: 'https://example.com' }
  ])

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setChannels((prev) =>
        prev.map((ch) => {
          const val = (profile as any)[ch.key] || ''
          return {
            ...ch,
            value: val,
            // If field has value, default enabled to true, else false
            enabled: Boolean(val && val.trim().length > 0)
          }
        })
      )
    }
  }, [profile])

  const handleToggle = (key: string) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.key === key ? { ...ch, enabled: !ch.enabled } : ch))
    )
  }

  const handleValueChange = (key: string, value: string) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.key === key ? { ...ch, value } : ch))
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Prepare update payload: if disabled, send empty string so public view hides it
    const updates: Record<string, string> = {}
    channels.forEach((ch) => {
      updates[ch.key] = ch.enabled ? ch.value : ''
    })

    const success = await updateProfile(updates)
    setSaving(false)

    if (success) {
      showToast('Contact channels updated successfully', 'success')
    } else {
      showToast('Failed to save contact channels', 'error')
    }
  }

  if (loading && !profile) {
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contact & Social Channels</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure visible communication channels and toggles on the public portfolio.
          </p>
        </div>

        <button
          type="submit"
          form="contact-form"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-sky-500 hover:bg-sky-400 rounded-xl transition-colors shadow-xs disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Channels'}</span>
        </button>
      </div>

      <form id="contact-form" onSubmit={handleSave} className="space-y-4">
        {channels.map((channel) => {
          const Icon = channel.icon
          return (
            <div
              key={channel.key}
              className={`p-5 rounded-2xl border transition-all duration-200 bg-white ${
                channel.enabled
                  ? 'border-slate-200/90 shadow-xs'
                  : 'border-slate-200/50 opacity-70 bg-slate-50/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      channel.enabled
                        ? 'bg-sky-50 text-sky-600'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Icon size={20} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{channel.label}</h3>
                    <p className="text-[11px] text-slate-400">
                      {channel.enabled ? 'Active on public portfolio' : 'Hidden from public portfolio'}
                    </p>
                  </div>
                </div>

                {/* Enable / Disable Switch */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs font-semibold text-slate-600">
                    {channel.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggle(channel.key)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      channel.enabled ? 'bg-sky-500' : 'bg-slate-300'
                    }`}
                    aria-label={`Toggle ${channel.label}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                        channel.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Value Input */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Destination URL / Handle
                </label>
                <input
                  type="text"
                  value={channel.value}
                  onChange={(e) => handleValueChange(channel.key, e.target.value)}
                  placeholder={channel.placeholder}
                  disabled={!channel.enabled}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
            </div>
          )
        })}
      </form>
    </div>
  )
}
