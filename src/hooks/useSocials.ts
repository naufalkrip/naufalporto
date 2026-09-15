import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost } from '../services/api'
import type { SocialPlatform } from '../types'

export function useSocials(statusFilter: 'active' | 'all' = 'active', autoSync: boolean = false) {
  const [socials, setSocials] = useState<SocialPlatform[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  const fetchSocials = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true)
    try {
      const action = statusFilter === 'all' ? 'getAllSocials' : 'getSocials'
      const params: Record<string, string> = statusFilter === 'all' ? {} : { status: statusFilter }
      const { data, error: apiErr, isDemo: demoFlag } = await apiGet<SocialPlatform[]>(action, params)

      setIsDemo(demoFlag)
      if (apiErr) {
        setError(apiErr)
      } else if (data) {
        setSocials(data.sort((a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99)))
        setError(null)
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load social platforms')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchSocials()

    if (autoSync) {
      const interval = setInterval(() => {
        fetchSocials(true)
      }, 25000)
      return () => clearInterval(interval)
    }
  }, [fetchSocials, autoSync])

  const createSocial = async (
    newSoc: Omit<SocialPlatform, 'id' | 'created_at' | 'updated_at'>
  ): Promise<boolean> => {
    setLoading(true)
    try {
      const { data, error: apiErr } = await apiPost<SocialPlatform>('createSocial', newSoc)
      if (apiErr) {
        setError(apiErr)
        return false
      }
      if (data) {
        await fetchSocials(true)
        return true
      }
      return false
    } catch (err: any) {
      setError(err.message || 'Failed to create social platform')
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateSocial = async (id: string, updates: Partial<SocialPlatform>): Promise<boolean> => {
    setLoading(true)
    try {
      const { error: apiErr } = await apiPost('updateSocial', { id, ...updates })
      if (apiErr) {
        setError(apiErr)
        return false
      }
      await fetchSocials(true)
      return true
    } catch (err: any) {
      setError(err.message || 'Failed to update social platform')
      return false
    } finally {
      setLoading(false)
    }
  }

  const deleteSocial = async (id: string): Promise<boolean> => {
    setLoading(true)
    try {
      const { error: apiErr } = await apiPost('deleteSocial', { id })
      if (apiErr) {
        setError(apiErr)
        return false
      }
      await fetchSocials(true)
      return true
    } catch (err: any) {
      setError(err.message || 'Failed to delete social platform')
      return false
    } finally {
      setLoading(false)
    }
  }

  const reorderSocials = async (orderedIds: string[]): Promise<boolean> => {
    try {
      const { error: apiErr } = await apiPost('reorderSocials', { orderedIds })
      if (apiErr) {
        setError(apiErr)
        return false
      }
      await fetchSocials(true)
      return true
    } catch (err: any) {
      setError(err.message || 'Failed to reorder social platforms')
      return false
    }
  }

  return {
    socials,
    loading,
    error,
    isDemo,
    refresh: () => fetchSocials(false),
    createSocial,
    updateSocial,
    deleteSocial,
    reorderSocials
  }
}
