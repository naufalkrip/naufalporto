import React, { useState, useEffect, useRef } from 'react'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { BrandLogo } from './BrandLogo'

interface NavbarProps {
  name: string
  contactEmail?: string
}

export const Navbar: React.FC<NavbarProps> = ({ name: _name }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeHref, setActiveHref] = useState<string>('#about')
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 1 })

  const navRef = useRef<HTMLElement>(null)
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({})

  const { language, setLanguage, toggleLanguage, t } = useLanguage()

  const navLinks = [
    { label: t('navAbout'), href: '#about' },
    { label: t('navExperience'), href: '#experience' },
    { label: t('navWorks'), href: '#works-showcase' },
    { label: t('navContact'), href: '#contact' }
  ]

  // Track active section smoothly during scrolling (Scroll Spy)
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY + 180
          const windowHeight = window.innerHeight
          const docHeight = document.documentElement.scrollHeight

          // If scrolled near bottom of page, highlight contact
          if (window.scrollY + windowHeight >= docHeight - 100) {
            setActiveHref('#contact')
            ticking = false
            return
          }

          const sections = [
            { id: 'about', href: '#about' },
            { id: 'experience', href: '#experience' },
            { id: 'works-showcase', href: '#works-showcase', altId: 'works' },
            { id: 'contact', href: '#contact' }
          ]

          let currentActive = '#about'

          for (let i = sections.length - 1; i >= 0; i--) {
            const s = sections[i]
            const el =
              document.getElementById(s.id) ||
              (s.altId ? document.getElementById(s.altId) : null)

            if (el) {
              const top = el.offsetTop
              if (scrollPosition >= top) {
                currentActive = s.href
                break
              }
            }
          }

          setActiveHref(currentActive)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Update sliding indicator box position & width smoothly
  useEffect(() => {
    const updatePillPosition = () => {
      const activeEl = linkRefs.current[activeHref]
      if (activeEl) {
        setIndicatorStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
          opacity: 1
        })
      }
    }

    updatePillPosition()
    // Small timeout ensures styles are re-measured after language text width changes
    const timer = setTimeout(updatePillPosition, 50)
    window.addEventListener('resize', updatePillPosition)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updatePillPosition)
    }
  }, [activeHref, language])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    setActiveHref(href)

    const targetId = href.replace('#', '')
    const target =
      document.getElementById(targetId) ||
      (targetId === 'works-showcase' ? document.getElementById('works') : null)

    if (target) {
      const navOffset = 70
      const elementPosition = target.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - navOffset
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#f8f8fa]/90 backdrop-blur-md border-b border-slate-200/70 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Brand / Logo: Personal monogram 'A' & secret admin entry */}
        <BrandLogo />

        {/* Desktop Navigation with Smooth Sliding Box Indicator (styled like Let's Talk) */}
        <nav
          ref={navRef}
          className="hidden md:inline-flex items-center p-1 rounded-full bg-slate-200/70 dark:bg-slate-800/70 border border-slate-300/50 backdrop-blur-md relative shadow-2xs"
          aria-label="Main Navigation"
        >
          {/* Smooth Sliding Active Box Indicator */}
          <div
            className="absolute top-1 bottom-1 rounded-full shadow-sm transition-all duration-300 ease-out pointer-events-none"
            style={{
              transform: `translateX(${indicatorStyle.left}px)`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity,
              background: 'linear-gradient(135deg, #6c4df6 0%, #3b82f6 100%)'
            }}
          />

          {navLinks.map((link) => {
            const isActive = activeHref === link.href
            return (
              <a
                key={link.href}
                ref={(el) => {
                  linkRefs.current[link.href] = el
                }}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`relative z-10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-250 select-none ${
                  isActive
                    ? 'text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.label}
              </a>
            )
          })}
        </nav>

        {/* Header Right Actions: Language Switcher + CTA */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Switcher */}
          <div className="inline-flex items-center p-0.5 rounded-full bg-slate-200/70 border border-slate-300/40 text-xs font-bold shadow-2xs">
            <button
              type="button"
              onClick={() => setLanguage('id')}
              className={`px-2.5 py-1 rounded-full transition-all ${
                language === 'id'
                  ? 'bg-white text-[#6c4df6] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-full transition-all ${
                language === 'en'
                  ? 'bg-white text-[#6c4df6] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              EN
            </button>
          </div>

          {/* Let's Talk CTA */}
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, '#contact')}
            className="group relative inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.03] overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #6c4df6 0%, #3b82f6 100%)'
            }}
          >
            <span>{t('navLetsTalk')}</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        {/* Mobile Hamburger Menu Button + Quick Lang Switch */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-[#6c4df6] shadow-2xs"
          >
            {language.toUpperCase()}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[56px] bg-[#f8f8fa]/95 backdrop-blur-xl border-b border-slate-200/80 p-6 shadow-xl transition-all animate-in fade-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const isActive = activeHref === link.href
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`text-sm font-semibold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-between ${
                    isActive
                      ? 'text-white font-bold shadow-xs'
                      : 'text-slate-800 hover:text-[#6c4df6] hover:bg-slate-100/60'
                  }`}
                  style={
                    isActive
                      ? {
                          background:
                            'linear-gradient(135deg, #6c4df6 0%, #3b82f6 100%)'
                        }
                      : undefined
                  }
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </a>
              )
            })}

            <div className="flex items-center justify-between pt-3 border-t border-slate-200/80">
              <span className="text-xs font-semibold text-slate-500">Language:</span>
              <div className="inline-flex items-center p-0.5 rounded-full bg-slate-200/70 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setLanguage('id')}
                  className={`px-3 py-1 rounded-full transition-all ${
                    language === 'id' ? 'bg-white text-[#6c4df6] shadow-xs' : 'text-slate-500'
                  }`}
                >
                  ID
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-full transition-all ${
                    language === 'en' ? 'bg-white text-[#6c4df6] shadow-xs' : 'text-slate-500'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="mt-2 inline-flex items-center justify-center gap-2 py-3 rounded-full text-xs font-bold text-white shadow-md transition-all text-center"
              style={{
                background: 'linear-gradient(135deg, #6c4df6 0%, #3b82f6 100%)'
              }}
            >
              <span>{t('navLetsTalk')}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}