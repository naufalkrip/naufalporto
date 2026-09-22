import React, { useState, useEffect, useMemo } from 'react'
import { CategorySection } from './CategorySection'
import { ProjectDetailModal } from './ProjectDetailModal'
import type { PortfolioCategory, PortfolioItem } from '../types'
import { Sparkles, Layers } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { getLocalized } from '../i18n/translations'

interface WorksShowcaseProps {
  categories: PortfolioCategory[]
  portfolioItems: PortfolioItem[]
  loading: boolean
  hideEmptyCategories?: boolean
}

export const WorksShowcase: React.FC<WorksShowcaseProps> = ({
  categories,
  portfolioItems,
  loading,
  hideEmptyCategories = false
}) => {
  const { language, t } = useLanguage()

  // Selected project for creative case study lightbox
  const [selectedProject, setSelectedProject] = useState<PortfolioItem | null>(null)
  const [activeCategoryForProject, setActiveCategoryForProject] = useState<PortfolioCategory | null>(null)
  const [activeCategoryProjects, setActiveCategoryProjects] = useState<PortfolioItem[]>([])

  // Robust category matching: matches by ID, slug, or name (case-insensitive)
  const isItemInCategory = (item: PortfolioItem, cat: PortfolioCategory): boolean => {
    const itemCatId = String(item.category_id || '').trim().toLowerCase()
    const itemCatName = String(item.category || '').trim().toLowerCase()
    const catId = String(cat.id || '').trim().toLowerCase()
    const catName = String(cat.name || '').trim().toLowerCase()
    const catSlug = String(cat.slug || '').trim().toLowerCase()
    const catNameId = String(cat.name_id || '').trim().toLowerCase()
    const catNameEn = String(cat.name_en || '').trim().toLowerCase()

    if (itemCatId && (itemCatId === catId || itemCatId === catSlug || itemCatId === catName)) {
      return true
    }

    if (
      itemCatName &&
      (itemCatName === catName ||
        itemCatName === catSlug ||
        itemCatName === catId ||
        itemCatName === catNameId ||
        itemCatName === catNameEn)
    ) {
      return true
    }

    return false
  }

  // Filter published categories and sort by display_order
  const displayCategories = useMemo(() => {
    let list = categories.filter((c) => (c.status || 'published') === 'published')
    list.sort((a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99))

    if (hideEmptyCategories) {
      list = list.filter((cat) => {
        return portfolioItems.some((item) => isItemInCategory(item, cat))
      })
    }

    // Check if there are published projects that don't match any existing category in list
    const unmappedItems = portfolioItems.filter(
      (item) => !list.some((cat) => isItemInCategory(item, cat))
    )

    if (unmappedItems.length > 0) {
      // Group unmapped projects so NO inputted project is ever hidden
      const unmappedGroups: Record<string, PortfolioItem[]> = {}
      unmappedItems.forEach((item) => {
        const groupName = item.category || 'Featured Projects'
        if (!unmappedGroups[groupName]) unmappedGroups[groupName] = []
        unmappedGroups[groupName].push(item)
      })

      Object.entries(unmappedGroups).forEach(([groupName, _groupItems], idx) => {
        const syntheticId = 'cat_extra_' + idx
        list.push({
          id: syntheticId,
          name: groupName,
          name_id: groupName,
          name_en: groupName,
          slug: groupName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          subtitle: 'Selected Works & Creations',
          subtitle_id: 'Karya dan Kreasi Terpilih',
          subtitle_en: 'Selected Works & Creations',
          description: `Curated showcase of projects in ${groupName}.`,
          display_order: 900 + idx,
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      })
    }

    return list
  }, [categories, portfolioItems, hideEmptyCategories])

  // Group portfolio items by category
  const itemsByCategory = useMemo(() => {
    const map: Record<string, PortfolioItem[]> = {}
    displayCategories.forEach((cat) => {
      map[cat.id] = portfolioItems.filter((item) => isItemInCategory(item, cat))
    })
    return map
  }, [displayCategories, portfolioItems])

  // Track active category based on scroll position
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0)

  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const indexAttr = entry.target.getAttribute('data-category-index')
          if (indexAttr !== null) {
            setActiveCategoryIndex(Number(indexAttr))
          }
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '-30% 0px -40% 0px',
      threshold: 0.1
    })

    const categoryElements = document.querySelectorAll('[data-category-index]')
    categoryElements.forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
    }
  }, [displayCategories])

  const scrollToCategory = (cat: PortfolioCategory) => {
    const targetId = `category-${cat.slug || cat.id}`
    const elem = document.getElementById(targetId)
    if (elem) {
      const navOffset = 90
      const elementPosition = elem.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - navOffset
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  if (loading && displayCategories.length === 0) {
    return (
      <section id="works-showcase" className="py-24 min-h-[50vh] flex items-center justify-center bg-[#f8f8fa]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#6c4df6] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            {t('worksLoading')}
          </span>
        </div>
      </section>
    )
  }

  if (displayCategories.length === 0) {
    return (
      <section id="works-showcase" className="py-20 min-h-[40vh] flex items-center justify-center bg-[#f8f8fa]">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200/80 max-w-md shadow-sm">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">{t('worksEmpty')}</h3>
        </div>
      </section>
    )
  }

  return (
    <div id="works-showcase" className="relative bg-[#f8f8fa]">
      {/* QUICK JUMP CATEGORY BAR */}
      <div className="sticky top-[60px] z-30 bg-[#f8f8fa]/90 backdrop-blur-md border-y border-slate-200/60 py-2.5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#ec4899]" />
            <span>{t('worksChapters')}</span>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-2 overflow-x-auto py-0.5 scrollbar-none">
            {displayCategories.map((cat, idx) => {
              const catName = getLocalized(cat, 'name', language) || cat.name
              const isActive = idx === activeCategoryIndex
              const num = String(idx + 1).padStart(2, '0')
              return (
                <button
                  key={cat.id}
                  onClick={() => scrollToCategory(cat)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 font-medium'
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-70">{num}</span>
                  <span>{catName}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* DYNAMIC FULL-SCREEN CHAPTER SECTIONS */}
      {displayCategories.map((cat, idx) => {
        const catItems = itemsByCategory[cat.id] || []
        return (
          <CategorySection
            key={cat.id}
            category={cat}
            index={idx}
            totalCategories={displayCategories.length}
            items={catItems}
            isLast={idx === displayCategories.length - 1}
            onSelectProject={(item, category, categoryItems) => {
              setSelectedProject(item)
              setActiveCategoryForProject(category)
              setActiveCategoryProjects(categoryItems)
            }}
          />
        )
      })}

      {/* CREATIVE CASE STUDY / PROJECT DETAIL LIGHTBOX */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          categoryProjects={activeCategoryProjects}
          categoryName={
            activeCategoryForProject
              ? getLocalized(activeCategoryForProject, 'name', language) || activeCategoryForProject.name
              : selectedProject.category || ''
          }
          onClose={() => setSelectedProject(null)}
          onSelectProject={(nextOrPrevProj) => {
            setSelectedProject(nextOrPrevProj)
          }}
        />
      )}

      {/* SLEEK FLOATING VERTICAL SCROLL INDICATOR (DESKTOP) */}
      {displayCategories.length > 1 && (
        <aside
          aria-label="Chapter progress"
          className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-end gap-3 pointer-events-auto"
        >
          <div className="bg-white/90 backdrop-blur-md px-3.5 py-3 rounded-2xl shadow-lg border border-slate-200/90 flex flex-col items-center gap-2.5">
            {/* Number counter */}
            <span className="font-mono text-[11px] font-extrabold text-slate-800">
              {String(activeCategoryIndex + 1).padStart(2, '0')}
            </span>

            {/* Vertical Dots */}
            <div className="flex flex-col items-center gap-2 py-1">
              {displayCategories.map((cat, i) => {
                const isActive = i === activeCategoryIndex
                return (
                  <button
                    key={cat.id}
                    onClick={() => scrollToCategory(cat)}
                    aria-label={`Jump to ${cat.name}`}
                    className={`rounded-full transition-all duration-300 ${
                      isActive
                        ? 'w-2 h-5 bg-gradient-to-b from-[#6c4df6] to-[#ec4899] shadow-xs'
                        : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                )
              })}
            </div>

            {/* Total */}
            <span className="font-mono text-[10px] text-slate-400 font-semibold">
              {String(displayCategories.length).padStart(2, '0')}
            </span>
          </div>
        </aside>
      )}
    </div>
  )
}