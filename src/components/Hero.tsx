import React from 'react'
import { ArrowDown, ArrowUpRight, Sparkles, MapPin } from 'lucide-react'
import type { Profile } from '../types'
import { useLanguage } from '../context/LanguageContext'
import { getLocalized } from '../i18n/translations'

interface HeroProps {
  profile: Profile
}

export const Hero: React.FC<HeroProps> = ({ profile }) => {
  const { language, t } = useLanguage()

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, selector: string) => {
    e.preventDefault()
    const target = document.querySelector(selector)
    if (target) {
      const navOffset = 80
      const elementPosition = target.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - navOffset
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  // Format localized profession and short intro
  const profession =
    getLocalized(profile, 'professional_title', language) ||
    profile.professional_title ||
    'Creative Technologist & Visual Designer'

  const shortIntro =
    getLocalized(profile, 'short_intro', language) ||
    profile.short_intro ||
    'Crafting meaningful digital experiences where bold aesthetics meet thoughtful engineering.'

  return (
    <section className="relative min-h-[60vh] sm:min-h-[75vh] flex items-center pt-20 pb-8 sm:pt-28 sm:pb-16 overflow-hidden bg-transparent">
      {/* Subtle Abstract Background Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-left soft gradient blob */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(108,77,246,0.3) 0%, rgba(59,130,246,0.1) 70%, transparent 100%)'
          }}
        />
        {/* Right-center soft magenta/orange accent */}
        <div
          className="absolute top-1/3 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(249,115,22,0.15) 70%, transparent 100%)'
          }}
        />
        {/* Subtle decorative dot pattern */}
        <div
          className="absolute right-12 bottom-12 w-48 h-48 opacity-[0.12] hidden md:block"
          style={{
            backgroundImage: 'radial-gradient(#6c4df6 1.5px, transparent 1.5px)',
            backgroundSize: '16px 16px'
          }}
        />
        {/* Thin curved SVG line */}
        <svg
          className="absolute top-20 right-1/4 w-72 h-72 opacity-15 hidden lg:block"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 180 C 60 40, 140 160, 180 20"
            stroke="url(#hero-line-grad)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <defs>
            <linearGradient id="hero-line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6c4df6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full relative z-10">
        <div className="grid grid-cols-12 gap-3 sm:gap-6 lg:gap-8 items-center">
          {/* LEFT COLUMN: Typography & CTAs (Maintains Desktop Composition on Mobile) */}
          <div className="col-span-7 flex flex-col items-start space-y-3 sm:space-y-6">
            {/* Small Label Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#ec4899] animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-700">
                {t('heroBadge')}
              </span>
            </div>

            {/* Heading */}
            <div className="space-y-1 sm:space-y-2">
              <p className="text-xs sm:text-base font-semibold uppercase tracking-wider text-slate-500">
                {t('heroHello')}
              </p>
              <h1 className="text-2xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                <span className="gradient-text">{profile.name}</span>
              </h1>
              <p className="text-xs sm:text-xl lg:text-2xl font-bold text-slate-700 tracking-tight pt-0.5 sm:pt-1 leading-snug">
                {profession}
              </p>
            </div>

            {/* Short Intro */}
            <p className="text-xs sm:text-base lg:text-lg text-slate-600 max-w-xl leading-relaxed font-normal">
              {shortIntro}
            </p>

            {/* Location (if available) */}
            {profile.location && (
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-500">
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#6c4df6] shrink-0" />
                <span>{t('heroBasedIn')} {profile.location}</span>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-2 sm:gap-4">
              <a
                href="#works-showcase"
                onClick={(e) => scrollToSection(e, '#works-showcase')}
                className="group inline-flex items-center gap-1.5 sm:gap-2.5 px-4 py-2 sm:px-7 sm:py-3.5 rounded-full text-[11px] sm:text-xs font-bold text-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, #6c4df6 0%, #3b82f6 100%)'
                }}
              >
                <span>{t('heroViewWork')}</span>
                <ArrowDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-y-1" />
              </a>

              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, '#contact')}
                className="group inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-6 sm:py-3.5 rounded-full text-[11px] sm:text-xs font-bold text-slate-800 bg-white border border-slate-200/90 hover:border-[#6c4df6]/50 shadow-xs hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
              >
                <span>{t('heroLetsTalk')}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6c4df6] transition-colors" />
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN: Profile Photo & Organic Frame (Proportional and Side-by-Side on Mobile) */}
          <div className="col-span-5 flex justify-center lg:justify-end relative">
            <div className="relative w-32 h-32 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-96 lg:h-96">
              {/* Soft Gradient Glow behind photo */}
              <div
                className="absolute inset-0 -m-3 sm:-m-6 rounded-full blur-xl sm:blur-2xl opacity-35"
                style={{
                  background: 'linear-gradient(135deg, #6c4df6, #ec4899, #3b82f6)'
                }}
              />

              {/* Decorative Floating Mini Badge */}
              <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 z-20 bg-white/95 backdrop-blur-md px-2 py-0.5 sm:px-3.5 sm:py-1.5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm text-[8px] sm:text-[10px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 animate-float">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t('heroAvailable')}</span>
              </div>

              {/* Photo Container with Organic Asymmetric Frame */}
              <div className="relative w-full h-full profile-frame bg-white p-1.5 sm:p-2.5 shadow-xl sm:shadow-2xl border border-slate-100">
                <div className="relative w-full h-full rounded-xl sm:rounded-[2rem] overflow-hidden bg-slate-100">
                  {profile.profile_image ? (
                    <img
                      src={profile.profile_image}
                      alt={profile.name}
                      className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
                      loading="eager"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#6c4df6]/10 to-[#ec4899]/10 text-slate-400">
                      <Sparkles className="w-6 h-6 sm:w-12 sm:h-12 text-[#6c4df6] mb-1 sm:mb-2" />
                      <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 text-center px-1">
                        {profile.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Floating Decorative Shape */}
              <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-6 h-6 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-tr from-[#ec4899] to-[#f97316] opacity-80 -rotate-12 blur-[0.5px] -z-10 shadow-md" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}