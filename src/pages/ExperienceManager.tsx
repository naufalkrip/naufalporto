import React, { useState } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Briefcase,
  X,
  AlertTriangle,
  Loader2,
  ArrowUp,
  ArrowDown,
  Building2,
  Calendar
} from 'lucide-react'
import { useExperience } from '../hooks/useExperience'
import { useToast } from '../components/Toast'
import type { Experience } from '../types'

export const ExperienceManager: React.FC = () => {
  const {
    experiences,
    loading,
    createExperience,
    updateExperience,
    deleteExperience,
    reorderExperiences
  } = useExperience('all')
  const { showToast } = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingExp, setEditingExp] = useState<Experience | null>(null)
  const [formData, setFormData] = useState<Partial<Experience>>({
    position: '',
    position_id: '',
    position_en: '',
    company: '',
    location: '',
    year_start: '',
    year_end: '',
    is_current: false,
    description: '',
    description_id: '',
    description_en: '',
    company_logo: '',
    display_order: 1,
    status: 'published'
  })

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [expToDelete, setExpToDelete] = useState<Experience | null>(null)
  const [saving, setSaving] = useState(false)

  const openCreateModal = () => {
    setEditingExp(null)
    setFormData({
      position: '',
      position_id: '',
      position_en: '',
      company: '',
      location: '',
      year_start: new Date().getFullYear().toString(),
      year_end: '',
      is_current: false,
      description: '',
      description_id: '',
      description_en: '',
      company_logo: '',
      display_order: experiences.length + 1,
      status: 'published'
    })
    setModalOpen(true)
  }

  const openEditModal = (exp: Experience) => {
    setEditingExp(exp)
    setFormData({
      ...exp,
      is_current: exp.is_current === true || String(exp.is_current).toUpperCase() === 'TRUE'
    })
    setModalOpen(true)
  }

  const openDeleteModal = (exp: Experience) => {
    setExpToDelete(exp)
    setDeleteModalOpen(true)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        ...(name === 'is_current' && checked ? { year_end: '' } : {})
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const pos = formData.position_id || formData.position_en || formData.position
    if (!pos?.trim() || !formData.company?.trim()) {
      showToast('Position and Company are required', 'error')
      return
    }

    setSaving(true)
    const payload = {
      ...formData,
      position: pos,
      position_id: formData.position_id || pos,
      position_en: formData.position_en || pos,
      description: formData.description_id || formData.description_en || formData.description || '',
      display_order: Number(formData.display_order) || experiences.length + 1
    }

    let success = false
    if (editingExp) {
      success = await updateExperience(editingExp.id, payload)
    } else {
      success = await createExperience(payload as any)
    }
    setSaving(false)

    if (success) {
      showToast(editingExp ? 'Experience updated!' : 'Experience created!', 'success')
      setModalOpen(false)
    } else {
      showToast('Failed to save experience. Please try again.', 'error')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!expToDelete) return
    setSaving(true)
    const success = await deleteExperience(expToDelete.id)
    setSaving(false)
    if (success) {
      showToast('Experience deleted', 'success')
      setDeleteModalOpen(false)
      setExpToDelete(null)
    } else {
      showToast('Failed to delete experience', 'error')
    }
  }

  const handleToggleStatus = async (exp: Experience) => {
    const newStatus = exp.status === 'published' ? 'draft' : 'published'
    const success = await updateExperience(exp.id, { status: newStatus })
    if (success) {
      showToast(`Experience set to ${newStatus}`, 'success')
    }
  }

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= experiences.length) return

    const newExps = [...experiences]
    const temp = newExps[index]
    newExps[index] = newExps[targetIndex]
    newExps[targetIndex] = temp

    const orderedIds = newExps.map((c) => c.id)
    await reorderExperiences(orderedIds)
    showToast('Experience order updated', 'success')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Career Experience</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your career timeline, roles, companies, and milestones shown on the public website.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 rounded-xl transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Experience</span>
        </button>
      </div>

      {/* Experience Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading && experiences.length === 0 ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          </div>
        ) : experiences.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No experiences created yet</p>
            <p className="text-xs text-slate-400">Click &quot;Add Experience&quot; to build your career timeline.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">Order</th>
                  <th className="py-3.5 px-4">Period</th>
                  <th className="py-3.5 px-4">Position & Company</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {experiences.map((exp, index) => {
                  const isCurrent = exp.is_current === true || String(exp.is_current).toUpperCase() === 'TRUE'
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
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
                            disabled={index === experiences.length - 1}
                            onClick={() => handleMoveOrder(index, 'down')}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                            title="Move down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Period */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-800">
                            {exp.year_start} — {isCurrent ? 'Present' : exp.year_end || 'Present'}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                              Current
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Position & Company */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block">
                            {exp.position_id || exp.position || exp.position_en}
                          </span>
                          <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {exp.company}
                          </span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-slate-500">
                        {exp.location || '—'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(exp)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase transition-colors ${
                            exp.status === 'published'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/80 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {exp.status === 'published' ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(exp)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(exp)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-sky-500" />
                <span>{editingExp ? 'Edit Experience' : 'Add Experience'}</span>
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Position (ID & EN) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Position Title (ID) *
                  </label>
                  <input
                    type="text"
                    name="position_id"
                    required
                    value={formData.position_id || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Lead Creative Developer"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Position Title (EN) *
                  </label>
                  <input
                    type="text"
                    name="position_en"
                    value={formData.position_en || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Lead Creative Developer"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Company & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Company / Studio Name *
                  </label>
                  <input
                    type="text"
                    name="company"
                    required
                    value={formData.company || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Nexus Studio Lab"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Jakarta, Indonesia"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Period & Current Flag */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Start Year *
                  </label>
                  <input
                    type="text"
                    name="year_start"
                    required
                    value={formData.year_start || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. 2024"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    End Year
                  </label>
                  <input
                    type="text"
                    name="year_end"
                    disabled={formData.is_current}
                    value={formData.is_current ? '' : formData.year_end || ''}
                    onChange={handleInputChange}
                    placeholder={formData.is_current ? 'Present' : 'e.g. 2025'}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-2 pb-2">
                  <input
                    type="checkbox"
                    id="is_current"
                    name="is_current"
                    checked={formData.is_current || false}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                  />
                  <label htmlFor="is_current" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Current Position
                  </label>
                </div>
              </div>

              {/* Descriptions (ID & EN) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Role Description (ID)
                </label>
                <textarea
                  name="description_id"
                  rows={2}
                  value={formData.description_id || ''}
                  onChange={handleInputChange}
                  placeholder="Deskripsi pencapaian, tanggung jawab, dan teknologi yang digunakan..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Role Description (EN)
                </label>
                <textarea
                  name="description_en"
                  rows={2}
                  value={formData.description_en || ''}
                  onChange={handleInputChange}
                  placeholder="Description of leadership, responsibilities, and craft highlights..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 leading-relaxed"
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
                    value={formData.status || 'published'}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft (Hidden)</option>
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
                  <span>{saving ? 'Saving...' : editingExp ? 'Save Changes' : 'Create Experience'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModalOpen && expToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Experience</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete{' '}
                <span className="font-bold text-slate-800">
                  {expToDelete.position} at {expToDelete.company}
                </span>
                ? This action will remove it from the timeline immediately.
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
                <span>{saving ? 'Deleting...' : 'Delete Experience'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
