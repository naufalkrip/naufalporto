import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost } from '../services/api'
import { onRealtimeSync, emitRealtimeUpdate } from '../services/realtimeSync'
import type { PortfolioCategory } from '../types'

export function useCategories(statusFilter: 'published' | 'all' = 'published', autoSync: boolean = false) {
  const [categories, setCategories] = useState<PortfolioCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  const fetchCategories = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true)
    try {
      const action = statusFilter === 'all' ? 'getAllCategories' : 'getCategories'
      const params: Record<string, string> = statusFilter === 'all' ? {} : { status: statusFilter }
      const { data, error: apiErr, isDemo: demoFlag } = await apiGet<PortfolioCategory[]>(action, params)

      setIsDemo(demoFlag)
      if (apiErr) {
        setError(apiErr)
      } else if (data) {
        setCategories(data.sort((a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99)))
        setError(null)
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load categories')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchCategories()

    // Realtime sync: immediately reload when categories or all entities update
    const unsubscribe = onRealtimeSync((entity) => {
      if (entity === 'categories' || entity === 'all') {
        fetchCategories(true)
      }
    })

    let interval: ReturnType<typeof setInterval> | null = null
    if (autoSync) {
      interval = setInterval(() => {
        fetchCategories(true)
      }, 15000)
    }

    return () => {
      unsubscribe()
      if (interval) clearInterval(interval)
    }
  }, [fetchCategories, autoSync])

  const createCategory = async (newCat: Omit<PortfolioCategory, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    setLoading(true)
    try {
      const { data, error: apiErr } = await apiPost<PortfolioCategory>('createCategory', newCat)
      if (apiErr) {
        setError(apiErr)
        return false
      }
      if (data) {
        await fetchCategories(true)
        emitRealtimeUpdate('categories')
        return true
      }
      return false
    } catch (err: any) {
      setError(err.message || 'Failed to create category')
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateCategory = async (id: string, updates: Partial<PortfolioCategory>): Promise<boolean> => {
    setLoading(true)
    try {
      const { data, error: apiErr } = await apiPost<PortfolioCategory>('updateCategory', { id, ...updates })
      if (apiErr) {
        setError(apiErr)
        return false
      }
      if (data) {
        await fetchCategories(true)
        emitRealtimeUpdate('categories')
        return true
      }
      return false
    } catch (err: any) {
      setError(err.message || 'Failed to update category')
      return false
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async (id: string): Promise<boolean> => {
    setLoading(true)
    try {
      const { error: apiErr } = await apiPost('deleteCategory', { id })
      if (apiErr) {
        setError(apiErr)
        return false
      }
      setCategories(prev => prev.filter(c => c.id !== id))
      emitRealtimeUpdate('categories')
      return true
    } catch (err: any) {
      setError(err.message || 'Failed to delete category')
      return false
    } finally {
      setLoading(false)
    }
  }

  const reorderCategories = async (orderMap: { id: string; order: number }[]): Promise<boolean> => {
    try {
      const { error: apiErr } = await apiPost('reorderCategories', { orderMap })
      if (!apiErr) {
        await fetchCategories(true)
        emitRealtimeUpdate('categories')
        return true
      }
      return false
    } catch {
      return false
    }
  }

  return {
    categories,
    loading,
    error,
    isDemo,
    refresh: () => fetchCategories(false),
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories
  }
}
