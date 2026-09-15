import React, { useState, useEffect, useRef } from 'react'
import {
  User,
  Upload,
  Trash2,
  Save,
  RotateCcw,
  Loader2,
  Image as ImageIcon
} from 'lucide-react'
import { useProfile } from '../hooks/useProfile'
import { DriveService } from '../services/drive'
import { useToast } from '../components/Toast'
import type { Profile } from '../types'

export const ProfileManager: React.FC = () => {
  const { profile, loading, updateProfile } = useProfile()
  const { showToast } = useToast()

  const [formData, setFormData] = useState<Partial<Profile>>({})
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile) {
      setFormData(profile)
    }
  }, [profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleReset = () => {
    if (profile) {
      setFormData(profile)
      showToast('Form fields reset to current values', 'info')
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const success = await updateProfile(formData)
    setSaving(false)

    if (success) {
      showToast('Profile updated successfully!', 'success')
    } else {
      showToast('Failed to save profile. Please check server connection.', 'error')
    }
  }

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPEG, PNG, WebP)', 'error')
      return
    }

    setUploadingImage(true)
    try {
      const res = await DriveService.uploadFile(file, 'Profile')
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, profile_image: res.url }))
        showToast('Profile photo uploaded successfully', 'success')
      } else {
        showToast(res.message || 'Image upload failed', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Upload error', 'error')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeletePhoto = () => {
    setFormData((prev) => ({ ...prev, profile_image: '' }))
    showToast('Photo removed. Remember to click Save to persist.', 'info')
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profile Information</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your personal identity, bio, skills, and contact links stored in the PROFILE sheet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="submit"
            form="profile-form"
            disabled={saving || uploadingImage}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-sky-500 hover:bg-sky-400 rounded-xl transition-colors shadow-xs disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </div>

      <form id="profile-form" onSubmit={handleSave} className="space-y-6">
        {/* Profile Photo Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-sky-500" />
            Profile Avatar & Cover Image
          </h2>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar Preview */}
            <div className="relative w-32 h-32 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-inner group">
              {formData.profile_image ? (
                <img
                  src={formData.profile_image}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <User className="w-8 h-8 mb-1" />
                  <span className="text-[10px]">No Photo</span>
                </div>
              )}

              {uploadingImage && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
            </div>

            {/* Photo Action Controls */}
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div>
                <p className="text-xs font-semibold text-slate-800">High-Resolution Photo</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Uploaded image is automatically compressed and saved to your Google Drive. Recommended: 800x800px minimum.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{formData.profile_image ? 'Replace Photo' : 'Upload Photo'}</span>
                </button>

                {formData.profile_image && (
                  <button
                    type="button"
                    onClick={handleDeletePhoto}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              {/* Direct image URL override */}
              <div className="pt-2">
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Or provide image URL directly:
                </label>
                <input
                  type="url"
                  name="profile_image"
                  value={formData.profile_image || ''}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Basic Personal Details */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Full Display Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Professional Titles (ID & EN) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Professional Title (ID)
              </label>
              <input
                type="text"
                name="professional_title_id"
                value={formData.professional_title_id || formData.professional_title || ''}
                onChange={handleChange}
                placeholder="e.g. Creative Technologist & Arsitek UI"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Professional Title (EN)
              </label>
              <input
                type="text"
                name="professional_title_en"
                value={formData.professional_title_en || formData.professional_title || ''}
                onChange={handleChange}
                placeholder="e.g. Creative Technologist & UI Architect"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Short Intro (ID & EN) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Short Introduction / Tagline (ID)
              </label>
              <textarea
                name="short_intro_id"
                value={formData.short_intro_id || formData.short_intro || ''}
                onChange={handleChange}
                rows={2}
                placeholder="Membangun pengalaman digital yang bermakna..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Short Introduction / Tagline (EN)
              </label>
              <textarea
                name="short_intro_en"
                value={formData.short_intro_en || formData.short_intro || ''}
                onChange={handleChange}
                rows={2}
                placeholder="Crafting meaningful digital experiences..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Full Biography (ID & EN) */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Full Biography (ID)
              </label>
              <textarea
                name="bio_id"
                value={formData.bio_id || formData.bio || ''}
                onChange={handleChange}
                rows={4}
                placeholder="Cerita personal, filosofi desain, dan latar belakang dalam Bahasa Indonesia..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Full Biography (EN)
              </label>
              <textarea
                name="bio_en"
                value={formData.bio_en || formData.bio || ''}
                onChange={handleChange}
                rows={4}
                placeholder="Personal narrative, craft philosophy, and background in English..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 leading-relaxed"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Skills & Disciplines (Comma-separated)
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills || ''}
              onChange={handleChange}
              placeholder="React, TypeScript, UI/UX Design, Three.js, Node.js"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
            />
            <p className="text-[11px] text-slate-400">Separate each skill with a comma to generate skill badges.</p>
          </div>
        </div>

        {/* Contact Coordinates */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 mb-2">Location & Social Channels</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                placeholder="Jakarta, Indonesia"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Primary Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="alexander@example.com"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">WhatsApp Number</label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp || ''}
                onChange={handleChange}
                placeholder="+6281234567890"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Personal Website</label>
              <input
                type="url"
                name="website"
                value={formData.website || ''}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">LinkedIn URL</label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin || ''}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">GitHub URL</label>
              <input
                type="url"
                name="github"
                value={formData.github || ''}
                onChange={handleChange}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">Instagram URL</label>
              <input
                type="url"
                name="instagram"
                value={formData.instagram || ''}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
