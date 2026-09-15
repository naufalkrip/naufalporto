import React, { useState } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Layers,
  X,
  AlertTriangle,
  Loader2,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { usePortfolio } from '../hooks/usePortfolio'
import { useToast } from '../components/Toast'
import type { PortfolioCategory } from '../types'

export const CategoriesManager: React.FC = () => {
  const { categories, loading, createCategory, updateCategory, deleteCategory, reorderCategories } =
    useCategories('all')
  const { items: allProjects } = usePortfolio('all')
  const { showToast } = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<PortfolioCategory | null>(null)
  const [formData, setFormData] = useState<Partial<PortfolioCategory>>({
    name: '',
    name_id: '',
    name_en: '',
    slug: '',
    subtitle: '',
    subtitle_id: '',
    subtitle_en: '',
    description: '',
    description_id: '',
    description_en: '',
    display_order: 1,
    status: 'published'
  })

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [catToDelete, setCatToDelete] = useState<PortfolioCategory | null>(null)
  const [saving, setSaving] = useState(false)

  const openCreateModal = () => {
    setEditingCat(null)
    setFormData({
      name: '',
      name_id: '',
      name_en: '',
      slug: '',
      subtitle: '',
      subtitle_id: '',
      subtitle_en: '',
      description: '',
      description_id: '',
      description_en: '',
      display_order: categories.length + 1,
      status: 'published'
    })
    setModalOpen(true)
  }

  const openEditModal = (cat: PortfolioCategory) => {
    setEditingCat(cat)
    setFormData({
      ...cat,
      name_id: cat.name_id || cat.name || '',
      name_en: cat.name_en || cat.name || '',
      subtitle_id: cat.subtitle_id || cat.subtitle || '',
      subtitle_en: cat.subtitle_en || cat.subtitle || '',
      description_id: cat.description_id || cat.description || '',
      description_en: cat.description_en || cat.description || ''
    })
    setModalOpen(true)
  }

  const openDeleteModal = (cat: PortfolioCategory) => {
    setCatToDelete(cat)
    setDeleteModalOpen(true)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    if ((name === 'name' || name === 'name_en' || name === 'name_id') && !editingCat) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        slug: prev.slug ? prev.slug : generatedSlug
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'display_order' ? Number(value) : value
      }))
    }
  }

  const handleToggleStatus = async (cat: PortfolioCategory) => {
    const nextStatus = cat.status === 'published' ? 'draft' : 'published'
    const success = await updateCategory(cat.id, { status: nextStatus })
    if (success) {
      showToast(`Category marked as ${nextStatus}`, 'success')
    } else {
      showToast('Failed to update category status', 'error')
    }
  }

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === categories.length - 1)
    ) {
      return
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const copy = [...categories]
    const current = copy[index]
    const target = copy[targetIndex]

    // Swap display_order
    const tempOrder = current.display_order
    current.display_order = target.display_order
    target.display_order = tempOrder

    const orderMap = [
      { id: current.id, order: current.display_order },
      { id: target.id, order: target.display_order }
    ]

    const success = await reorderCategories(orderMap)
    if (success) {
      showToast('Category order updated', 'success')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const primaryName = formData.name_en || formData.name_id || formData.name
    if (!primaryName?.trim()) {
      showToast('Category name is required', 'error')
      return
    }

    const payload = {
      ...formData,
      name: primaryName,
      name_id: formData.name_id || primaryName,
      name_en: formData.name_en || primaryName,
      subtitle: formData.subtitle || formData.subtitle_en || formData.subtitle_id || '',
      subtitle_id: formData.subtitle_id || formData.subtitle || '',
      subtitle_en: formData.subtitle_en || formData.subtitle || '',
      description: formData.description || formData.description_en || formData.description_id || '',
      description_id: formData.description_id || formData.description || '',
      description_en: formData.description_en || formData.description || '',
      slug: formData.slug || primaryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      display_order: Number(formData.display_order) || 1,
      status: formData.status || 'published'
    }

    setSaving(true)
    let success = false

    if (editingCat) {
      success = await updateCategory(editingCat.id, payload)
    } else {
      success = await createCategory(payload as any)
    }

    setSaving(false)

    if (success) {
      showToast(
        editingCat ? 'Category updated successfully' : 'New category created successfully',
        'success'
      )
      setModalOpen(false)
    } else {
      showToast('Failed to save category', 'error')
    }
  }

  const confirmDelete = async () => {
    if (!catToDelete) return
    setSaving(true)
    const success = await deleteCategory(catToDelete.id)
    setSaving(false)
    setDeleteModalOpen(false)
    setCatToDelete(null)

    if (success) {
      showToast('Category deleted', 'success')
    } else {
      showToast('Failed to delete category', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Portfolio Categories</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage showcase chapters on the public website. Each category becomes a dedicated full-screen section.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading && categories.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            <span className="text-xs text-slate-500">Loading categories...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No categories created yet.</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create your first category (e.g. Web Development, Graphic Design) to start building full-screen showcase chapters.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Category</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 w-16 text-center">Order</th>
                  <th className="py-3 px-4">Category Name & Subtitle</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4 text-center">Projects</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {categories.map((cat, idx) => {
                  const projectCount = allProjects.filter(
                    (p) => String(p.category_id) === String(cat.id)
                  ).length

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Order & Reorder arrows */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-mono font-bold text-slate-600">
                            {cat.display_order}
                          </span>
                          <div className="flex flex-col gap-0.5 ml-1">
                            <button
                              type="button"
                              onClick={() => handleMoveOrder(idx, 'up')}
                              disabled={idx === 0}
                              className="text-slate-400 hover:text-slate-800 disabled:opacity-20"
                              title="Move up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveOrder(idx, 'down')}
                              disabled={idx === categories.length - 1}
                              className="text-slate-400 hover:text-slate-800 disabled:opacity-20"
                              title="Move down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Category Name & Subtitle */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{cat.name}</div>
                        {cat.subtitle && (
                          <div className="text-[11px] text-slate-500 font-medium">
                            {cat.subtitle}
                          </div>
                        )}
                        {cat.description && (
                          <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {cat.description}
                          </div>
                        )}
                      </td>

                      {/* Slug */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        #{cat.slug || cat.id}
                      </td>

                      {/* Projects Count */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 font-semibold text-slate-700 text-[11px]">
                          {projectCount}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cat)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                            cat.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {cat.status === 'published' ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-600" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-amber-600" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(cat)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Category"
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

      {/* ADD / EDIT CATEGORY MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingCat ? 'Edit Category' : 'Create New Category Chapter'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Category Name ID & EN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Category Name (ID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name_id"
                    value={formData.name_id || ''}
                    onChange={handleInputChange}
                    placeholder="misal: Pengembangan Web"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Category Name (EN) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name_en"
                    value={formData.name_en || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Web Development"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Subtitle ID & EN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Subtitle (ID)
                  </label>
                  <input
                    type="text"
                    name="subtitle_id"
                    value={formData.subtitle_id || ''}
                    onChange={handleInputChange}
                    placeholder="misal: Situs Web & Pengalaman Digital"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Subtitle (EN)
                  </label>
                  <input
                    type="text"
                    name="subtitle_en"
                    value={formData.subtitle_en || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Websites & Digital Experiences"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  URL-Safe Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug || ''}
                  onChange={handleInputChange}
                  placeholder="web-development"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              {/* Chapter Description ID & EN */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Deskripsi Kategori (ID)
                  </label>
                  <textarea
                    name="description_id"
                    value={formData.description_id || ''}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Ringkasan pengantar karya dalam kategori ini..."
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Category Description (EN)
                  </label>
                  <textarea
                    name="description_en"
                    value={formData.description_en || ''}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Brief summary introducing the work in this category..."
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Display Order</label>
                  <input
                    type="number"
                    name="display_order"
                    value={formData.display_order ?? 1}
                    onChange={handleInputChange}
                    min={1}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Status</label>
                  <select
                    name="status"
                    value={formData.status || 'published'}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-sky-500 hover:bg-sky-400 rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCat ? 'Update Category' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteModalOpen && catToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Category?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-800">"{catToDelete.name}"</strong>? This will remove the category chapter from your public portfolio.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={saving}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
