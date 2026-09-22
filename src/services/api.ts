import axios from 'axios'
import type {
  ApiResponse,
  Profile,
  PortfolioCategory,
  PortfolioItem,
  PortfolioMedia,
  PortfolioLink,
  Settings,
  ActivityLog,
  Experience,
  SocialPlatform
} from '../types'
import {
  INITIAL_DEMO_PROFILE,
  INITIAL_DEMO_CATEGORIES,
  INITIAL_DEMO_PORTFOLIO,
  INITIAL_DEMO_PORTFOLIO_MEDIA,
  INITIAL_DEMO_PORTFOLIO_LINKS,
  INITIAL_DEMO_SETTINGS,
  INITIAL_DEMO_LOGS,
  INITIAL_DEMO_EXPERIENCES,
  INITIAL_DEMO_SOCIALS
} from '../data/demoData'

import { emitRealtimeUpdate, type RealtimeEntity } from './realtimeSync'

const envUrl = import.meta.env.VITE_APPS_SCRIPT_URL

// Check if Apps Script is configured with a real URL
export const isLiveApiConfigured = Boolean(
  envUrl &&
  typeof envUrl === 'string' &&
  envUrl.trim().length > 10 &&
  !envUrl.includes('AKfycbyX2y0X3EeBvXYZqWzvYzZ6T8T7T7T7T7T7T7T7T7T7T7T7T7T7')
)

let apiBaseUrl: string = envUrl && envUrl.trim() !== '' ? envUrl.trim() : ''

export function setApiUrl(url: string) {
  apiBaseUrl = url
}

export function getApiUrl(): string {
  return apiBaseUrl
}

function mapActionToEntity(action: string): RealtimeEntity {
  if (action.includes('Profile')) return 'profile'
  if (action.includes('Category') || action.includes('Categories')) return 'categories'
  if (action.includes('PortfolioMedia')) return 'portfolio_media'
  if (action.includes('PortfolioLink')) return 'portfolio_links'
  if (action.includes('Portfolio')) return 'portfolio'
  if (action.includes('Experience')) return 'experiences'
  if (action.includes('Social')) return 'socials'
  if (action.includes('Setting')) return 'settings'
  return 'all'
}

// Local mock storage keys for offline/demo mode
const LOCAL_STORAGE_KEYS = {
  PROFILE: 'portofolio_mock_profile',
  CATEGORIES: 'portofolio_mock_categories',
  PORTFOLIO: 'portofolio_mock_portfolio',
  PORTFOLIO_MEDIA: 'portofolio_mock_portfolio_media',
  PORTFOLIO_LINKS: 'portofolio_mock_portfolio_links',
  EXPERIENCES: 'portofolio_mock_experiences',
  SOCIALS: 'portofolio_mock_socials',
  SETTINGS: 'portofolio_mock_settings',
  LOGS: 'portofolio_mock_logs'
}

function getLocalData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key)
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback))
      return fallback
    }
    return JSON.parse(item) as T
  } catch (e) {
    return fallback
  }
}

function setLocalData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to write to localStorage', e)
  }
}

/**
 * Handle API GET requests with resilient fallback
 */
export async function apiGet<T>(
  action: string,
  params: Record<string, string> = {}
): Promise<{ data: T | null; error: string | null; isDemo: boolean }> {
  if (isLiveApiConfigured) {
    try {
      const url = new URL(apiBaseUrl)
      url.searchParams.set('action', action)
      url.searchParams.set('timestamp', Date.now().toString())
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

      const response = await axios.get<ApiResponse<T>>(url.toString(), {
        timeout: 5000
      })

      // Verify response is legitimate JSON object with success: true
      if (response.data && typeof response.data === 'object' && response.data.success) {
        return { data: response.data.data as T, error: null, isDemo: false }
      }
      console.warn(`[AppsScript API] Non-JSON or unsuccessful GET response for ${action}, falling back to local storage store`)
    } catch (err: any) {
      console.warn(`[AppsScript API] Failed GET for ${action}, falling back to local storage store:`, err.message)
    }
  }

  // Resilient fallback to local demo data
  const mockData = getMockDataForAction<T>(action, params)
  return { data: mockData, error: null, isDemo: true }
}

