import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost } from '../services/api'
import type { PortfolioItem } from '../types'

export function usePortfolio(statusFilter: 'published' | 'all' = 'published', autoSync: boolean = false, categoryId?: string) {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  const fetchItems = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true)
    try {
      const action = statusFilter === 'all' ? 'getAllPortfolio' : 'getPortfolio'
      const params: Record<string, string> = {}
      if (statusFilter !== 'all') params.status = statusFilter
      if (categoryId) params.category_id = categoryId

      const { data, error: apiErr, isDemo: demoFlag } = await apiGet<PortfolioItem[]>(action, params)

      setIsDemo(demoFlag)
      if (apiErr) {
        setError(apiErr)
      } else if (data) {
        setItems(data.sort((a, b) => {
          const featA = a.featured ? 1 : 0
          const featB = b.featured ? 1 : 0
          if (featA !== featB) return featB - featA
          return (Number(a.display_order) || 99) - (Number(b.display_order) || 99)
        }))
        setError(null)
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load portfolio')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [statusFilter, categoryId])

  useEffect(() => {
    fetchItems()

    if (autoSync) {
      const interval = setInterval(() => {
        fetchItems(true)
      }, 20000)
      return () => clearInterval(interval)
    }
  }, [fetchItems, autoSync])

  const createItem = async (newItem: Omit<PortfolioItem, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    setLoading(true)
    try {
      const { data, error: apiErr } = await apiPost<PortfolioItem>('createPortfolio', newItem)
      if (apiErr) {
        setError(apiErr)
        return false
      }
      if (data) {
        await fetchItems(true)
        return true
      }
      return false
    } catch (err: any) {
      setError(err.message || 'Failed to create item')
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateItem = async (id: string, updates: Partial<PortfolioItem>): Promise<boolean> => {
    setLoading(true)
    try {
      const { data, error: apiErr } = await apiPost<PortfolioItem>('updatePortfolio', { id, ...updates })
      if (apiErr) {
        setError(apiErr)
        return false
      }
      if (data) {
        await fetchItems(true)
        return true
      }
      return false
    } catch (err: any) {
      setError(err.message || 'Failed to update item')
      return false
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (id: string): Promise<boolean> => {
    setLoading(true)
    try {
      const { error: apiErr } = await apiPost('deletePortfolio', { id })
      if (apiErr) {
        setError(apiErr)
        return false
      }
      setItems(prev => prev.filter(i => i.id !== id))
      return true
    } catch (err: any) {
      setError(err.message || 'Failed to delete item')
      return false
    } finally {
      setLoading(false)
    }
  }

  const setFeatured = async (category_id: string, portfolio_id: string): Promise<boolean> => {
    try {
      const { error: apiErr } = await apiPost('setFeaturedPortfolio', { category_id, portfolio_id })
      if (!apiErr) {
        await fetchItems(true)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  return {
    items,
    loading,
    error,
    isDemo,
    refresh: () => fetchItems(false),
    createItem,
    updateItem,
    deleteItem,
    setFeatured
  }
}