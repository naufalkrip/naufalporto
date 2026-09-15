import React from 'react'
import { MapPin, Sparkles, Calendar, Building2 } from 'lucide-react'
import type { Experience } from '../types'
import { useLanguage } from '../context/LanguageContext'
import { getLocalized } from '../i18n/translations'

interface ExperienceTimelineProps {
  experiences: Experience[]
  loading?: boolean
}

export const ExperienceTimeline: React.FC<ExperienceTimelineProps> = ({
  experiences,
  loading = false
}) => {
  const { language, t } = useLanguage()

  // Filter and sort experiences
  const sortedExperiences = [...experiences]
    .filter((exp) => exp.status === 'published')
    .sort((a, b) => {
      const orderA = Number(a.display_order) || 99
      const orderB = Number(b.display_order) || 99
      if (orderA !== orderB) return orderA - orderB
      const yearA = Number(a.year_start) || 0
      const yearB = Number(b.year_start) || 0
      return yearB - yearA
    })

  if (loading && sortedExperiences.length === 0) {
    return (
      <section id="experience" className="py-20 bg-[#f8f8fa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-7 h-7 border-2 border-[#6c4df6] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {t('worksLoading')}
          </span>
        </div>
      </section>
    )
  }

  if (sortedExperiences.length === 0) {
    return null
  }

  return (
    <section
      id="experience"
      className="relative py-16 sm:py-20 bg-[#f8f8fa] border-t border-slate-200/60 overflow-hidden"
    >
      {/* Background Soft Accent Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/3 -right-28 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(249,115,22,0.3) 0%, rgba(236,72,153,0.15) 60%, transparent 100%)'
          }}
        />
        <div
          className="absolute bottom-10 -left-20 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(108,77,246,0.3) 0%, transparent 70%)'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200/80 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#f97316]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-700">
              {t('expBadge')}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {t('expHeadingPart1')}{' '}
            <span className="gradient-text-orange">{t('expHeadingPart2')}</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            {t('expSubtitle')}
          </p>
        </div>

        {/* TIMELINE CONTAINER */}
        <div className="relative max-w-5xl mx-auto">
          {/* Vertical Connecting Track Line */}
          {/* Desktop: Center track (left-1/2) | Mobile: Left track (left-6) */}
          <div className="absolute top-6 bottom-6 left-6 md:left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-[#6c4df6] via-[#ec4899] to-[#f97316] opacity-30" />

          <div className="space-y-10 sm:space-y-12">
            {sortedExperiences.map((exp, idx) => {
              const positionTitle = getLocalized(exp, 'position', language) || exp.position
              const descriptionText = getLocalized(exp, 'description', language) || exp.description
              const isEven = idx % 2 === 0
              const isCurrent = exp.is_current === true || String(exp.is_current).toUpperCase() === 'TRUE'

              return (
                <div
                  key={exp.id}
                  className="relative flex flex-col md:flex-row items-start md:items-center group"
                >
                  {/* Milestones Dot on Track */}
                  <div
                    className="absolute left-6 md:left-1/2 -translate-x-1/2 z-20 flex items-center justify-center"
                  >
                    {isCurrent ? (
                      <div className="relative flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ec4899] to-[#f97316] p-[2px] shadow-[0_0_15px_rgba(236,72,153,0.45)] animate-pulse">
                          <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899]" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-white border-2 border-[#6c4df6] p-0.5 shadow-xs group-hover:scale-125 transition-transform duration-300">
                        <span className="w-full h-full rounded-full bg-[#6c4df6] block" />
                      </div>
                    )}
                  </div>

                  {/* Left Side Content (Desktop: Even idx gets card on left, Odd gets date on left) */}
                  <div
                    className={`pl-14 md:pl-0 md:w-1/2 w-full ${
                      isEven ? 'md:pr-12 md:text-right' : 'md:pr-12 md:text-right md:order-1'
                    }`}
                  >
                    {isEven ? (
                      /* Card on Left for Even */
                      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1 text-left space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                            <Calendar className="w-3 h-3 text-[#6c4df6]" />
                            <span>
                              {exp.year_start} — {isCurrent ? t('expPresent') : exp.year_end || t('expPresent')}
                            </span>
                          </span>

                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {t('expCurrentRole')}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-[#6c4df6] transition-colors leading-snug">
                            {positionTitle}
                          </h3>
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mt-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{exp.company}</span>
                            {exp.location && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-500 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {exp.location}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {descriptionText && (
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                            {descriptionText}
                          </p>
                        )}
                      </div>
                    ) : (
                      /* Date Pill on Left for Odd */
                      <div className="hidden md:flex flex-col items-end space-y-1">
                        <span className="font-mono text-sm font-extrabold text-[#6c4df6]">
                          {exp.year_start} — {isCurrent ? t('expPresent') : exp.year_end || t('expPresent')}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          {exp.company}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Side Content (Desktop: Odd idx gets card on right, Even gets date on right) */}
                  <div
                    className={`pl-14 md:pl-0 md:w-1/2 w-full mt-3 md:mt-0 ${
                      isEven ? 'md:pl-12 text-left' : 'md:pl-12 text-left md:order-2'
                    }`}
                  >
                    {!isEven ? (
                      /* Card on Right for Odd */
                      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                            <Calendar className="w-3 h-3 text-[#6c4df6]" />
                            <span>
                              {exp.year_start} — {isCurrent ? t('expPresent') : exp.year_end || t('expPresent')}
                            </span>
                          </span>

                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {t('expCurrentRole')}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-[#6c4df6] transition-colors leading-snug">
                            {positionTitle}
                          </h3>
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mt-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{exp.company}</span>
                            {exp.location && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-500 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {exp.location}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {descriptionText && (
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                            {descriptionText}
                          </p>
                        )}
                      </div>
                    ) : (
                      /* Date Pill on Right for Even */
                      <div className="hidden md:flex flex-col items-start space-y-1">
                        <span className="font-mono text-sm font-extrabold text-[#6c4df6]">
                          {exp.year_start} — {isCurrent ? t('expPresent') : exp.year_end || t('expPresent')}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          {exp.company}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