/**
 * Handle API POST requests with resilient fallback & immediate realtime sync
 */
export async function apiPost<T>(
  action: string,
  payload: any
): Promise<{ data: T | null; error: string | null; isDemo: boolean }> {
  const entity = mapActionToEntity(action)

  if (isLiveApiConfigured) {
    try {
      const url = `${apiBaseUrl}?action=${action}`
      const response = await axios.post<ApiResponse<T>>(url, JSON.stringify({ ...payload, action }), {
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        timeout: 6000
      })

      if (response.data && typeof response.data === 'object' && response.data.success) {
        // Keep local store synchronized with live data
        mutateMockData<T>(action, payload)
        emitRealtimeUpdate(entity)
        return { data: (response.data.data ?? response.data) as T, error: null, isDemo: false }
      }
      console.warn(`[AppsScript API] Non-JSON or unsuccessful POST response for ${action}, mutating local store`)
    } catch (err: any) {
      console.warn(`[AppsScript API] Failed POST for ${action}, mutating local store:`, err.message)
    }
  }

  // Fallback to local mutation
  const mockResult = mutateMockData<T>(action, payload)
  emitRealtimeUpdate(entity)
  return { data: mockResult, error: null, isDemo: true }
}

/**
 * Mock data dispatchers
 */
function getMockDataForAction<T>(action: string, params: Record<string, string>): T {
  switch (action) {
    case 'getProfile':
      return getLocalData<Profile>(LOCAL_STORAGE_KEYS.PROFILE, INITIAL_DEMO_PROFILE) as unknown as T

    case 'getCategories':
    case 'getAllCategories': {
      const cats = getLocalData<PortfolioCategory[]>(LOCAL_STORAGE_KEYS.CATEGORIES, INITIAL_DEMO_CATEGORIES)
      if (params.status && params.status !== 'all') {
        return cats.filter(c => c.status === params.status).sort((a, b) => a.display_order - b.display_order) as unknown as T
      }
      return cats.sort((a, b) => a.display_order - b.display_order) as unknown as T
    }

    case 'getPortfolio':
    case 'getAllPortfolio':
    case 'getPortfolioByCategory': {
      let items = getLocalData<PortfolioItem[]>(LOCAL_STORAGE_KEYS.PORTFOLIO, INITIAL_DEMO_PORTFOLIO)
      const allMedia = getLocalData<PortfolioMedia[]>(LOCAL_STORAGE_KEYS.PORTFOLIO_MEDIA, INITIAL_DEMO_PORTFOLIO_MEDIA)
      const allLinks = getLocalData<PortfolioLink[]>(LOCAL_STORAGE_KEYS.PORTFOLIO_LINKS, INITIAL_DEMO_PORTFOLIO_LINKS)

      if (params.status && params.status !== 'all') {
        items = items.filter(i => (i.status || 'published') === params.status)
      }
      if (params.category_id) {
        items = items.filter(i => String(i.category_id) === String(params.category_id) || String(i.category) === String(params.category_id))
      }

      // Attach media_count, media, and links
      items = items.map(item => {
        const itemMedia = allMedia
          .filter(m => m.portfolio_id === item.id && (params.status === 'all' ? true : (m.status || 'published') === 'published'))
          .sort((a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99))
        const itemLinks = allLinks
          .filter(l => l.portfolio_id === item.id && (params.status === 'all' ? true : (l.status || 'published') === 'published'))
          .sort((a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99))

        return {
          ...item,
          status: item.status || 'published',
          media_count: itemMedia.length > 0 ? itemMedia.length : 1,
          media: itemMedia,
          links: itemLinks
        }
      })

      return items.sort((a, b) => {
        const featA = a.featured ? 1 : 0
        const featB = b.featured ? 1 : 0
        if (featA !== featB) return featB - featA
        return (Number(a.display_order) || 99) - (Number(b.display_order) || 99)
      }) as unknown as T
    }

    case 'getPortfolioMedia':
    case 'getAllPortfolioMedia': {
      let items = getLocalData<PortfolioMedia[]>(LOCAL_STORAGE_KEYS.PORTFOLIO_MEDIA, INITIAL_DEMO_PORTFOLIO_MEDIA)
      if (params.portfolio_id) {
        items = items.filter(i => i.portfolio_id === params.portfolio_id)
      }
      if (params.status && params.status !== 'all') {
        items = items.filter(i => i.status === params.status)
      }
      return items.sort((a, b) => a.display_order - b.display_order) as unknown as T
    }

    case 'getPortfolioLinks':
    case 'getAllPortfolioLinks': {
      let items = getLocalData<PortfolioLink[]>(LOCAL_STORAGE_KEYS.PORTFOLIO_LINKS, INITIAL_DEMO_PORTFOLIO_LINKS)
      if (params.portfolio_id) {
        items = items.filter(i => i.portfolio_id === params.portfolio_id)
      }
      if (params.status && params.status !== 'all') {
        items = items.filter(i => i.status === params.status)
      }
      return items.sort((a, b) => a.display_order - b.display_order) as unknown as T
    }

    case 'getExperiences':
    case 'getAllExperiences': {
      let items = getLocalData<Experience[]>(LOCAL_STORAGE_KEYS.EXPERIENCES, INITIAL_DEMO_EXPERIENCES)
      if (params.status && params.status !== 'all') {
        items = items.filter(i => i.status === params.status)
      }
      return items.sort((a, b) => a.display_order - b.display_order) as unknown as T
    }

    case 'getSocials':
    case 'getAllSocials': {
      let items = getLocalData<SocialPlatform[]>(LOCAL_STORAGE_KEYS.SOCIALS, INITIAL_DEMO_SOCIALS)
      if (params.status && params.status !== 'all') {
        items = items.filter(i => i.status === params.status)
      }
      return items.sort((a, b) => a.display_order - b.display_order) as unknown as T
    }

    case 'getSettings':
      return getLocalData<Settings>(LOCAL_STORAGE_KEYS.SETTINGS, INITIAL_DEMO_SETTINGS) as unknown as T

    case 'getActivityLogs':
      return getLocalData<ActivityLog[]>(LOCAL_STORAGE_KEYS.LOGS, INITIAL_DEMO_LOGS) as unknown as T

    default:
      return null as unknown as T
  }
}

