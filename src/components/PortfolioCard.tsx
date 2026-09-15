import React from 'react'
import { ArrowRight, Calendar, Layers } from 'lucide-react'
import type { PortfolioItem } from '../types'
import { useLanguage } from '../context/LanguageContext'
import { getLocalized } from '../i18n/translations'

interface PortfolioCardProps {
  item: PortfolioItem
  accentGradient?: string
  layoutVariant?: 'featured' | 'horizontal' | 'standard'
  categoryName?: string
  onSelect?: (item: PortfolioItem) => void
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  item,
  accentGradient = 'from-[#6c4df6] to-[#3b82f6]',
  layoutVariant = 'standard',
  categoryName,
  onSelect
}) => {
  const { language, t } = useLanguage()

  const title = getLocalized(item, 'title', language) || item.title
  const description = getLocalized(item, 'description', language) || item.description
  const worksCount = item.media_count || (item.media ? item.media.length : 1)

  const handleCardClick = () => {
    onSelect?.(item)
  }

  // If featured project layout (Large display)
  if (layoutVariant === 'featured') {
    return (
      <article
        onClick={handleCardClick}
        className="group relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col md:flex-row items-stretch cursor-pointer hover:border-violet-300"
      >
        {/* Large Image Preview */}
        <div className="md:w-3/5 relative min-h-[180px] sm:min-h-[280px] lg:min-h-[400px] overflow-hidden bg-slate-950">
          {item.cover_image ? (
            <img
              src={item.cover_image}
              alt={title}
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              {t('caseStudyPreviewUnavailable')}
            </div>
          )}

          {/* Hover Overlay with VIEW PROJECT → */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 sm:p-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full bg-white text-slate-950 font-bold text-xs shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <span>{t('worksViewProject')}</span>
              <ArrowRight className="w-4 h-4 text-[#6c4df6] group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

          {/* Year & Works Badges */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-1.5 sm:gap-2">
            {item.year && (
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-slate-950/80 backdrop-blur-md text-white shadow-xs border border-white/10">
                <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-400" />
                <span>{item.year}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-slate-950/80 backdrop-blur-md text-white shadow-xs border border-white/10">
              <Layers className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-violet-400" />
              <span>
                {worksCount} {t('worksInsideProject')}
              </span>
            </span>
          </div>
        </div>

        {/* Text Details */}
        <div className="md:w-2/5 p-4 sm:p-8 lg:p-10 flex flex-col justify-between space-y-3 sm:space-y-6 bg-white">
          <div className="space-y-2 sm:space-y-4">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-r ${accentGradient} animate-pulse`} />
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#6c4df6]">
                {t('worksFeatured')}
              </span>
              {categoryName && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {categoryName}
                  </span>
                </>
              )}
            </div>

            <h3 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 group-hover:text-[#6c4df6] transition-colors leading-tight">
              {title}
            </h3>

            <p className="text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed font-normal">
              {description}
            </p>
          </div>

          <div className="pt-3 sm:pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[10px] sm:text-xs font-semibold text-slate-500">
              {worksCount} {t('worksInsideProject')}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleCardClick()
              }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-slate-900 hover:bg-[#6c4df6] text-white font-bold text-[11px] sm:text-xs transition-colors shadow-xs group/btn"
            >
              <span>{t('worksViewProject')}</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </article>
    )
  }

  // Standard Card Variant (2-Column Grid friendly)
  return (
    <article
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full hover:-translate-y-1 cursor-pointer hover:border-violet-300"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] w-full bg-slate-950 overflow-hidden">
        {item.cover_image ? (
          <img
            src={item.cover_image}
            alt={title}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            {t('caseStudyPreviewUnavailable')}
          </div>
        )}

        {/* Hover overlay with VIEW PROJECT → */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 sm:p-6">
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white text-slate-950 font-bold text-[10px] sm:text-xs shadow-lg transform translate-y-1 sm:translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <span>{t('worksViewProject')}</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#6c4df6]" />
          </span>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex items-center gap-1 sm:gap-2">
          {item.year && (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold bg-slate-950/80 backdrop-blur-md text-white shadow-2xs border border-white/10">
              {item.year}
            </span>
          )}
          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold bg-slate-950/80 backdrop-blur-md text-sky-400 shadow-2xs border border-white/10 flex items-center gap-1">
            <Layers className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
            <span>{worksCount}</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-6 flex flex-col flex-1 justify-between space-y-2 sm:space-y-4 bg-white">
        <div className="space-y-1 sm:space-y-2">
          {categoryName && (
            <div className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
              {categoryName}
            </div>
          )}
          <h3 className="text-xs sm:text-lg lg:text-xl font-bold text-slate-900 group-hover:text-[#6c4df6] transition-colors leading-snug">
            {title}
          </h3>
          <p className="text-[11px] sm:text-sm text-slate-600 leading-relaxed font-normal">
            {description}
          </p>
        </div>

        <div className="pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate">
            {worksCount} {t('worksInsideProject')}
          </span>

          <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold text-slate-900 group-hover:text-[#6c4df6] transition-colors uppercase tracking-wider shrink-0">
            <span className="hidden sm:inline">{t('worksViewProject')}</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  )
}
