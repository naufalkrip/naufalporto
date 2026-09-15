import { useState, useEffect, useCallback } from 'react'
import {
  getPortfolioLinksApi,
  addPortfolioLinkApi,
  updatePortfolioLinkApi,
  deletePortfolioLinkApi
} from '../services/api'
import type { PortfolioLink } from '../types'

export function usePortfolioLinks(portfolioId?: string, statusFilter: 'published' | 'all' = 'published') {
  const [links, setLinks] = useState<PortfolioLink[]>([]);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLinks = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true)
    try {
      const { data, error: apiErr } = await getPortfolioLinksApi(portfolioId, statusFilter)
      if (apiErr) {
        setError(apiErr)
      } else if (data) {
        setLinks(data.sort((a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99)))
        setError(null)
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load reference links')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [portfolioId, statusFilter])

  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  const addLink = async (newLink: Partial<PortfolioLink>): Promise<boolean> => {
    setLoading(true)
    try {
      const { data, error: apiErr } = await addPortfolioLinkApi(newLink)
      if (apiErr || !data) {
        setError(apiErr || 'Failed to add link')
        return false
      }
      await fetchLinks(true)
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateLink = async (id: string, updates: Partial<PortfolioLink>): Promise<boolean> => {
    setLoading(true)
    try {
      const { error: apiErr } = await updatePortfolioLinkApi(id, updates)
      if (apiErr) {
        setError(apiErr)
        return false
      }
      await fetchLinks(true)
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const deleteLink = async (id: string): Promise<boolean> => {
    setLoading(true)
    try {
      const { error: apiErr } = await deletePortfolioLinkApi(id)
      if (apiErr) {
        setError(apiErr)
        return false
      }
      await fetchLinks(true)
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    links,
    loading,
    error,
    addLink,
    updateLink,
    deleteLink,
    refreshLinks: () => fetchLinks(false)
  }
}
