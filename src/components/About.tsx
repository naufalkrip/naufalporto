import React, { useMemo } from 'react'
import { ArrowRight, MapPin, Compass, Sparkles, CheckCircle2 } from 'lucide-react'
import type { Profile, Experience } from '../types'
import { useLanguage } from '../context/LanguageContext'
import { getLocalized } from '../i18n/translations'

interface AboutProps {
  profile: Profile
  projectCount?: number
  categoryCount?: number
  experiences?: Experience[]
}

/**
 * Editorial Creative Portfolio About Section
 * Replaces vacant whitespace with a dense, balanced, and premium editorial composition:
 * - 01 — ABOUT section index + CREATIVE / DIGITAL / VISUAL micro-accent
 * - Expressive bold typography heading
 * - High-impact creative portrait with organic rounded corners and ambient glow
 * - Short lead headline & narrative (2-4 lines)
 * - Functional creative metadata (Based in, Focus, Available for)
 * - Dynamic mini statistics (Projects, Years Experience, Creative Fields)
 * - Editorial CTA link with micro-interaction smooth scroll to #works
 */
export const About: React.FC<AboutProps> = ({
  profile,
  projectCount = 0,
  categoryCount = 0,
  experiences = []
}) => {
  const { language, t } = useLanguage()

  // Dynamic statistics calculations
  const formattedProjects = useMemo(() => {
    if (projectCount > 0) {
      return projectCount < 10 ? `0${projectCount}+` : `${projectCount}+`
    }
    return '05+'
  }, [projectCount])

  const formattedFields = useMemo(() => {
    if (categoryCount > 0) {
      return categoryCount < 10 ? `0${categoryCount}` : `${categoryCount}`
    }
    return '04'
  }, [categoryCount])

  const { experienceYears, careerSpan } = useMemo(() => {
    const currentYear = new Date().getFullYear()
    if (!experiences || experiences.length === 0) {
      return { experienceYears: '03+', careerSpan: `2022—${currentYear}` }
    }
    const startYears = experiences
      .map((e) => parseInt(e.year_start, 10))
      .filter((y) => !isNaN(y) && y > 1990)

    if (startYears.length === 0) {
      return { experienceYears: '03+', careerSpan: `2022—${currentYear}` }
    }
    const minYear = Math.min(...startYears)
    const diff = Math.max(1, currentYear - minYear)
    const expStr = diff < 10 ? `0${diff}+` : `${diff}+`
    return { experienceYears: expStr, careerSpan: `${minYear}—${currentYear}` }
  }, [experiences])

  // Localized texts
  const leadHeadline =
    getLocalized(profile, 'short_intro', language) ||
    profile.short_intro ||
    (language === 'id'
      ? 'Praktisi kreatif yang berfokus pada pengalaman digital, komunikasi visual, dan ide-ide bermakna.'
      : 'Creative professional focused on digital experiences, visual communication, and meaningful ideas.')

  const fullBio =
    getLocalized(profile, 'bio', language) ||
    profile.bio ||
    (language === 'id'
      ? 'Saya menikmati mentransformasikan konsep abstrak menjadi karya visual dan antarmuka digital yang berdampak — mulai dari arsitektur web hingga identitas visual dan proyek kreatif.'
      : 'I enjoy turning ideas into visual and digital experiences — from websites and branding to content and creative projects.')

  const focusTitle =
    getLocalized(profile, 'professional_title', language) ||
    profile.professional_title ||
    t('aboutFocusDefault')

  const locationText = profile.location || 'Indonesia'

  const profileImageUrl =
    profile.profile_image ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'

  const handleScrollToWorks = (e: React.MouseEvent) => {
    e.preventDefault()
    const target = document.getElementById('works-showcase') || document.getElementById('works')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      id="about"
      className="py-10 sm:py-16 lg:py-24 relative bg-transparent border-t border-slate-200/60 overflow-hidden"
    >
      {/* Ambient background lighting accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute -top-32 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-[#6c4df6]/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-24 -left-12 w-80 h-80 rounded-full bg-gradient-to-tr from-[#ec4899]/10 to-transparent blur-3xl" />
        {/* Subtle decorative grid guide lines */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* 1. Header Section Index Bar */}
        <div className="flex items-center justify-between gap-4 pb-4 sm:pb-8 border-b border-slate-200/80 mb-6 sm:mb-12">
          <div className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6c4df6]" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#6c4df6]">
              {t('aboutSectionNumber')}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
            <span className="hidden sm:inline">{t('aboutMicroTag')}</span>
            <span className="hidden sm:inline w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span>{careerSpan}</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE & TABLET LAYOUT (< lg): Dynamic, Balanced, Full-Width Flow        */}
        {/* ========================================================================= */}
        <div className="block lg:hidden space-y-5">
          {/* Top Row: Side-by-Side Heading & Compact Portrait */}
          <div className="grid grid-cols-12 gap-3.5 sm:gap-6 items-center">
            {/* Top Left: Heading & Lead */}
            <div className="col-span-7 space-y-2">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.08] font-sans">
                {t('aboutHeadingPart1')}{' '}
                <span className="bg-gradient-to-r from-[#6c4df6] via-[#ec4899] to-[#f97316] bg-clip-text text-transparent">
                  {t('aboutHeadingPart2')}
                </span>
              </h2>
              <p className="text-xs sm:text-base font-semibold text-slate-800 leading-snug">
                {leadHeadline}
              </p>
            </div>

            {/* Top Right: Compact Portrait Frame */}
            <div className="col-span-5">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden p-1 bg-gradient-to-b from-white via-slate-100 to-slate-200 border border-slate-200/90 shadow-md">
                <img
                  src={profileImageUrl}
                  alt={profile.name || 'Creative Profile'}
                  className="w-full h-full object-cover object-top rounded-xl"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md border border-white/60 text-[8px] font-extrabold uppercase tracking-wider text-slate-800 shadow-2xs">
                  <Sparkles className="w-2.5 h-2.5 text-[#6c4df6]" />
                  <span>{careerSpan}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full Bio Paragraphs: Fills full width naturally */}
          <div className="w-full">
            <p className="text-xs sm:text-base text-slate-600 leading-relaxed font-normal whitespace-pre-line">
              {fullBio}
            </p>
          </div>

          {/* Thin Geometric Divider Accent */}
          <div className="relative w-full my-2">
            <div className="h-px bg-gradient-to-r from-[#6c4df6]/30 via-slate-200 to-transparent" />
            <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-[#6c4df6]" />
          </div>

          {/* Creative Meta / Quick Info: Fills full width in 3 balanced cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
            {/* Based In */}
            <div className="p-2.5 sm:p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-1">
              <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#ec4899] shrink-0" />
                <span className="truncate">{t('aboutBasedIn')}</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight break-words leading-tight">
                {locationText}
              </div>
            </div>

            {/* Focus */}
            <div className="p-2.5 sm:p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-1">
              <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Compass className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#6c4df6] shrink-0" />
                <span className="truncate">{t('aboutFocus')}</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight break-words leading-tight">
                {focusTitle}
              </div>
            </div>

            {/* Available For */}
            <div className="p-2.5 sm:p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-1">
              <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500 shrink-0" />
                <span className="truncate">{t('aboutAvailableFor')}</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight break-words leading-tight">
                {t('aboutAvailableValue')}
              </div>
            </div>
          </div>

          {/* Mini Stats: Fills full width in 3 balanced cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
            {/* Projects */}
            <div className="p-2.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
                {formattedProjects}
              </div>
              <div className="text-[9px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                {t('aboutStatProjects')}
              </div>
            </div>

            {/* Experience Years */}
            <div className="p-2.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
                {experienceYears}
              </div>
              <div className="text-[9px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                {t('aboutStatExperience')}
              </div>
            </div>

            {/* Fields */}
            <div className="p-2.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
                {formattedFields}
              </div>
              <div className="text-[9px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                {t('aboutStatFields')}
              </div>
            </div>
          </div>

          {/* CTA Link */}
          <div className="pt-1">
            <a
              href="#works"
              onClick={handleScrollToWorks}
              className="group relative inline-flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-900 hover:text-[#6c4df6] transition-colors py-1.5"
            >
              <span>{t('aboutCta')}</span>
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 text-white flex items-center justify-center transition-all duration-300 group-hover:bg-[#6c4df6] group-hover:translate-x-1 shadow-sm">
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#6c4df6] to-[#ec4899] rounded-full group-hover:w-full transition-all duration-300 ease-out" />
            </a>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP LAYOUT (>= lg): Original Editorial 2-Column Sticky Composition    */}
        {/* ========================================================================= */}
        <div className="hidden lg:grid grid-cols-12 gap-16 items-start">
          {/* Left Column: Heading, Narrative, Metadata, Stats, CTA */}
          <div className="col-span-7 flex flex-col justify-between">
            <div>
              {/* Big Typographic Anchor Heading */}
              <h2 className="text-4xl lg:text-[56px] xl:text-[64px] font-extrabold tracking-tight text-slate-900 leading-[1.05] mb-6 font-sans">
                {t('aboutHeadingPart1')} <br />
                <span className="bg-gradient-to-r from-[#6c4df6] via-[#ec4899] to-[#f97316] bg-clip-text text-transparent">
                  {t('aboutHeadingPart2')}
                </span>
              </h2>

              {/* Short Personal Lead Hook */}
              <p className="text-xl lg:text-[21px] font-semibold text-slate-800 leading-snug mb-4 max-w-[540px]">
                {leadHeadline}
              </p>

              {/* Full Narrative Paragraph(s) */}
              <div className="space-y-3 mb-8 max-w-[540px]">
                <p className="text-base text-slate-600 leading-relaxed font-normal whitespace-pre-line">
                  {fullBio}
                </p>
              </div>
            </div>

            {/* Thin Geometric Divider Accent */}
            <div className="relative w-full my-4 mb-8">
              <div className="h-px bg-gradient-to-r from-[#6c4df6]/30 via-slate-200 to-transparent" />
              <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-[#6c4df6]" />
            </div>

            {/* Creative Meta / Quick Info (Editorial Metadata Blocks) */}
            <div className="grid grid-cols-3 gap-6 pt-1 pb-8">
              {/* Based In */}
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#ec4899] shrink-0" />
                  <span>{t('aboutBasedIn')}</span>
                </div>
                <div className="text-sm font-bold text-slate-800 tracking-tight break-words">
                  {locationText}
                </div>
              </div>

              {/* Focus */}
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Compass className="w-3 h-3 text-[#6c4df6] shrink-0" />
                  <span>{t('aboutFocus')}</span>
                </div>
                <div className="text-sm font-bold text-slate-800 tracking-tight break-words">
                  {focusTitle}
                </div>
              </div>

              {/* Available For */}
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500 shrink-0" />
                  <span>{t('aboutAvailableFor')}</span>
                </div>
                <div className="text-sm font-bold text-slate-800 tracking-tight break-words">
                  {t('aboutAvailableValue')}
                </div>
              </div>
            </div>

            {/* Mini Stats (Numbers as Visual Anchors) */}
            <div className="grid grid-cols-3 gap-4 pt-2 pb-10 border-t border-slate-200/60">
              {/* Projects */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs group hover:border-[#6c4df6]/40 transition-colors">
                <div className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-none mb-1">
                  {formattedProjects}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                  {t('aboutStatProjects')}
                </div>
              </div>

              {/* Experience Years */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs group hover:border-[#ec4899]/40 transition-colors">
                <div className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-none mb-1">
                  {experienceYears}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                  {t('aboutStatExperience')}
                </div>
              </div>

              {/* Fields */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs group hover:border-[#f97316]/40 transition-colors">
                <div className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-none mb-1">
                  {formattedFields}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                  {t('aboutStatFields')}
                </div>
              </div>
            </div>

            {/* Editorial CTA Link with micro-interaction */}
            <div className="pt-2">
              <a
                href="#works"
                onClick={handleScrollToWorks}
                className="group relative inline-flex items-center gap-3 text-sm font-extrabold uppercase tracking-widest text-slate-900 hover:text-[#6c4df6] transition-colors py-2"
              >
                <span>{t('aboutCta')}</span>
                <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center transition-all duration-300 group-hover:bg-[#6c4df6] group-hover:translate-x-1.5 shadow-sm">
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#6c4df6] to-[#ec4899] rounded-full group-hover:w-full transition-all duration-300 ease-out" />
              </a>
            </div>
          </div>

          {/* Right Column: Desktop Profile Portrait Presentation */}
          <div className="col-span-5 sticky top-28">
            <div className="relative max-w-md ml-auto">
              {/* Soft decorative ambient glow & subtle backdrop blob */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#6c4df6]/25 via-[#ec4899]/20 to-[#f97316]/15 rounded-[40px] blur-2xl opacity-60 pointer-events-none" />

              {/* Portrait Frame Container */}
              <div className="relative aspect-[4/5] rounded-[36px] overflow-hidden p-2 bg-gradient-to-b from-white via-slate-100 to-slate-200 border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.08)] group">
                <img
                  src={profileImageUrl}
                  alt={profile.name || 'Creative Profile'}
                  className="w-full h-full object-cover object-top rounded-[28px] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                />

                {/* Subtle gradient vignette overlay at the bottom */}
                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60 pointer-events-none" />

                {/* Top-right subtle craft tag */}
                <div className="absolute top-5 right-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-white/60 text-[10px] font-extrabold uppercase tracking-wider text-slate-800 shadow-sm">
                  <Sparkles className="w-3 h-3 text-[#6c4df6]" />
                  <span>{t('aboutCreativeStory')}</span>
                </div>

                {/* Bottom floating badge: Active Career Span */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-slate-900 leading-tight">
                        {profile.name || t('aboutPersonalPortfolio')}
                      </span>
                      <span className="block text-[10px] font-semibold text-slate-500">
                        {focusTitle}
                      </span>
                    </div>
                  </div>

                  <div className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-black text-slate-700 tracking-wider">
                    {careerSpan}
                  </div>
                </div>
              </div>

              {/* Delicate decorative geometric accents outside frame */}
              <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full border border-dashed border-[#6c4df6]/30 pointer-events-none" />
              <div className="absolute -top-3 -right-3 w-4 h-4 rounded-full bg-gradient-to-tr from-[#6c4df6] to-[#ec4899] shadow-xs pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About