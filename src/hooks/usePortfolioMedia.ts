import { useState, useEffect, useCallback } from 'react'
import {
  getPortfolioMediaApi,
  addPortfolioMediaApi,
  updatePortfolioMediaApi,
  deletePortfolioMediaApi,
  reorderPortfolioMediaApi
} from '../services/api'
import type { PortfolioMedia } from '../types'

export function usePortfolioMedia(portfolioId?: string, statusFilter: 'published' | 'all' = 'published') {
  const [media, setMedia] = useState<PortfolioMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMedia = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true)
    try {
      const { data, error: apiErr } = await getPortfolioMediaApi(portfolioId, statusFilter)
      if (apiErr) {
        setError(apiErr)
      } else if (data) {
        setMedia(data.sort((a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99)))
        setError(null)
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load project media')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [portfolioId, statusFilter])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  const addMedia = async (newMedia: Partial<PortfolioMedia>): Promise<boolean> => {
    setLoading(true)
    try {
      const { data, error: apiErr } = await addPortfolioMediaApi(newMedia)
      if (apiErr || !data) {
        setError(apiErr || 'Failed to add media')
        return false
      }
      await fetchMedia(true)
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateMedia = async (id: string, updates: Partial<PortfolioMedia>): Promise<boolean> => {
    setLoading(true)
    try {
      const { error: apiErr } = await updatePortfolioMediaApi(id, updates)
      if (apiErr) {
        setError(apiErr)
        return false
      }
      await fetchMedia(true)
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const deleteMedia = async (id: string): Promise<boolean> => {
    setLoading(true)
    try {
      const { error: apiErr } = await deletePortfolioMediaApi(id)
      if (apiErr) {
        setError(apiErr)
        return false
      }
      await fetchMedia(true)
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const reorderMedia = async (orderMap: { id: string; order: number }[]): Promise<boolean> => {
    try {
      const { error: apiErr } = await reorderPortfolioMediaApi(orderMap)
      if (apiErr) {
        setError(apiErr)
        return false
      }
      await fetchMedia(true)
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    }
  }

  return {
    media,
    loading,
    error,
    addMedia,
    updateMedia,
    deleteMedia,
    reorderMedia,
    refreshMedia: () => fetchMedia(false)
  }
}
