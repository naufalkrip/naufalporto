import React, { useState, useEffect, useCallback } from 'react'
import {
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Maximize2,
  Calendar,
  Layers,
  Globe,
  Film
} from 'lucide-react'
import type { PortfolioItem, PortfolioMedia, PortfolioLink } from '../types'
import { useLanguage } from '../context/LanguageContext'
import { getLocalized } from '../i18n/translations'
import { usePortfolioMedia } from '../hooks/usePortfolioMedia'
import { usePortfolioLinks } from '../hooks/usePortfolioLinks'

interface ProjectDetailModalProps {
  project: PortfolioItem | null
  categoryProjects?: PortfolioItem[]
  categoryName?: string
  onClose: () => void
  onSelectProject?: (project: PortfolioItem) => void
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  categoryProjects = [],
  categoryName = '',
  onClose,
  onSelectProject
}) => {
  const { language, t } = useLanguage()

  // Fetch media & links for this project
  const { media } = usePortfolioMedia(project?.id, 'published')
  const { links } = usePortfolioLinks(project?.id, 'published')

  const [activeMediaIndex, setActiveMediaIndex] = useState(0)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Reset active media when project changes
  useEffect(() => {
    setActiveMediaIndex(0)
    setFullscreenImage(null)
  }, [project?.id])

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [project])

  // Aggregate media items: use fetched media, or fallback to project cover image
  const displayMedia: PortfolioMedia[] =
    media.length > 0
      ? media
      : project?.cover_image
      ? [
          {
            id: 'fallback_cover',
            portfolio_id: project.id,
            media_type: 'image',
            media_url: project.cover_image,
            title: project.title,
            title_id: project.title_id || project.title,
            title_en: project.title_en || project.title,
            description: project.description,
            description_id: project.description_id || project.description,
            description_en: project.description_en || project.description,
            display_order: 1,
            status: 'published'
          }
        ]
      : []

  const totalMedia = displayMedia.length
  const currentMedia = displayMedia[activeMediaIndex] || displayMedia[0]

  // Media navigation handlers
  const handlePrevMedia = useCallback(() => {
    if (activeMediaIndex > 0) {
      setActiveMediaIndex((prev) => prev - 1)
    }
  }, [activeMediaIndex])

  const handleNextMedia = useCallback(() => {
    if (activeMediaIndex < totalMedia - 1) {
      setActiveMediaIndex((prev) => prev + 1)
    }
  }, [activeMediaIndex, totalMedia])

  // Adjacent project calculations within current category
  const currentProjectIndex = categoryProjects.findIndex((p) => p.id === project?.id)
  const prevProject = currentProjectIndex > 0 ? categoryProjects[currentProjectIndex - 1] : null
  const nextProject =
    currentProjectIndex !== -1 && currentProjectIndex < categoryProjects.length - 1
      ? categoryProjects[currentProjectIndex + 1]
      : null

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!project) return
      if (e.key === 'Escape') {
        if (fullscreenImage) {
          setFullscreenImage(null)
        } else {
          onClose()
        }
      } else if (e.key === 'ArrowLeft') {
        handlePrevMedia()
      } else if (e.key === 'ArrowRight') {
        handleNextMedia()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [project, fullscreenImage, onClose, handlePrevMedia, handleNextMedia])

  // Touch swipe handling for mobile
  const minSwipeDistance = 45
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      handleNextMedia()
    } else if (isRightSwipe) {
      handlePrevMedia()
    }
  }

  if (!project) return null

  const projectTitle = getLocalized(project, 'title', language) || project.title
  const projectDesc = getLocalized(project, 'description', language) || project.description

  const mediaTitle = currentMedia
    ? getLocalized(currentMedia, 'title', language) || currentMedia.title || ''
    : ''
  const mediaDesc = currentMedia
    ? getLocalized(currentMedia, 'description', language) || currentMedia.description || ''
    : ''

  // Fallback reference links if none in PORTFOLIO_LINKS
  const effectiveLinks: PortfolioLink[] =
    links.length > 0
      ? links
      : project.project_url
      ? [
          {
            id: 'legacy_url',
            portfolio_id: project.id,
            label: 'Live Experience',
            label_id: 'Lihat Proyek',
            label_en: 'Live Experience',
            url: project.project_url,
            icon: 'website',
            display_order: 1,
            status: 'published'
          }
        ]
      : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Modal Container */}
      <div
        className="relative z-10 w-full max-w-5xl bg-slate-900 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP HEADER */}
        <header className="px-6 py-5 sm:px-8 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-md sticky top-0 z-20">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-violet-600/30 to-sky-600/30 border border-violet-500/30 text-sky-400">
                {categoryName || project.category || 'CASE STUDY'}
              </span>
              {project.year && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{project.year}</span>
                </span>
              )}
              {totalMedia > 1 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                  <Layers className="w-3 h-3 text-sky-400" />
                  <span>
                    {totalMedia} {t('worksInsideProject')}
                  </span>
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white truncate">
              {projectTitle}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-2xl transition-all shrink-0 group border border-slate-700/50"
            title={t('caseStudyClose')}
          >
            <X className="w-5 h-5 transition-transform group-hover:rotate-90 duration-200" />
          </button>
        </header>

        {/* SCROLLABLE BODY */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
          {/* MEDIA VIEWER STAGE */}
          <section className="space-y-4">
            <div
              className="relative w-full rounded-2xl sm:rounded-3xl bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center min-h-[300px] sm:min-h-[420px] md:min-h-[500px] max-h-[65vh] group shadow-inner"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {currentMedia ? (
                currentMedia.media_type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center bg-black">
                    <video
                      key={currentMedia.id + currentMedia.media_url}
                      src={currentMedia.media_url}
                      poster={currentMedia.thumbnail_url || project.cover_image}
                      controls
                      preload="metadata"
                      playsInline
                      className="w-full max-h-[62vh] object-contain rounded-2xl"
                    >
                      <p className="text-xs text-slate-400 p-4">{t('caseStudyVideoFallback')}</p>
                    </video>
                  </div>
                ) : (
                  <div
                    className="relative w-full h-full flex items-center justify-center cursor-zoom-in"
                    onClick={() => setFullscreenImage(currentMedia.media_url)}
                  >
                    <img
                      src={currentMedia.media_url}
                      alt={mediaTitle || projectTitle}
                      className="w-full h-full max-h-[62vh] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.01]"
                    />
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[11px] font-medium text-white border border-slate-700">
                        <Maximize2 className="w-3 h-3" />
                        <span>{t('caseStudyFullscreen')}</span>
                      </span>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-slate-500 text-xs">No media loaded</div>
              )}

              {/* Media Floating Arrows (Desktop) */}
              {totalMedia > 1 && (
                <>
                  <button
                    onClick={handlePrevMedia}
                    disabled={activeMediaIndex === 0}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-slate-700/80 shadow-lg transition-all ${
                      activeMediaIndex === 0
                        ? 'opacity-20 cursor-not-allowed'
                        : 'opacity-80 hover:opacity-100 hover:scale-110 hover:bg-slate-800'
                    }`}
                    title="Previous media"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleNextMedia}
                    disabled={activeMediaIndex === totalMedia - 1}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-slate-700/80 shadow-lg transition-all ${
                      activeMediaIndex === totalMedia - 1
                        ? 'opacity-20 cursor-not-allowed'
                        : 'opacity-80 hover:opacity-100 hover:scale-110 hover:bg-slate-800'
                    }`}
                    title="Next media"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* MEDIA INFO & CONTROLLER BAR */}
            <div className="bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Counter & Media Titles */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs sm:text-sm font-bold text-sky-400 bg-sky-950/60 border border-sky-800/50 px-2.5 py-0.5 rounded-lg">
                    {String(activeMediaIndex + 1).padStart(2, '0')} /{' '}
                    {String(totalMedia).padStart(2, '0')}
                  </span>
                  {currentMedia?.media_type === 'video' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      <Film className="w-2.5 h-2.5" />
                      <span>VIDEO</span>
                    </span>
                  )}
                  {mediaTitle && (
                    <span className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                      {mediaTitle}
                    </span>
                  )}
                </div>

                {mediaDesc && (
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{mediaDesc}</p>
                )}
              </div>

              {/* Navigation Controls: PREVIOUS / NEXT */}
              {totalMedia > 1 && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handlePrevMedia}
                    disabled={activeMediaIndex === 0}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      activeMediaIndex === 0
                        ? 'border-slate-800 text-slate-600 cursor-not-allowed bg-transparent'
                        : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{t('caseStudyPrevMedia')}</span>
                  </button>

                  <button
                    onClick={handleNextMedia}
                    disabled={activeMediaIndex === totalMedia - 1}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      activeMediaIndex === totalMedia - 1
                        ? 'border-slate-800 text-slate-600 cursor-not-allowed bg-transparent'
                        : 'border-sky-500/40 bg-sky-600 text-white hover:bg-sky-500 shadow-md shadow-sky-600/20'
                    }`}
                  >
                    <span>{t('caseStudyNextMedia')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* THUMBNAIL STRIP */}
            {totalMedia > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                {displayMedia.map((m, idx) => {
                  const isActive = idx === activeMediaIndex
                  return (
                    <button
                      key={m.id || idx}
                      onClick={() => setActiveMediaIndex(idx)}
                      className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        isActive
                          ? 'border-sky-400 scale-105 shadow-md shadow-sky-500/20'
                          : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'
                      }`}
                    >
                      {m.media_type === 'video' ? (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-400">
                          <Film className="w-5 h-5 text-sky-400" />
                        </div>
                      ) : (
                        <img
                          src={m.media_url}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-950/80 text-white">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* PROJECT DESCRIPTION & REFERENCE LINKS */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
            {/* Project Overview */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('caseStudyOverview')}
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                {projectDesc}
              </p>
            </div>

            {/* Reference Links Card */}
            {effectiveLinks.length > 0 && (
              <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>{t('caseStudyReferences')}</span>
                </h4>

                <div className="flex flex-col gap-2">
                  {effectiveLinks.map((link) => {
                    const label = getLocalized(link, 'label', language) || link.label
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link inline-flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-850 text-xs font-bold text-white transition-all shadow-xs"
                      >
                        <span className="truncate group-hover/link:text-sky-300">{label}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover/link:text-sky-400 group-hover/link:translate-x-0.5 transition-transform" />
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* BOTTOM ADJACENT PROJECT NAVIGATION */}
        {(prevProject || nextProject) && (
          <footer className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
            <div>
              {prevProject && (
                <button
                  onClick={() => onSelectProject?.(prevProject)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  <div className="text-left hidden sm:block">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      {t('caseStudyPrevProject')}
                    </div>
                    <div className="font-extrabold text-slate-300 truncate max-w-[180px]">
                      {getLocalized(prevProject, 'title', language) || prevProject.title}
                    </div>
                  </div>
                  <span className="sm:hidden">{t('caseStudyPrevProject')}</span>
                </button>
              )}
            </div>

            <div>
              {nextProject && (
                <button
                  onClick={() => onSelectProject?.(nextProject)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors group"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      {t('caseStudyNextProject')}
                    </div>
                    <div className="font-extrabold text-slate-300 truncate max-w-[180px]">
                      {getLocalized(nextProject, 'title', language) || nextProject.title}
                    </div>
                  </div>
                  <span className="sm:hidden">{t('caseStudyNextProject')}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </footer>
        )}
      </div>

      {/* FULLSCREEN IMAGE OVERLAY */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 p-3 text-white/70 hover:text-white bg-white/10 rounded-full"
            title="Close Fullscreen"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={fullscreenImage}
            alt="Fullscreen view"
            className="max-w-full max-h-full object-contain rounded-xl"
          />
        </div>
      )}
    </div>
  )
}
