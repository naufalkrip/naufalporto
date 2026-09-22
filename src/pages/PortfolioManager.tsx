import React, { useState, useRef } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  ExternalLink,
  X,
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
  Layers,
  Star,
  Film,
  Globe,
  ArrowUp,
  ArrowDown,
  Check
} from 'lucide-react'
import { usePortfolio } from '../hooks/usePortfolio'
import { useCategories } from '../hooks/useCategories'
import { usePortfolioMedia } from '../hooks/usePortfolioMedia'
import { usePortfolioLinks } from '../hooks/usePortfolioLinks'
import { DriveService } from '../services/drive'
import { useToast } from '../components/Toast'
import type { PortfolioItem, PortfolioMedia, PortfolioLink } from '../types'

export const PortfolioManager: React.FC = () => {
  const { items, loading, createItem, updateItem, deleteItem, setFeatured } = usePortfolio('all')
  const { categories } = useCategories('all')
  const { showToast } = useToast()

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'media' | 'links'>('info')

  const [formData, setFormData] = useState<Partial<PortfolioItem>>({
    title: '',
    title_id: '',
    title_en: '',
    category: '',
    category_id: '',
    description: '',
    description_id: '',
    description_en: '',
    year: new Date().getFullYear().toString(),
    project_url: '',
    cover_image: '',
    featured: false,
    status: 'published',
    display_order: 1
  })

  // Delete Confirm Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<PortfolioItem | null>(null)

  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)

  // Media & Links Sub-States (for editing item)
  const {
    media: projectMedia,
    addMedia,
    updateMedia,
    deleteMedia,
    reorderMedia
  } = usePortfolioMedia(editingItem?.id, 'all')

  const {
    links: projectLinks,
    addLink,
    deleteLink
  } = usePortfolioLinks(editingItem?.id, 'all')

  // Media Form State inside modal
  const [showMediaForm, setShowMediaForm] = useState(false)
  const [editingMedia, setEditingMedia] = useState<PortfolioMedia | null>(null)
  const [mediaFormData, setMediaFormData] = useState<Partial<PortfolioMedia>>({
    media_type: 'image',
    media_url: '',
    thumbnail_url: '',
    title_id: '',
    title_en: '',
    description_id: '',
    description_en: '',
    display_order: 1,
    status: 'published'
  })
  const [uploadingMediaFile, setUploadingMediaFile] = useState(false)
  const mediaFileInputRef = useRef<HTMLInputElement>(null)

  // Link Form State inside modal
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [linkFormData, setLinkFormData] = useState<Partial<PortfolioLink>>({
    label: '',
    label_id: '',
    label_en: '',
    url: '',
    icon: 'website',
    display_order: 1,
    status: 'published'
  })

  const openCreateModal = () => {
    setEditingItem(null)
    setActiveTab('info')
    const firstCat = categories.length > 0 ? categories[0] : null
    setFormData({
      title: '',
      title_id: '',
      title_en: '',
      category: firstCat ? firstCat.name : '',
      category_id: firstCat ? firstCat.id : '',
      description: '',
      description_id: '',
      description_en: '',
      year: new Date().getFullYear().toString(),
      project_url: '',
      cover_image: '',
      featured: false,
      status: 'published',
      display_order: items.length + 1
    })
    setModalOpen(true)
  }

  const openEditModal = (item: PortfolioItem, initialTab: 'info' | 'media' | 'links' = 'info') => {
    setEditingItem(item)
    setActiveTab(initialTab)
    setShowMediaForm(false)
    setShowLinkForm(false)
    const matchingCat = categories.find(c => c.id === item.category_id || c.name === item.category)
    setFormData({
      ...item,
      category: matchingCat ? matchingCat.name : (item.category || ''),
      category_id: matchingCat ? matchingCat.id : (item.category_id || ''),
      title_id: item.title_id || item.title || '',
      title_en: item.title_en || item.title || '',
      description_id: item.description_id || item.description || '',
      description_en: item.description_en || item.description || '',
      featured: Boolean(item.featured)
    })
    setModalOpen(true)
  }

  const openDeleteModal = (item: PortfolioItem) => {
    setItemToDelete(item)
    setDeleteModalOpen(true)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'display_order' ? Number(value) : value
      }))
    }
  }

  // Quick Status Toggle (Publish/Unpublish)
  const handleToggleStatus = async (item: PortfolioItem) => {
    const nextStatus = item.status === 'published' ? 'draft' : 'published'
    const success = await updateItem(item.id, { status: nextStatus })
    if (success) {
      showToast(`Project marked as ${nextStatus}`, 'success')
    } else {
      showToast('Failed to change status', 'error')
    }
  }

  // Quick Featured Toggle
  const handleToggleFeatured = async (item: PortfolioItem) => {
    if (!item.category_id) return
    const success = await setFeatured(item.category_id, item.id)
    if (success) {
      showToast(`"${item.title}" is now the featured project in this category`, 'success')
    } else {
      showToast('Failed to set featured project', 'error')
    }
  }

  // Handle Cover Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCover(true)
    try {
      const res = await DriveService.uploadFile(file, 'Portfolio')
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, cover_image: res.url }))
        showToast('Cover image uploaded', 'success')
      } else {
        showToast(res.message || 'Image upload failed', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Upload error', 'error')
    } finally {
      setUploadingCover(false)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }
  }

  // Handle Media File Upload (Inside modal)
  const handleMediaFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingMediaFile(true)
    try {
      const isVideo = file.type.startsWith('video/')
      const res = await DriveService.uploadFile(file, 'Portfolio')
      if (res.success && res.url) {
        setMediaFormData((prev) => ({
          ...prev,
          media_url: res.url,
          media_type: isVideo ? 'video' : 'image'
        }))
        showToast('Media file uploaded successfully', 'success')
      } else {
        showToast(res.message || 'Media upload failed', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Upload error', 'error')
    } finally {
      setUploadingMediaFile(false)
      if (mediaFileInputRef.current) mediaFileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const primaryTitle = formData.title_en || formData.title_id || formData.title
    const primaryDesc = formData.description_en || formData.description_id || formData.description

    // Resolve category and category_id consistently
    const selectedCat =
      categories.find((c) => c.id === formData.category_id) ||
      categories.find((c) => c.name === formData.category) ||
      categories[0]
    const primaryCategory = selectedCat ? selectedCat.name : (formData.category || 'General')
    const finalCategoryId = selectedCat ? selectedCat.id : (formData.category_id || 'cat_default')

    if (!primaryTitle?.trim() || !primaryDesc?.trim()) {
      showToast('Title and description are required fields.', 'error')
      return
    }

    const payload: Partial<PortfolioItem> = {
      ...formData,
      title: primaryTitle,
      title_id: formData.title_id || primaryTitle,
      title_en: formData.title_en || primaryTitle,
      description: primaryDesc,
      description_id: formData.description_id || primaryDesc,
      description_en: formData.description_en || primaryDesc,
      category: primaryCategory,
      category_id: finalCategoryId,
      year: formData.year || new Date().getFullYear().toString(),
      project_url: formData.project_url || '',
      cover_image: formData.cover_image || '',
      featured: Boolean(formData.featured),
      status: formData.status || 'published',
      display_order: Number(formData.display_order) || 1
    }

    setSaving(true)
    let success = false

    if (editingItem) {
      success = await updateItem(editingItem.id, payload)
    } else {
      success = await createItem(payload as any)
    }

    setSaving(false)

    if (success) {
      showToast(
        editingItem ? 'Portfolio item updated successfully' : 'New portfolio item created successfully',
        'success'
      )
      setModalOpen(false)
    } else {
      showToast('Action failed. Check server connection.', 'error')
    }
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    setSaving(true)
    const success = await deleteItem(itemToDelete.id)
    setSaving(false)
    setDeleteModalOpen(false)
    setItemToDelete(null)

    if (success) {
      showToast('Portfolio item deleted permanently', 'success')
    } else {
      showToast('Failed to delete item', 'error')
    }
  }

  // --- Project Media Handlers ---
  const handleSaveMedia = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return
    if (!mediaFormData.media_url?.trim()) {
      showToast('Media URL or uploaded file is required', 'error')
      return
    }

    const title = mediaFormData.title_en || mediaFormData.title_id || mediaFormData.title || ''
    const desc = mediaFormData.description_en || mediaFormData.description_id || mediaFormData.description || ''

    const payload: Partial<PortfolioMedia> = {
      ...mediaFormData,
      portfolio_id: editingItem.id,
      title,
      title_id: mediaFormData.title_id || title,
      title_en: mediaFormData.title_en || title,
      description: desc,
      description_id: mediaFormData.description_id || desc,
      description_en: mediaFormData.description_en || desc,
      display_order: Number(mediaFormData.display_order) || projectMedia.length + 1,
      status: mediaFormData.status || 'published'
    }

    let ok = false
    if (editingMedia) {
      ok = await updateMedia(editingMedia.id, payload)
      if (ok) showToast('Media updated successfully', 'success')
    } else {
      ok = await addMedia(payload)
      if (ok) showToast('Media added to project', 'success')
    }

    if (ok) {
      setShowMediaForm(false)
      setEditingMedia(null)
      setMediaFormData({
        media_type: 'image',
        media_url: '',
        thumbnail_url: '',
        title_id: '',
        title_en: '',
        description_id: '',
        description_en: '',
        display_order: projectMedia.length + 2,
        status: 'published'
      })
    } else {
      showToast('Failed to save media', 'error')
    }
  }

  const handleSetMediaAsCover = async (m: PortfolioMedia) => {
    if (!editingItem) return
    const ok = await updateItem(editingItem.id, { cover_image: m.media_url })
    if (ok) {
      setFormData((prev) => ({ ...prev, cover_image: m.media_url }))
      showToast('Project cover image updated from media item', 'success')
    } else {
      showToast('Failed to update project cover image', 'error')
    }
  }

  const handleMoveMediaOrder = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === projectMedia.length - 1)
    ) {
      return
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const copy = [...projectMedia]
    const current = copy[index]
    const target = copy[targetIndex]

    const temp = current.display_order
    current.display_order = target.display_order
    target.display_order = temp

    const orderMap = [
      { id: current.id, order: current.display_order },
      { id: target.id, order: target.display_order }
    ]

    const ok = await reorderMedia(orderMap)
    if (ok) showToast('Media order updated', 'success')
  }

  // --- Reference Links Handlers ---
  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return
    if (!linkFormData.url?.trim()) {
      showToast('Link URL is required', 'error')
      return
    }

    const label = linkFormData.label_en || linkFormData.label_id || linkFormData.label || 'Visit Link'

    const payload: Partial<PortfolioLink> = {
      ...linkFormData,
      portfolio_id: editingItem.id,
      label,
      label_id: linkFormData.label_id || label,
      label_en: linkFormData.label_en || label,
      display_order: Number(linkFormData.display_order) || projectLinks.length + 1,
      status: linkFormData.status || 'published'
    }

    const ok = await addLink(payload)
    if (ok) {
      showToast('Reference link added', 'success')
      setShowLinkForm(false)
      setLinkFormData({
        label: '',
        label_id: '',
        label_en: '',
        url: '',
        icon: 'website',
        display_order: projectLinks.length + 2,
        status: 'published'
      })
    } else {
      showToast('Failed to add reference link', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Portfolio Manager</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage multi-work projects, creative media galleries (images & videos), and reference links.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading && items.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            <span className="text-xs text-slate-500">Loading portfolio database...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No portfolio items found.</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your works database is currently empty. Get started by adding your first project.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Project</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 w-10 text-center">#</th>
                  <th className="py-3 px-4 w-20">Cover</th>
                  <th className="py-3 px-4">Project Title & Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Works Inside</th>
                  <th className="py-3 px-4 text-center">Featured</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {items.map((item) => {
                  const mediaCount = item.media_count || (item.media ? item.media.length : 1)
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Order */}
                      <td className="py-3 px-4 text-center text-slate-400 font-mono font-medium">
                        {item.display_order}
                      </td>

                      {/* Cover Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="w-14 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          {item.cover_image ? (
                            <img
                              src={item.cover_image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-[9px]">
                              No Cover
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Title & Description */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{item.title}</span>
                          {item.project_url && (
                            <a
                              href={item.project_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-sky-600"
                              title="Open link"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {item.category}
                        </span>
                      </td>

                      {/* Works Inside / Media Count Button */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => openEditModal(item, 'media')}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors"
                          title="Manage Project Media"
                        >
                          <Layers className="w-3 h-3 text-sky-600" />
                          <span>{mediaCount} works</span>
                        </button>
                      </td>

                      {/* Featured Star Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(item)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            item.featured
                              ? 'text-amber-500 hover:text-amber-600 bg-amber-50'
                              : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                          }`}
                          title={item.featured ? 'Featured Project' : 'Set as Featured Project'}
                        >
                          <Star className={`w-4 h-4 ${item.featured ? 'fill-amber-400' : ''}`} />
                        </button>
                      </td>

                      {/* Status Pill Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                            item.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                          }`}
                          title="Click to toggle status"
                        >
                          {item.status === 'published' ? (
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
                            onClick={() => openEditModal(item, 'media')}
                            className="p-1.5 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                            title="Manage Project Media"
                          >
                            <Layers className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(item, 'info')}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Edit Project"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(item)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Project"
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

      {/* ADD / EDIT MODAL WITH TABS */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full shadow-2xl overflow-hidden my-6">
            {/* Modal Header & Tabs */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingItem ? `Edit: ${editingItem.title}` : 'Create New Portfolio Project'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure project details, multiple gallery media, and reference links.
                  </p>
                </div>

                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-100 -mb-6 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('info')}
                  className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === 'info'
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Project Information</span>
                </button>

                {editingItem && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveTab('media')}
                      className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                        activeTab === 'media'
                          ? 'border-sky-500 text-sky-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Project Media ({projectMedia.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('links')}
                      className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                        activeTab === 'links'
                          ? 'border-sky-500 text-sky-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Reference Links ({projectLinks.length})</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* TAB 1: PROJECT INFORMATION FORM */}
            {activeTab === 'info' && (
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title ID & EN */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Judul Proyek (ID) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title_id"
                      value={formData.title_id || ''}
                      onChange={handleInputChange}
                      placeholder="misal: Website MB Chondro"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Project Title (EN) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title_en"
                      value={formData.title_en || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. Website MB Chondro"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    {categories.length > 0 ? (
                      <select
                        name="category_id"
                        value={
                          formData.category_id ||
                          categories.find((c) => c.name === formData.category)?.id ||
                          categories[0]?.id ||
                          ''
                        }
                        onChange={(e) => {
                          const selectedCat = categories.find((c) => c.id === e.target.value)
                          setFormData((prev) => ({
                            ...prev,
                            category_id: e.target.value,
                            category: selectedCat ? selectedCat.name : prev.category
                          }))
                        }}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} {cat.name_id && cat.name_id !== cat.name ? `(${cat.name_id})` : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="category"
                        value={formData.category || ''}
                        onChange={handleInputChange}
                        placeholder="e.g. Web Development"
                        required
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Release Year
                    </label>
                    <input
                      type="text"
                      name="year"
                      value={formData.year || ''}
                      onChange={handleInputChange}
                      placeholder="2026"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Description ID & EN */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Deskripsi Proyek (ID) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      name="description_id"
                      value={formData.description_id || ''}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Ringkasan penjelasan proyek dalam Bahasa Indonesia..."
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Project Description (EN) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      name="description_en"
                      value={formData.description_en || ''}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Concise overview of project objectives in English..."
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Primary Demo / Project URL */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Primary Project Demo URL
                    </label>
                    <input
                      type="url"
                      name="project_url"
                      value={formData.project_url || ''}
                      onChange={handleInputChange}
                      placeholder="https://example.com/project"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Cover Image Upload + Preview */}
                  <div className="space-y-2 sm:col-span-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700">Cover Image</label>
                      <span className="text-[10px] text-slate-400">
                        Shown on category showcase cards and previews
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-24 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        {formData.cover_image ? (
                          <img
                            src={formData.cover_image}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                            Preview
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <input
                          type="file"
                          ref={coverInputRef}
                          onChange={handleCoverUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => coverInputRef.current?.click()}
                            disabled={uploadingCover}
                            className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                          >
                            <Upload className="w-3 h-3" />
                            <span>{uploadingCover ? 'Uploading...' : 'Upload Cover'}</span>
                          </button>
                        </div>
                        <input
                          type="url"
                          name="cover_image"
                          value={formData.cover_image || ''}
                          onChange={handleInputChange}
                          placeholder="Or paste external cover image URL..."
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Featured Project Checkbox */}
                  <div className="sm:col-span-2 pt-2">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={Boolean(formData.featured)}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800">
                          Set as Featured Project in this Category
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Featured projects get prominent, large showcase treatment on the public page.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Status & Display Order */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Publication Status</label>
                    <select
                      name="status"
                      value={formData.status || 'published'}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
                    >
                      <option value="published">Published (Visible)</option>
                      <option value="draft">Draft (Hidden)</option>
                    </select>
                  </div>

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
                </div>

                {/* Submit button bar */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
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
                    className="inline-flex items-center gap-2 px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    <span>{saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Project'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: PROJECT MEDIA MANAGER */}
            {activeTab === 'media' && editingItem && (
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Project Gallery Media</h4>
                    <p className="text-xs text-slate-500">
                      Add images (screenshots, high-res designs) or HTML5 demo videos for this project.
                    </p>
                  </div>

                  {!showMediaForm && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMedia(null)
                        setMediaFormData({
                          media_type: 'image',
                          media_url: '',
                          thumbnail_url: '',
                          title_id: '',
                          title_en: '',
                          description_id: '',
                          description_en: '',
                          display_order: projectMedia.length + 1,
                          status: 'published'
                        })
                        setShowMediaForm(true)
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Media</span>
                    </button>
                  )}
                </div>

                {/* Form to Add/Edit Media */}
                {showMediaForm && (
                  <form
                    onSubmit={handleSaveMedia}
                    className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-scale-up"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800">
                        {editingMedia ? 'Edit Media Item' : 'Add New Media Item'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowMediaForm(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Media Type Selector */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Media Type</label>
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                          <input
                            type="radio"
                            name="media_type"
                            value="image"
                            checked={mediaFormData.media_type === 'image'}
                            onChange={() => setMediaFormData((prev) => ({ ...prev, media_type: 'image' }))}
                            className="text-sky-600"
                          />
                          <span className="inline-flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-sky-500" />
                            <span>Image (JPG, PNG, WEBP)</span>
                          </span>
                        </label>

                        <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                          <input
                            type="radio"
                            name="media_type"
                            value="video"
                            checked={mediaFormData.media_type === 'video'}
                            onChange={() => setMediaFormData((prev) => ({ ...prev, media_type: 'video' }))}
                            className="text-rose-600"
                          />
                          <span className="inline-flex items-center gap-1">
                            <Film className="w-3.5 h-3.5 text-rose-500" />
                            <span>Video (MP4, WebM)</span>
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* File Upload & URL */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Media Source <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          ref={mediaFileInputRef}
                          onChange={handleMediaFileUpload}
                          accept={mediaFormData.media_type === 'video' ? 'video/*' : 'image/*'}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => mediaFileInputRef.current?.click()}
                          disabled={uploadingMediaFile}
                          className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5 shrink-0"
                        >
                          <Upload className="w-3 h-3" />
                          <span>{uploadingMediaFile ? 'Uploading...' : 'Upload File'}</span>
                        </button>
                        <input
                          type="url"
                          value={mediaFormData.media_url || ''}
                          onChange={(e) => setMediaFormData((prev) => ({ ...prev, media_url: e.target.value }))}
                          placeholder="https://... or click Upload"
                          required
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    {/* Titles ID & EN */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Judul Media (ID)
                        </label>
                        <input
                          type="text"
                          value={mediaFormData.title_id || ''}
                          onChange={(e) => setMediaFormData((prev) => ({ ...prev, title_id: e.target.value }))}
                          placeholder="misal: 01 — Screenshot Homepage"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Media Title (EN)
                        </label>
                        <input
                          type="text"
                          value={mediaFormData.title_en || ''}
                          onChange={(e) => setMediaFormData((prev) => ({ ...prev, title_en: e.target.value }))}
                          placeholder="e.g. 01 — Screenshot Homepage"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    {/* Descriptions ID & EN */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Deskripsi Media (ID)
                        </label>
                        <textarea
                          rows={2}
                          value={mediaFormData.description_id || ''}
                          onChange={(e) => setMediaFormData((prev) => ({ ...prev, description_id: e.target.value }))}
                          placeholder="Deskripsi singkat karya ini..."
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Media Description (EN)
                        </label>
                        <textarea
                          rows={2}
                          value={mediaFormData.description_en || ''}
                          onChange={(e) => setMediaFormData((prev) => ({ ...prev, description_en: e.target.value }))}
                          placeholder="Brief description of this piece..."
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    {/* Display order and status */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Display Order</label>
                        <input
                          type="number"
                          value={mediaFormData.display_order ?? 1}
                          onChange={(e) => setMediaFormData((prev) => ({ ...prev, display_order: Number(e.target.value) }))}
                          min={1}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Status</label>
                        <select
                          value={mediaFormData.status || 'published'}
                          onChange={(e) => setMediaFormData((prev) => ({ ...prev, status: e.target.value as any }))}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-sky-500"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowMediaForm(false)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-sky-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-sky-400"
                      >
                        Save Media Item
                      </button>
                    </div>
                  </form>
                )}

                {/* Media Items Table */}
                {projectMedia.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <Layers className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-medium text-slate-600">
                      No media added to this project yet.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Add screenshots, mockups, or video walkthroughs to create an interactive case study.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                          <th className="py-2.5 px-3 w-12 text-center">#</th>
                          <th className="py-2.5 px-3 w-20">Preview</th>
                          <th className="py-2.5 px-3">Title / Type</th>
                          <th className="py-2.5 px-3 text-center">Cover</th>
                          <th className="py-2.5 px-3 text-center">Reorder</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {projectMedia.map((m, idx) => {
                          const isCover = formData.cover_image === m.media_url
                          return (
                            <tr key={m.id} className="hover:bg-slate-50/70">
                              <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                                {m.display_order || idx + 1}
                              </td>

                              <td className="py-2.5 px-3">
                                <div className="w-14 h-10 rounded-lg bg-slate-950 border border-slate-200 overflow-hidden flex items-center justify-center">
                                  {m.media_type === 'video' ? (
                                    <Film className="w-4 h-4 text-sky-400" />
                                  ) : (
                                    <img src={m.media_url} alt="" className="w-full h-full object-cover" />
                                  )}
                                </div>
                              </td>

                              <td className="py-2.5 px-3">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{m.title || 'Untitled Media'}</span>
                                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                                    m.media_type === 'video' ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700'
                                  }`}>
                                    {m.media_type}
                                  </span>
                                </div>
                                {m.description && (
                                  <p className="text-[10px] text-slate-400 line-clamp-1">{m.description}</p>
                                )}
                              </td>

                              {/* Set as Cover action */}
                              <td className="py-2.5 px-3 text-center">
                                {isCover ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    <Check className="w-2.5 h-2.5" />
                                    <span>Cover</span>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleSetMediaAsCover(m)}
                                    className="px-2 py-0.5 rounded-lg text-[10px] font-semibold text-slate-500 hover:text-sky-600 hover:bg-sky-50 border border-slate-200"
                                  >
                                    Set as Cover
                                  </button>
                                )}
                              </td>

                              {/* Reorder Buttons */}
                              <td className="py-2.5 px-3 text-center">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveMediaOrder(idx, 'up')}
                                    disabled={idx === 0}
                                    className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveMediaOrder(idx, 'down')}
                                    disabled={idx === projectMedia.length - 1}
                                    className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>

                              {/* Edit & Delete */}
                              <td className="py-2.5 px-3 text-right">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingMedia(m)
                                      setMediaFormData({ ...m })
                                      setShowMediaForm(true)
                                    }}
                                    className="p-1 text-slate-400 hover:text-sky-600"
                                    title="Edit Media"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteMedia(m.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600"
                                    title="Delete Media"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
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
            )}

            {/* TAB 3: REFERENCE LINKS MANAGER */}
            {activeTab === 'links' && editingItem && (
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Project Reference Links</h4>
                    <p className="text-xs text-slate-500">
                      Add external destination links (Live Website, GitHub repo, Figma case study, Behance, etc.).
                    </p>
                  </div>

                  {!showLinkForm && (
                    <button
                      type="button"
                      onClick={() => {
                        setLinkFormData({
                          label: '',
                          label_id: '',
                          label_en: '',
                          url: '',
                          icon: 'website',
                          display_order: projectLinks.length + 1,
                          status: 'published'
                        })
                        setShowLinkForm(true)
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Reference Link</span>
                    </button>
                  )}
                </div>

                {/* Form to Add Reference Link */}
                {showLinkForm && (
                  <form
                    onSubmit={handleSaveLink}
                    className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-scale-up"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800">Add New Reference Link</span>
                      <button
                        type="button"
                        onClick={() => setShowLinkForm(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Label (ID)</label>
                        <input
                          type="text"
                          value={linkFormData.label_id || ''}
                          onChange={(e) => setLinkFormData((prev) => ({ ...prev, label_id: e.target.value }))}
                          placeholder="misal: Lihat Website Langsung"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Label (EN)</label>
                        <input
                          type="text"
                          value={linkFormData.label_en || ''}
                          onChange={(e) => setLinkFormData((prev) => ({ ...prev, label_en: e.target.value }))}
                          placeholder="e.g. Live Website"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Destination URL <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="url"
                          value={linkFormData.url || ''}
                          onChange={(e) => setLinkFormData((prev) => ({ ...prev, url: e.target.value }))}
                          placeholder="https://..."
                          required
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Platform / Icon</label>
                        <select
                          value={linkFormData.icon || 'website'}
                          onChange={(e) => setLinkFormData((prev) => ({ ...prev, icon: e.target.value }))}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-sky-500"
                        >
                          <option value="website">Website / Generic Web</option>
                          <option value="github">GitHub</option>
                          <option value="figma">Figma</option>
                          <option value="behance">Behance</option>
                          <option value="dribbble">Dribbble</option>
                          <option value="youtube">YouTube</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowLinkForm(false)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-sky-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-sky-400"
                      >
                        Add Link
                      </button>
                    </div>
                  </form>
                )}

                {/* Reference Links Table */}
                {projectLinks.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <Globe className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-medium text-slate-600">
                      No custom reference links added yet.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      By default, the primary project demo URL will be shown if no links are added.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                          <th className="py-2.5 px-3">Label</th>
                          <th className="py-2.5 px-3">URL</th>
                          <th className="py-2.5 px-3 text-center">Icon</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {projectLinks.map((l) => (
                          <tr key={l.id} className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-3 font-bold text-slate-900">{l.label}</td>
                            <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] truncate max-w-xs">
                              {l.url}
                            </td>
                            <td className="py-2.5 px-3 text-center uppercase font-bold text-[10px] text-slate-500">
                              {l.icon || 'website'}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => deleteLink(l.id)}
                                className="p-1 text-slate-400 hover:text-rose-600"
                                title="Delete Link"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Portfolio Project?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900">"{itemToDelete.title}"</strong> and all its associated
              media works? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={saving}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{saving ? 'Deleting...' : 'Delete Project'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
