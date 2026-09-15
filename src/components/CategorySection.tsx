import React from 'react'
import { ArrowRight, FolderKanban } from 'lucide-react'
import { PortfolioCard } from './PortfolioCard'
import type { PortfolioCategory, PortfolioItem } from '../types'
import { useLanguage } from '../context/LanguageContext'
import { getLocalized } from '../i18n/translations'

interface CategorySectionProps {
  category: PortfolioCategory
  index: number
  totalCategories: number
  items: PortfolioItem[]
  isLast: boolean
  onSelectProject?: (item: PortfolioItem, category: PortfolioCategory, items: PortfolioItem[]) => void
}

// Visual theme configurations per chapter
const chapterColorThemes = [
  {
    gradient: 'from-[#6c4df6] to-[#3b82f6]',
    textGradientClass: 'gradient-text',
    glow: 'rgba(108, 77, 246, 0.12)',
    badgeBg: 'bg-[#6c4df6]/10 text-[#6c4df6] border-[#6c4df6]/20',
    dotColor: '#6c4df6'
  },
  {
    gradient: 'from-[#ec4899] to-[#8b5cf6]',
    textGradientClass: 'gradient-text-pink',
    glow: 'rgba(236, 72, 153, 0.12)',
    badgeBg: 'bg-[#ec4899]/10 text-[#ec4899] border-[#ec4899]/20',
    dotColor: '#ec4899'
  },
  {
    gradient: 'from-[#f97316] to-[#ec4899]',
    textGradientClass: 'gradient-text-orange',
    glow: 'rgba(249, 115, 22, 0.12)',
    badgeBg: 'bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20',
    dotColor: '#f97316'
  },
  {
    gradient: 'from-[#3b82f6] to-[#06b6d4]',
    textGradientClass: 'gradient-text',
    glow: 'rgba(6, 182, 212, 0.12)',
    badgeBg: 'bg-[#06b6d4]/10 text-[#06b6d4] border-[#06b6d4]/20',
    dotColor: '#06b6d4'
  }
]

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  index,
  totalCategories,
  items,
  isLast,
  onSelectProject
}) => {
  const { language, t } = useLanguage()
  const theme = chapterColorThemes[index % chapterColorThemes.length]
  const chapterNumber = String(index + 1).padStart(2, '0')

  const categoryName = getLocalized(category, 'name', language) || category.name
  const categorySubtitle = getLocalized(category, 'subtitle', language) || category.subtitle
  const categoryDesc = getLocalized(category, 'description', language) || category.description

  // Find featured item or use first
  const featuredItem = items.find((it) => it.featured) || items[0]
  const secondaryItems = items.filter((it) => it.id !== featuredItem?.id)

  const handleSelect = (item: PortfolioItem) => {
    onSelectProject?.(item, category, items)
  }

  return (
    <section
      id={`category-${category.slug || category.id}`}
      data-category-index={index}
      className="relative py-14 sm:py-18 flex flex-col justify-center bg-[#f8f8fa] border-t border-slate-200/60 overflow-hidden"
    >
      {/* Chapter Ambient Glow */}
      <div
        className="absolute top-1/4 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-40 -z-0"
        style={{
          background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`
        }}
      />
      <div
        className="absolute bottom-10 -left-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-30 -z-0"
        style={{
          background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`
        }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full relative z-10 space-y-8">
        {/* Chapter Header Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div className="space-y-2 max-w-2xl">
            {/* Chapter Pill Badge */}
            <div className="inline-flex items-center gap-2">
              <span className={`px-3 py-0.5 rounded-full text-xs font-mono font-bold border ${theme.badgeBg}`}>
                {t('worksChapterLabel')} {chapterNumber}
              </span>
              {totalCategories > 1 && (
                <span className="text-xs font-mono text-slate-400">
                  / {String(totalCategories).padStart(2, '0')}
                </span>
              )}
            </div>

            {/* Category Title */}
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              <span className={theme.textGradientClass}>{categoryName}</span>
            </h2>

            {/* Subtitle / Description */}
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              {categorySubtitle || categoryDesc || `Selected works and creative artifacts in ${categoryName}.`}
            </p>
          </div>

          {/* Quick Counter */}
          <div className="text-left md:text-right shrink-0">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">
              {t('worksCuratedCount')}
            </span>
            <span className="text-2xl font-black text-slate-800 font-mono">
              {String(items.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Project Presentation Layouts */}
        {items.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 p-12 max-w-xl mx-auto space-y-3 shadow-2xs">
            <FolderKanban className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              {t('worksEmpty')}
            </h3>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1. Featured Primary Work */}
            {featuredItem && (
              <PortfolioCard
                item={featuredItem}
                accentGradient={theme.gradient}
                layoutVariant="featured"
                categoryName={categoryName}
                onSelect={handleSelect}
              />
            )}

            {/* 2. Secondary Works: Alternating or Grid Layout */}
            {secondaryItems.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pt-2">
                {secondaryItems.map((item) => (
                  <PortfolioCard
                    key={item.id}
                    item={item}
                    accentGradient={theme.gradient}
                    layoutVariant="standard"
                    categoryName={categoryName}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom Chapter Navigator hint */}
        {!isLast && (
          <div className="pt-4 flex items-center justify-end">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-800 transition-colors">
              <span>{t('worksNextChapter')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}