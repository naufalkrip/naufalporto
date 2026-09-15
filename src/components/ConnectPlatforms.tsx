import React from 'react'
import {
  Mail,
  Globe,
  ArrowRight,
  Share2,
  Video
} from 'lucide-react'
import { GithubIcon, LinkedinIcon, InstagramIcon } from './SocialIcons'
import type { SocialPlatform } from '../types'
import { useLanguage } from '../context/LanguageContext'
import { getLocalized } from '../i18n/translations'

interface ConnectPlatformsProps {
  socials: SocialPlatform[]
}

// Helper to render platform icon
const renderPlatformIcon = (platform: string, size = 20) => {
  const p = platform.toLowerCase()
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
      // Custom SVG for TikTok
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
    case 'website':
      return <Globe size={size} />
    default:
      return <Share2 size={size} />
  }
}

export const ConnectPlatforms: React.FC<ConnectPlatformsProps> = ({ socials }) => {
  const { language, t } = useLanguage()

  const activeSocials = socials
    .filter((item) => item.status === 'active')
    .sort((a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99))

  if (activeSocials.length === 0) return null

  return (
    <section className="relative py-16 sm:py-20 bg-[#f8f8fa] border-t border-slate-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200/80 shadow-2xs">
            <Share2 className="w-3.5 h-3.5 text-[#ec4899]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-700">
              {t('connectBadge')}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {t('connectHeadingPart1')}{' '}
            <span className="gradient-text-pink">{t('connectHeadingPart2')}</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            {t('connectSubtitle')}
          </p>
        </div>

        {/* Platform Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {activeSocials.map((social) => {
            const label = getLocalized(social, 'label', language) || social.label || social.platform
            const isEmail = social.platform.toLowerCase() === 'email'
            const href = isEmail && !social.url.startsWith('mailto:')
              ? `mailto:${social.url}`
              : social.url

            return (
              <a
                key={social.id}
                href={href}
                target={isEmail ? '_self' : '_blank'}
                rel="noopener noreferrer"
                className="group relative bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between space-y-5 overflow-hidden"
              >
                {/* Subtle gradient border accent on hover */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#6c4df6] via-[#ec4899] to-[#f97316] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 group-hover:text-[#6c4df6] group-hover:bg-[#6c4df6]/10 group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
                    {renderPlatformIcon(social.platform, 22)}
                  </div>

                  {/* Dynamic Arrow indicator: → becomes → → on hover */}
                  <div className="flex items-center text-slate-400 group-hover:text-[#6c4df6] transition-colors">
                    <span className="text-xs font-bold font-mono tracking-tighter opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200">
                      →
                    </span>
                    <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">
                    {social.platform}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#6c4df6] transition-colors leading-snug">
                    {label}
                  </h3>
                  {social.username && (
                    <span className="text-xs font-mono font-medium text-slate-500 block mt-1">
                      {social.username}
                    </span>
                  )}
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
