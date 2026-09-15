export interface Profile {
  id: string
  name: string
  professional_title: string
  professional_title_id?: string
  professional_title_en?: string
  short_intro: string
  short_intro_id?: string
  short_intro_en?: string
  bio: string
  bio_id?: string
  bio_en?: string
  profile_image: string
  location: string
  email: string
  whatsapp: string
  website: string
  instagram: string
  linkedin: string
  github: string
  skills?: string
  social_media?: {
    email?: string
    phone?: string
  }
  updated_at: string
}

export interface PortfolioCategory {
  id: string
  name: string
  name_id?: string
  name_en?: string
  slug: string
  subtitle: string
  subtitle_id?: string
  subtitle_en?: string
  description: string
  description_id?: string
  description_en?: string
  cover_image?: string
  display_order: number
  status: 'published' | 'draft'
  created_at?: string
  updated_at?: string
}

export interface PortfolioMedia {
  id: string
  portfolio_id: string
  media_type: 'image' | 'video'
  media_url: string
  thumbnail_url?: string
  title?: string
  title_id?: string
  title_en?: string
  description?: string
  description_id?: string
  description_en?: string
  display_order: number
  status: 'published' | 'draft'
  created_at?: string
  updated_at?: string
}

export interface PortfolioLink {
  id: string
  portfolio_id: string
  label: string
  label_id?: string
  label_en?: string
  url: string
  icon?: string
  display_order: number
  status: 'published' | 'draft'
  created_at?: string
  updated_at?: string
}

export interface PortfolioItem {
  id: string
  category_id: string
  title: string
  title_id?: string
  title_en?: string
  category?: string // fallback or display label
  description: string
  description_id?: string
  description_en?: string
  year: string
  cover_image: string
  project_url: string
  status: 'published' | 'draft'
  display_order: number
  featured?: boolean
  media_count?: number
  media?: PortfolioMedia[]
  links?: PortfolioLink[]
  created_at: string
  updated_at: string
}

export interface Experience {
  id: string
  year_start: string
  year_end?: string
  is_current: boolean
  position: string
  position_id?: string
  position_en?: string
  company: string
  location: string
  description: string
  description_id?: string
  description_en?: string
  company_logo?: string
  display_order: number
  status: 'published' | 'draft'
  created_at?: string
  updated_at?: string
}

export interface SocialPlatform {
  id: string
  platform: 'email' | 'instagram' | 'tiktok' | 'linkedin' | 'github' | 'youtube' | 'behance' | 'dribbble' | 'website' | 'other'
  label: string
  label_id?: string
  label_en?: string
  username: string
  url: string
  icon?: string
  display_order: number
  status: 'active' | 'inactive'
  created_at?: string
  updated_at?: string
}

export interface Settings {
  site_title: string
  site_title_id?: string
  site_title_en?: string
  site_description: string
  site_description_id?: string
  site_description_en?: string
  primary_color: string
  accent_color: string
  secondary_color: string
  gradient_start: string
  gradient_end: string
  animation_enabled: boolean
  maintenance_mode: boolean
  hide_empty_categories: boolean
  footer_text: string
  color_theme: 'creative-purple' | 'creative-blue' | 'creative-sunset' | 'creative-pink' | 'custom'
}

export interface AdminUser {
  id: string
  username: string
  role: string
  active?: boolean
  created_at?: string
  last_login?: string
}

export interface ActivityLog {
  id: string
  admin: string
  action: string
  target: string
  timestamp: string
  details: string
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  token?: string
  admin?: AdminUser
}

export interface ContactInfo {
  email: string
  whatsapp: string
  instagram: string
  linkedin: string
  github: string
  website: string
}