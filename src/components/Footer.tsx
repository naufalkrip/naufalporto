import React from 'react'
import { GithubIcon, LinkedinIcon, InstagramIcon } from './SocialIcons'
import { Globe } from 'lucide-react'
import type { Profile } from '../types'
import { useLanguage } from '../context/LanguageContext'

interface FooterProps {
  profile: Profile
  footerText?: string
}

export const Footer: React.FC<FooterProps> = ({ profile, footerText }) => {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()
  const defaultCopyright = `© ${currentYear} ${profile.name || 'Creative Portfolio'}. ${t('footerRights')}`

  return (
    <footer className="bg-white text-slate-500 py-6 sm:py-8 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left Branding */}
        <div className="flex flex-col items-center sm:items-start">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#6c4df6] to-[#ec4899]" />
            <span className="text-sm font-extrabold text-slate-900 tracking-tight">
              {profile.name || 'Creative Portfolio'}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-400 mt-0.5">
            {t('footerSubtitle')}
          </span>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs font-medium text-slate-400">
          <p>{footerText || defaultCopyright}</p>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-3">
          {profile.github && (
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="GitHub"
            >
              <GithubIcon size={15} />
            </a>
          )}
          {profile.linkedin && (
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#0077b5] hover:bg-slate-100 transition-colors"
              aria-label="LinkedIn"
            >
              <LinkedinIcon size={15} />
            </a>
          )}
          {profile.instagram && (
            <a
              href={profile.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#e4405f] hover:bg-slate-100 transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon size={15} />
            </a>
          )}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#6c4df6] hover:bg-slate-100 transition-colors"
              aria-label="Website"
            >
              <Globe size={15} />
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}