function mutateMockData<T>(action: string, payload: any): T {
  switch (action) {
    case 'updateProfile': {
      const current = getLocalData<Profile>(LOCAL_STORAGE_KEYS.PROFILE, INITIAL_DEMO_PROFILE)
      const updated = { ...current, ...payload, updated_at: new Date().toISOString() }
      setLocalData(LOCAL_STORAGE_KEYS.PROFILE, updated)
      appendMockLog('UPDATE', 'Profile', 'Updated profile information')
      return updated as unknown as T
    }

    // Category Mutations
    case 'createCategory': {
      const cats = getLocalData<PortfolioCategory[]>(LOCAL_STORAGE_KEYS.CATEGORIES, INITIAL_DEMO_CATEGORIES)
      const newCat: PortfolioCategory = {
        ...payload,
        id: 'cat_' + Date.now(),
        slug: payload.slug || String(payload.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        display_order: Number(payload.display_order) || cats.length + 1,
        status: payload.status || 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      cats.push(newCat)
      setLocalData(LOCAL_STORAGE_KEYS.CATEGORIES, cats)
      appendMockLog('CREATE', `CATEGORY: ${newCat.name}`, 'Created new category')
      return newCat as unknown as T
    }

    case 'updateCategory': {
      const cats = getLocalData<PortfolioCategory[]>(LOCAL_STORAGE_KEYS.CATEGORIES, INITIAL_DEMO_CATEGORIES)
      const idx = cats.findIndex(c => c.id === payload.id)
      if (idx !== -1) {
        cats[idx] = { ...cats[idx], ...payload, updated_at: new Date().toISOString() }
        setLocalData(LOCAL_STORAGE_KEYS.CATEGORIES, cats)
        appendMockLog('UPDATE', `CATEGORY: ${cats[idx].name}`, 'Updated category')
        return cats[idx] as unknown as T
      }
      return payload as unknown as T
    }

    case 'deleteCategory': {
      const cats = getLocalData<PortfolioCategory[]>(LOCAL_STORAGE_KEYS.CATEGORIES, INITIAL_DEMO_CATEGORIES)
      const filtered = cats.filter(c => c.id !== payload.id)
      setLocalData(LOCAL_STORAGE_KEYS.CATEGORIES, filtered)
      appendMockLog('DELETE', `CATEGORY: ${payload.id}`, 'Deleted category')
      return { success: true } as unknown as T
    }

    case 'reorderCategories': {
      const cats = getLocalData<PortfolioCategory[]>(LOCAL_STORAGE_KEYS.CATEGORIES, INITIAL_DEMO_CATEGORIES)
      const orderMap = payload.orderMap || {}
      cats.forEach(c => {
        if (orderMap[c.id] !== undefined) {
          c.display_order = orderMap[c.id]
        }
      })
      cats.sort((a, b) => a.display_order - b.display_order)
      setLocalData(LOCAL_STORAGE_KEYS.CATEGORIES, cats)
      appendMockLog('REORDER', 'Categories', 'Reordered category positions')
      return { success: true } as unknown as T
    }

    // Portfolio Mutations
    case 'createPortfolio': {
      const items = getLocalData<PortfolioItem[]>(LOCAL_STORAGE_KEYS.PORTFOLIO, INITIAL_DEMO_PORTFOLIO)
      if (payload.featured && payload.category_id) {
        items.forEach(i => {
          if (i.category_id === payload.category_id) i.featured = false
        })
      }
      const newItem: PortfolioItem = {
        ...payload,
        id: 'port_' + Date.now(),
        display_order: Number(payload.display_order) || items.length + 1,
        status: payload.status || 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      items.push(newItem)
      setLocalData(LOCAL_STORAGE_KEYS.PORTFOLIO, items)
      appendMockLog('CREATE', `PORTFOLIO: ${newItem.title}`, 'Added new portfolio project')
      return newItem as unknown as T
    }

    case 'updatePortfolio': {
      const items = getLocalData<PortfolioItem[]>(LOCAL_STORAGE_KEYS.PORTFOLIO, INITIAL_DEMO_PORTFOLIO)
      const idx = items.findIndex(i => i.id === payload.id)
      if (idx !== -1) {
        if (payload.featured && (payload.category_id || items[idx].category_id)) {
          const targetCat = payload.category_id || items[idx].category_id
          items.forEach(i => {
            if (i.category_id === targetCat && i.id !== payload.id) i.featured = false
          })
        }
        items[idx] = { ...items[idx], ...payload, updated_at: new Date().toISOString() }
        setLocalData(LOCAL_STORAGE_KEYS.PORTFOLIO, items)
        appendMockLog('UPDATE', `PORTFOLIO: ${items[idx].title}`, 'Updated project details')
        return items[idx] as unknown as T
      }
      return payload as unknown as T
    }

    case 'deletePortfolio': {
      const items = getLocalData<PortfolioItem[]>(LOCAL_STORAGE_KEYS.PORTFOLIO, INITIAL_DEMO_PORTFOLIO)
      const filtered = items.filter(i => i.id !== payload.id)
      setLocalData(LOCAL_STORAGE_KEYS.PORTFOLIO, filtered)
      appendMockLog('DELETE', `PORTFOLIO: ${payload.id}`, 'Deleted portfolio item')
      return { success: true } as unknown as T
    }

    case 'setFeaturedPortfolio': {
      const items = getLocalData<PortfolioItem[]>(LOCAL_STORAGE_KEYS.PORTFOLIO, INITIAL_DEMO_PORTFOLIO)
      items.forEach(i => {
        if (i.category_id === payload.category_id) {
          i.featured = (i.id === payload.portfolio_id)
        }
      })
      setLocalData(LOCAL_STORAGE_KEYS.PORTFOLIO, items)
      appendMockLog('FEATURE', `PORTFOLIO: ${payload.portfolio_id}`, 'Set featured project')
      return { success: true } as unknown as T
    }

    // Portfolio Media Mutations
    case 'addPortfolioMedia': {
      const items = getLocalData<PortfolioMedia[]>(LOCAL_STORAGE_KEYS.PORTFOLIO_MEDIA, INITIAL_DEMO_PORTFOLIO_MEDIA)
      const newMedia: PortfolioMedia = {
        ...payload,
        id: 'media_' + Date.now(),
        display_order: Number(payload.display_order) || items.filter(m => m.portfolio_id === payload.portfolio_id).length + 1,
        status: payload.status || 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      items.push(newMedia)
      setLocalData(LOCAL_STORAGE_KEYS.PORTFOLIO_MEDIA, items)
      appendMockLog('CREATE', `MEDIA: ${newMedia.title || newMedia.id}`, 'Added media to project')
      return newMedia as unknown as T
    }

    case 'updatePortfolioMedia': {
      const items = getLocalData<PortfolioMedia[]>(LOCAL_STORAGE_KEYS.PORTFOLIO_MEDIA, INITIAL_DEMO_PORTFOLIO_MEDIA)
      const idx = items.findIndex(i => i.id === payload.id)
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...payload, updated_at: new Date().toISOString() }
        setLocalData(LOCAL_STORAGE_KEYS.PORTFOLIO_MEDIA, items)
        appendMockLog('UPDATE', `MEDIA: ${items[idx].title || items[idx].id}`, 'Updated project media')
        return items[idx] as unknown as T
      }
      return payload as unknown as T
    }

    case 'deletePortfolioMedia': {
      const items = getLocalData<PortfolioMedia[]>(LOCAL_STORAGE_KEYS.PORTFOLIO_MEDIA, INITIAL_DEMO_PORTFOLIO_MEDIA)
      const filtered = items.filter(i => i.id !== payload.id)
      setLocalData(LOCAL_STORAGE_KEYS.PORTFOLIO_MEDIA, filtered)
      appendMockLog('DELETE', `MEDIA: ${payload.id}`, 'Deleted project media')
      return { success: true } as unknown as T
    }

    case 'reorderPortfolioMedia': {
      const items = getLocalData<PortfolioMedia[]>(LOCAL_STORAGE_KEYS.PORTFOLIO_MEDIA, INITIAL_DEMO_PORTFOLIO_MEDIA)
      const orderMap: { id: string; order: number }[] = payload.orderMap || []
      orderMap.forEach(({ id, order }) => {
        const item = items.find(i => i.id === id)
        if (item) item.display_order = order
      })
      items.sort((a, b) => a.display_order - b.display_order)
      setLocalData(LOCAL_STORAGE_KEYS.PORTFOLIO_MEDIA, items)
      appendMockLog('REORDER', 'Portfolio Media', 'Reordered media items')
      return { success: true } as unknown as T
    }

    // Portfolio Links Mutations
    case 'addPortfolioLink': {
      const items = getLocalData<PortfolioLink[]>(LOCAL_STORAGE_KEYS.PORTFOLIO_LINKS, INITIAL_DEMO_PORTFOLIO_LINKS)
      const newLink: PortfolioLink = {
        ...payload,
        id: 'link_' + Date.now(),
        display_order: Number(payload.display_order) || items.filter(l => l.portfolio_id === payload.portfolio_id).length + 1,
        status: payload.status || 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      items.push(newLink)
      setLocalData(LOCAL_STORAGE_KEYS.PORTFOLIO_LINKS, items)
      appendMockLog('CREATE', `LINK: ${newLink.label || newLink.id}`, 'Added reference link to project')
      return newLink as unknown as T
    }

    case 'updatePortfolioLink': {
      const items = getLocalData<PortfolioLink[]>(LOCAL_STORAGE_KEYS.PORTFOLIO_LINKS, INITIAL_DEMO_PORTFOLIO_LINKS)
      const idx = items.findIndex(i => i.id === payload.id)
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...payload, updated_at: new Date().toISOString() }
        setLocalData(LOCAL_STORAGE_KEYS.PORTFOLIO_LINKS, items)
        appendMockLog('UPDATE', `LINK: ${items[idx].label || items[idx].id}`, 'Updated reference link')
        return items[idx] as unknown as T
      }
      return payload as unknown as T
    }

    case 'deletePortfolioLink': {
      const items = getLocalData<PortfolioLink[]>(LOCAL_STORAGE_KEYS.PORTFOLIO_LINKS, INITIAL_DEMO_PORTFOLIO_LINKS)
      const filtered = items.filter(i => i.id !== payload.id)
      setLocalData(LOCAL_STORAGE_KEYS.PORTFOLIO_LINKS, filtered)
      appendMockLog('DELETE', `LINK: ${payload.id}`, 'Deleted reference link')
      return { success: true } as unknown as T
    }

    // Experience Mutations
    case 'createExperience': {
      const items = getLocalData<Experience[]>(LOCAL_STORAGE_KEYS.EXPERIENCES, INITIAL_DEMO_EXPERIENCES)
      const newExp: Experience = {
        ...payload,
        id: 'exp_' + Date.now(),
        display_order: Number(payload.display_order) || items.length + 1,
        status: payload.status || 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      items.push(newExp)
      setLocalData(LOCAL_STORAGE_KEYS.EXPERIENCES, items)
      appendMockLog('CREATE', `EXPERIENCE: ${newExp.position} at ${newExp.company}`, 'Created experience')
      return newExp as unknown as T
    }

    case 'updateExperience': {
      const items = getLocalData<Experience[]>(LOCAL_STORAGE_KEYS.EXPERIENCES, INITIAL_DEMO_EXPERIENCES)
      const idx = items.findIndex(i => i.id === payload.id)
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...payload, updated_at: new Date().toISOString() }
        setLocalData(LOCAL_STORAGE_KEYS.EXPERIENCES, items)
        appendMockLog('UPDATE', `EXPERIENCE: ${items[idx].company}`, 'Updated experience')
        return items[idx] as unknown as T
      }
      return payload as unknown as T
    }

    case 'deleteExperience': {
      const items = getLocalData<Experience[]>(LOCAL_STORAGE_KEYS.EXPERIENCES, INITIAL_DEMO_EXPERIENCES)
      const filtered = items.filter(i => i.id !== payload.id)
      setLocalData(LOCAL_STORAGE_KEYS.EXPERIENCES, filtered)
      appendMockLog('DELETE', `EXPERIENCE: ${payload.id}`, 'Deleted experience')
      return { success: true } as unknown as T
    }

    case 'reorderExperiences': {
      const items = getLocalData<Experience[]>(LOCAL_STORAGE_KEYS.EXPERIENCES, INITIAL_DEMO_EXPERIENCES)
      const orderedIds: string[] = payload.orderedIds || []
      orderedIds.forEach((id, index) => {
        const item = items.find(i => i.id === id)
        if (item) item.display_order = index + 1
      })
      items.sort((a, b) => a.display_order - b.display_order)
      setLocalData(LOCAL_STORAGE_KEYS.EXPERIENCES, items)
      appendMockLog('REORDER', 'Experience', 'Reordered experiences')
      return { success: true } as unknown as T
    }

    // Socials Mutations
    case 'createSocial': {
      const items = getLocalData<SocialPlatform[]>(LOCAL_STORAGE_KEYS.SOCIALS, INITIAL_DEMO_SOCIALS)
      const newSoc: SocialPlatform = {
        ...payload,
        id: 'soc_' + Date.now(),
        display_order: Number(payload.display_order) || items.length + 1,
        status: payload.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      items.push(newSoc)
      setLocalData(LOCAL_STORAGE_KEYS.SOCIALS, items)
      appendMockLog('CREATE', `SOCIAL: ${newSoc.platform}`, 'Created social platform')
      return newSoc as unknown as T
    }

    case 'updateSocial': {
      const items = getLocalData<SocialPlatform[]>(LOCAL_STORAGE_KEYS.SOCIALS, INITIAL_DEMO_SOCIALS)
      const idx = items.findIndex(i => i.id === payload.id)
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...payload, updated_at: new Date().toISOString() }
        setLocalData(LOCAL_STORAGE_KEYS.SOCIALS, items)
        appendMockLog('UPDATE', `SOCIAL: ${items[idx].platform}`, 'Updated social platform')
        return items[idx] as unknown as T
      }
      return payload as unknown as T
    }

    case 'deleteSocial': {
      const items = getLocalData<SocialPlatform[]>(LOCAL_STORAGE_KEYS.SOCIALS, INITIAL_DEMO_SOCIALS)
      const filtered = items.filter(i => i.id !== payload.id)
      setLocalData(LOCAL_STORAGE_KEYS.SOCIALS, filtered)
      appendMockLog('DELETE', `SOCIAL: ${payload.id}`, 'Deleted social platform')
      return { success: true } as unknown as T
    }

    case 'reorderSocials': {
      const items = getLocalData<SocialPlatform[]>(LOCAL_STORAGE_KEYS.SOCIALS, INITIAL_DEMO_SOCIALS)
      const orderedIds: string[] = payload.orderedIds || []
      orderedIds.forEach((id, index) => {
        const item = items.find(i => i.id === id)
        if (item) item.display_order = index + 1
      })
      items.sort((a, b) => a.display_order - b.display_order)
      setLocalData(LOCAL_STORAGE_KEYS.SOCIALS, items)
      appendMockLog('REORDER', 'Socials', 'Reordered social platforms')
      return { success: true } as unknown as T
    }

    case 'updateSettings': {
      const current = getLocalData<Settings>(LOCAL_STORAGE_KEYS.SETTINGS, INITIAL_DEMO_SETTINGS)
      const updated = { ...current, ...payload }
      setLocalData(LOCAL_STORAGE_KEYS.SETTINGS, updated)
      appendMockLog('UPDATE', 'Settings', 'Updated website settings')
      return updated as unknown as T
    }

    default:
      return payload as unknown as T
  }
}

