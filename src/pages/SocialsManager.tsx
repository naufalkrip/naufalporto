import React, { useState } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  Share2,
  X,
  AlertTriangle,
  Loader2,
  ArrowUp,
  ArrowDown,
  ExternalLink
} from 'lucide-react'
import { useSocials } from '../hooks/useSocials'
import { useToast } from '../components/Toast'
import type { SocialPlatform } from '../types'

export const SocialsManager: React.FC = () => {
  const {
    socials,
    loading,
    createSocial,
    updateSocial,
    deleteSocial,
    reorderSocials
  } = useSocials('all')
  const { showToast } = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingSoc, setEditingSoc] = useState<SocialPlatform | null>(null)
  const [formData, setFormData] = useState<Partial<SocialPlatform>>({
    platform: 'instagram',
    label: '',
    label_id: '',
    label_en: '',
    username: '',
    url: '',
    display_order: 1,
    status: 'active'
  })

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [socToDelete, setSocToDelete] = useState<SocialPlatform | null>(null)
  const [saving, setSaving] = useState(false)

  const platformPresets = [
    { value: 'email', label: 'Email' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'github', label: 'GitHub' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'behance', label: 'Behance' },
    { value: 'dribbble', label: 'Dribbble' },
    { value: 'website', label: 'Website' },
    { value: 'other', label: 'Other Platform' }
  ]

  const openCreateModal = () => {
    setEditingSoc(null)
    setFormData({
      platform: 'instagram',
      label: 'Instagram',
      label_id: 'Instagram',
      label_en: 'Instagram',
      username: '',
      url: 'https://instagram.com/',
      display_order: socials.length + 1,
      status: 'active'
    })
    setModalOpen(true)
  }

  const openEditModal = (soc: SocialPlatform) => {
    setEditingSoc(soc)
    setFormData({ ...soc })
    setModalOpen(true)
  }

  const openDeleteModal = (soc: SocialPlatform) => {
    setSocToDelete(soc)
    setDeleteModalOpen(true)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    if (name === 'platform' && !editingSoc) {
      const found = platformPresets.find((p) => p.value === value)
      const defaultLabel = found ? found.label : value
      setFormData((prev) => ({
        ...prev,
        platform: value as any,
        label: defaultLabel,
        label_id: defaultLabel,
        label_en: defaultLabel
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.url?.trim()) {
      showToast('URL / Link is required', 'error')
      return
    }

    setSaving(true)
    const lbl = formData.label_id || formData.label_en || formData.label || formData.platform || 'Link'
    const payload = {
      ...formData,
      label: lbl,
      label_id: formData.label_id || lbl,
      label_en: formData.label_en || lbl,
      display_order: Number(formData.display_order) || socials.length + 1
    }

    let success = false
    if (editingSoc) {
      success = await updateSocial(editingSoc.id, payload)
    } else {
      success = await createSocial(payload as any)
    }
    setSaving(false)

    if (success) {
      showToast(editingSoc ? 'Platform updated!' : 'Platform created!', 'success')
      setModalOpen(false)
    } else {
      showToast('Failed to save social platform', 'error')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!socToDelete) return
    setSaving(true)
    const success = await deleteSocial(socToDelete.id)
    setSaving(false)
    if (success) {
      showToast('Platform deleted', 'success')
      setDeleteModalOpen(false)
      setSocToDelete(null)
    } else {
      showToast('Failed to delete platform', 'error')
    }
  }

  const handleToggleStatus = async (soc: SocialPlatform) => {
    const newStatus = soc.status === 'active' ? 'inactive' : 'active'
    const success = await updateSocial(soc.id, { status: newStatus })
    if (success) {
      showToast(`Platform set to ${newStatus}`, 'success')
    }
  }

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= socials.length) return

    const newSocs = [...socials]
    const temp = newSocs[index]
    newSocs[index] = newSocs[targetIndex]
    newSocs[targetIndex] = temp

    const orderedIds = newSocs.map((c) => c.id)
    await reorderSocials(orderedIds)
    showToast('Platform order updated', 'success')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Social Platforms</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage interactive social cards (Email, Instagram, TikTok, LinkedIn, etc.) displayed in the Connect section.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 rounded-xl transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Platform</span>
        </button>
      </div>

      {/* Social Platforms Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading && socials.length === 0 ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          </div>
        ) : socials.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Share2 className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No social platforms added yet</p>
            <p className="text-xs text-slate-400">Click &quot;Add Platform&quot; to connect your audience.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">Order</th>
                  <th className="py-3.5 px-4">Platform</th>
                  <th className="py-3.5 px-4">Display Label</th>
                  <th className="py-3.5 px-4">Handle / URL</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {socials.map((soc, index) => (
                  <tr key={soc.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Order buttons */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveOrder(index, 'up')}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-xs font-bold text-slate-700 w-4">
                          {index + 1}
                        </span>
                        <button
                          type="button"
                          disabled={index === socials.length - 1}
                          onClick={() => handleMoveOrder(index, 'down')}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Platform Tag */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
                        {soc.platform}
                      </span>
                    </td>

                    {/* Label */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {soc.label_id || soc.label || soc.platform}
                    </td>

                    {/* URL */}
                    <td className="py-3.5 px-4">
                      <a
                        href={soc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 max-w-xs truncate"
                      >
                        <span className="truncate">{soc.username || soc.url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(soc)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase transition-colors ${
                          soc.status === 'active'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/80 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {soc.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(soc)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(soc)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-sky-500" />
                <span>{editingSoc ? 'Edit Platform' : 'Add Platform'}</span>
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Platform Selector */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Platform Type</label>
                <select
                  name="platform"
                  value={formData.platform || 'instagram'}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                >
                  {platformPresets.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Display Label (ID & EN) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Display Label (ID)
                  </label>
                  <input
                    type="text"
                    name="label_id"
                    value={formData.label_id || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Instagram"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Display Label (EN)
                  </label>
                  <input
                    type="text"
                    name="label_en"
                    value={formData.label_en || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Instagram"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Username / Handle */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Username / Handle (Optional)
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. @alexanderbayu"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              {/* URL */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">URL / Link *</label>
                <input
                  type="text"
                  name="url"
                  required
                  value={formData.url || ''}
                  onChange={handleInputChange}
                  placeholder="https://... or mailto:..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              {/* Status & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Display Order</label>
                  <input
                    type="number"
                    name="display_order"
                    value={formData.display_order || 1}
                    onChange={handleInputChange}
                    min={1}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Status</label>
                  <select
                    name="status"
                    value={formData.status || 'active'}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 rounded-xl transition-colors shadow-xs disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{saving ? 'Saving...' : editingSoc ? 'Save Changes' : 'Create Platform'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModalOpen && socToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Social Platform</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to remove{' '}
                <span className="font-bold text-slate-800">
                  {socToDelete.label || socToDelete.platform}
                </span>{' '}
                from your public connect section?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleDeleteConfirm}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-xs disabled:opacity-50"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{saving ? 'Deleting...' : 'Delete Platform'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
