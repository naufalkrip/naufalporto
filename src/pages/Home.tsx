import React from 'react'
import { Navbar } from '../components/Navbar'
import { Hero } from '../components/Hero'
import { About } from '../components/About'
import { ExperienceTimeline } from '../components/ExperienceTimeline'
import { WorksShowcase } from '../components/WorksShowcase'
import { Contact } from '../components/Contact'
import { Footer } from '../components/Footer'
import { BackgroundSprinkles } from '../components/BackgroundSprinkles'
import { AmbientSoundPlayer } from '../components/AmbientSoundPlayer'
import { useProfile } from '../hooks/useProfile'
import { useCategories } from '../hooks/useCategories'
import { usePortfolio } from '../hooks/usePortfolio'
import { useExperience } from '../hooks/useExperience'
import { useSocials } from '../hooks/useSocials'
import { useSettings } from '../hooks/useSettings'
import { LanguageProvider } from '../context/LanguageContext'

const HomeContent: React.FC = () => {
  // Public page data with auto-sync polling
  const { profile, loading: profileLoading } = useProfile(true)
  const { categories, loading: categoriesLoading } = useCategories('published', true)
  const { items: portfolioItems, loading: portLoading } = usePortfolio('published', true)
  const { experiences, loading: expLoading } = useExperience('published', true)
  const { socials } = useSocials('active', true)
  const { settings } = useSettings(true)

  if (profileLoading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8fa]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#6c4df6] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">
            Loading portfolio...
          </span>
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="relative min-h-screen bg-[#f8f8fa] text-slate-900 selection:bg-[#ec4899] selection:text-white overflow-hidden">
      {/* Subtle Ambient Background Sprinkles (Delightful, Minimalist & Animated) */}
      <BackgroundSprinkles />

      {/* 1. Navbar with Language Switcher */}
      <Navbar name={profile.name} contactEmail={profile.email} />

      <main className="relative z-10">
        {/* 2. Hero Section */}
        <Hero profile={profile} />

        {/* 3. About Section */}
        <About
          profile={profile}
          projectCount={portfolioItems.length}
          categoryCount={categories.length}
          experiences={experiences}
        />

        {/* 4. Work Experience Timeline */}
        <ExperienceTimeline
          experiences={experiences}
          loading={expLoading}
        />

        {/* 5. Works Showcase by Category */}
        <WorksShowcase
          categories={categories}
          portfolioItems={portfolioItems}
          loading={categoriesLoading || portLoading}
          hideEmptyCategories={settings?.hide_empty_categories}
        />

        {/* 6. Contact & Connect Section (Unified) */}
        <Contact profile={profile} socials={socials} />
      </main>

      {/* 7. Footer */}
      <Footer profile={profile} footerText={settings?.footer_text} />

      {/* Floating Calm & Dynamic Ambient Sound Player */}
      <AmbientSoundPlayer />
    </div>
  )
}

export const Home: React.FC = () => {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  )
}
