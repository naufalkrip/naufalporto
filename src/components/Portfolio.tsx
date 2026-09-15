import React, { useState, useMemo } from 'react'
import { FolderOpen, RefreshCw, AlertCircle } from 'lucide-react'
import { PortfolioCard } from './PortfolioCard'
import type { PortfolioItem } from '../types'

interface PortfolioSectionProps {
  items: PortfolioItem[]
  loading: boolean
  error: string | null
  onRetry: () => void
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  items,
  loading,
  error,
  onRetry
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>()
    items.forEach((item) => {
      if (item.category && item.category.trim()) {
        set.add(item.category.trim())
      }
    })
    return ['All', ...Array.from(set)]
  }, [items])

  // Filter items
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return items
    return items.filter((item) => item.category === selectedCategory)
  }, [items, selectedCategory])

  return (
    <section id="works" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-2">
              <span className="w-4 h-[2px] bg-[var(--accent)]"></span>
              Selected Works
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Featured projects & explorations
            </h2>
          </div>

          {/* Category Filter Pills */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'bg-[var(--primary)] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && items.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-4 space-y-4"
              >
                <div className="aspect-[16/10] w-full rounded-xl skeleton-shimmer"></div>
                <div className="h-6 w-3/4 rounded-md skeleton-shimmer"></div>
                <div className="h-4 w-full rounded-md skeleton-shimmer"></div>
                <div className="h-4 w-2/3 rounded-md skeleton-shimmer"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && items.length === 0 && (
          <div className="p-8 rounded-2xl bg-white border border-rose-200 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-700">Unable to load portfolio. Please try again.</p>
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300 max-w-lg mx-auto p-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No works yet.</h3>
            <p className="text-xs text-slate-500">
              There are no projects published in this category yet.
            </p>
          </div>
        )}

        {/* Portfolio Cards Grid */}
        {filteredItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <PortfolioCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
