import React from 'react'
import {
  Mail,
  Globe,
  ArrowRight,
  Sparkles,
  Share2,
  Video,
  MessageSquare
} from 'lucide-react'
import { GithubIcon, LinkedinIcon, InstagramIcon } from './SocialIcons'
import type { Profile, SocialPlatform } from '../types'
import { useLanguage } from '../context/LanguageContext'
import { getLocalized } from '../i18n/translations'

interface ContactProps {
  profile: Profile
  socials?: SocialPlatform[]
}

// Helper to render platform-specific icons
const renderPlatformIcon = (platform: string, size = 20) => {
  const p = platform.toLowerCase().trim()
  switch (p) {
    case 'email':
      return <Mail size={size} />
    case 'instagram':
      return <InstagramIcon size={size} />
    case 'linkedin':
      return <LinkedinIcon size={size} />
    case 'github':
      return <GithubIcon size={size} />
    case 'tiktok':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
      )
    case 'youtube':
      return <Video size={size} />
    case 'dribbble':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94" />
          <path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32" />
          <path d="M8.5 2.5c2.9 4.3 4.5 9.4 4.5 15.5" />
        </svg>
      )
    case 'behance':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 8h4.5a2.5 2.5 0 0 1 0 5H3V8zm0 5h5a2.5 2.5 0 0 1 0 5H3v-5z" />
          <path d="M15 13a3 3 0 1 0 5.4-1.8A3 3 0 0 0 15 13zm0 0h6" />
          <line x1="15" y1="8" x2="20" y2="8" />
        </svg>
      )
    case 'whatsapp':
      return <MessageSquare size={size} />
    case 'website':
      return <Globe size={size} />
    default:
      return <Share2 size={size} />
  }
}

export const Contact: React.FC<ContactProps> = ({ profile, socials = [] }) => {
  const { language, t } = useLanguage()

  // Filter and sort active socials from admin
  const activeSocials = socials
    .filter((item) => item.status === 'active')
    .sort((a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99))

  // Determine email link
  const emailHref = profile.email
    ? `mailto:${profile.email}?subject=${encodeURIComponent(t('contactSubject'))}`
    : '#contact'

  // Avoid showing duplicate email card if socials already has one pointing to the same email
  const filteredSocials = activeSocials.filter((s) => {
    if (s.platform.toLowerCase() === 'email') {
      return !profile.email // Only show if profile.email doesn't already provide it
    }
    return true
  })

  const hasEmailCard = Boolean(profile.email && profile.email.trim())

  return (
    <section
      id="contact"
      className="relative py-20 sm:py-28 md:py-32 bg-[#f8f8fa] border-t border-slate-200/70 overflow-hidden"
    >
      {/* Colorful Controlled Ambient Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glow 1: Top-Center Violet & Magenta Glow */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[750px] sm:w-[950px] h-[500px] sm:h-[600px] rounded-full blur-3xl opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(108,77,246,0.35) 0%, rgba(236,72,153,0.22) 45%, transparent 75%)'
          }}
        />
        {/* Glow 2: Bottom-Left Cyan & Indigo Glow */}
        <div
          className="absolute -bottom-24 -left-20 w-[500px] h-[450px] rounded-full blur-3xl opacity-20"
          style={{
            background:
              'radial-gradient(circle, rgba(6,182,212,0.3) 0%, rgba(99,102,241,0.2) 50%, transparent 75%)'
          }}
        />
        {/* Glow 3: Bottom-Right Coral & Orange Glow */}
        <div
          className="absolute -bottom-20 -right-20 w-[500px] h-[400px] rounded-full blur-3xl opacity-20"
          style={{
            background:
              'radial-gradient(circle, rgba(249,115,22,0.28) 0%, rgba(244,63,94,0.18) 50%, transparent 75%)'
          }}
        />
        {/* Subtle grid dots for tactile depth */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)`,
            backgroundSize: '36px 36px'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        {/* 1. Contact Heading & Subtext */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-slate-200/90 shadow-2xs backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#ec4899]" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">
              {t('contactBadge')}
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 leading-[0.98] sm:leading-[0.95]">
            <span className="block">{t('contactHeadingPart1')}</span>
            <span className="block gradient-text-multi mt-1 sm:mt-2">
              {t('contactHeadingPart2')}
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal pt-2">
            {t('contactSubtitle')}
          </p>
        </div>

        {/* 2. Social & Platform Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto mb-12 sm:mb-16">
          {/* Dedicated Profile Email Card */}
          {hasEmailCard && (
            <a
              href={emailHref}
              className="group relative bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-5 overflow-hidden"
            >
              {/* Subtle gradient border accent on hover */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#6c4df6] via-[#ec4899] to-[#f97316] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 group-hover:text-[#6c4df6] group-hover:bg-[#6c4df6]/10 group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
                  <Mail size={22} />
                </div>

                <div className="flex items-center text-slate-400 group-hover:text-[#6c4df6] transition-colors">
                  <span className="text-[11px] font-bold uppercase tracking-wider mr-1">
                    {t('contactSendEmailAction')}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                  {t('contactSendEmail')}
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#6c4df6] transition-colors truncate block">
                  {profile.email}
                </span>
              </div>
            </a>
          )}

          {/* Dynamic Social Cards from Admin */}
          {filteredSocials.map((social) => {
            const localizedLabel =
              getLocalized(social, 'label', language) || social.label || social.platform
            const isEmail = social.platform.toLowerCase() === 'email'
            const href =
              isEmail && !social.url.startsWith('mailto:')
                ? `mailto:${social.url}`
                : social.url

            return (
              <a
                key={social.id}
                href={href}
                target={isEmail ? '_self' : '_blank'}
                rel="noopener noreferrer"
                className="group relative bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-5 overflow-hidden"
              >
                {/* Subtle gradient border accent on hover */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#6c4df6] via-[#ec4899] to-[#f97316] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 group-hover:text-[#6c4df6] group-hover:bg-[#6c4df6]/10 group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
                    {renderPlatformIcon(social.platform, 22)}
                  </div>

                  <div className="flex items-center text-slate-400 group-hover:text-[#6c4df6] transition-colors">
                    <span className="text-[11px] font-bold uppercase tracking-wider mr-1">
                      {t('contactVisitAction')}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                    {social.platform}
                  </span>
                  <span className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#6c4df6] transition-colors truncate block">
                    {social.username ? `@${social.username.replace(/^@/, '')}` : localizedLabel}
                  </span>
                </div>
              </a>
            )
          })}
        </div>

        {/* 3. Main Call to Action Button */}
        <div className="flex items-center justify-center">
          <a
            href={emailHref}
            className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-[#6c4df6] via-[#ec4899] to-[#f97316] text-white font-black text-sm sm:text-base tracking-wide shadow-lg shadow-[#6c4df6]/25 hover:shadow-2xl hover:shadow-[#ec4899]/35 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
          >
            <span className="relative z-10">{t('contactCta')}</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />
            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </a>
        </div>
      </div>
    </section>
  )
}