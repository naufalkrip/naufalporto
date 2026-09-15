import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '../services/auth'

interface BrandLogoProps {
  className?: string
}

/**
 * BrandLogo:
 * Personal monogram "A" serving as both personal brand identity and a hidden gateway to `/secret-login`.
 * Features subtle hover interaction (scale 1.04, gradient glow, 250ms transition) and accessible keyboard focus.
 * Clicking ensures any prior session is cleared so password entry is ALWAYS required.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '' }) => {
  const navigate = useNavigate()

  const handleAccess = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    // Explicitly clear session so user is ALWAYS prompted to input password, never directly entering dashboard
    AuthService.logout()
    navigate('/secret-login')
  }

  return (
    <a
      href="/secret-login"
      onClick={handleAccess}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleAccess(e)
        }
      }}
      aria-label="Admin login"
      tabIndex={0}
      role="link"
      className={`group relative inline-flex items-center justify-center select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#6c4df6] focus-visible:ring-offset-2 rounded-xl transition-all duration-300 ${className}`}
    >
      {/* Subtle outer gradient halo/glow on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-[#6c4df6] via-[#ec4899] to-[#06b6d4] opacity-0 group-hover:opacity-40 blur-xs transition-opacity duration-300 pointer-events-none" />

      {/* Monogram Box: small, proportional, solid pure white background */}
      <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center transition-all duration-250 ease-out group-hover:scale-[1.04] group-hover:border-[#6c4df6]/50 group-hover:shadow-[0_4px_16px_rgba(108,77,246,0.15)] overflow-hidden">
        {/* Monogram Letter "N" */}
        <span className="font-black text-sm sm:text-base tracking-tight bg-gradient-to-br from-[#6c4df6] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent group-hover:brightness-110 transition-all duration-250 font-sans leading-none">
          N
        </span>
      </div>
    </a>
  )
}

export default BrandLogo