function appendMockLog(action: string, target: string, details: string) {
  const logs = getLocalData<ActivityLog[]>(LOCAL_STORAGE_KEYS.LOGS, INITIAL_DEMO_LOGS)
  const newLog: ActivityLog = {
    id: 'log_' + Date.now(),
    admin: 'admin',
    action,
    target,
    timestamp: new Date().toISOString(),
    details
  }
  logs.unshift(newLog)
  setLocalData(LOCAL_STORAGE_KEYS.LOGS, logs.slice(0, 30))
}

// Portfolio Media Service Helpers
export async function getPortfolioMediaApi(portfolioId?: string, status: string = 'published') {
  const params: Record<string, string> = { status }
  if (portfolioId) params.portfolio_id = portfolioId
  return apiGet<PortfolioMedia[]>('getPortfolioMedia', params)
}

export async function addPortfolioMediaApi(data: Partial<PortfolioMedia>) {
  return apiPost<PortfolioMedia>('addPortfolioMedia', data)
}

export async function updatePortfolioMediaApi(id: string, data: Partial<PortfolioMedia>) {
  return apiPost<PortfolioMedia>('updatePortfolioMedia', { id, ...data })
}

export async function deletePortfolioMediaApi(id: string) {
  return apiPost<{ success: boolean }>('deletePortfolioMedia', { id })
}

export async function reorderPortfolioMediaApi(orderMap: { id: string; order: number }[]) {
  return apiPost<{ success: boolean }>('reorderPortfolioMedia', { orderMap })
}

// Portfolio Links Service Helpers
export async function getPortfolioLinksApi(portfolioId?: string, status: string = 'published') {
  const params: Record<string, string> = { status }
  if (portfolioId) params.portfolio_id = portfolioId
  return apiGet<PortfolioLink[]>('getPortfolioLinks', params)
}

export async function addPortfolioLinkApi(data: Partial<PortfolioLink>) {
  return apiPost<PortfolioLink>('addPortfolioLink', data)
}

export async function updatePortfolioLinkApi(id: string, data: Partial<PortfolioLink>) {
  return apiPost<PortfolioLink>('updatePortfolioLink', { id, ...data })
}

export async function deletePortfolioLinkApi(id: string) {
  return apiPost<{ success: boolean }>('deletePortfolioLink', { id })
}