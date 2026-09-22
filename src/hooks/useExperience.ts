import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost } from '../services/api'
import { onRealtimeSync, emitRealtimeUpdate } from '../services/realtimeSync'
import type { Experience } from '../types'

export function useExperience(statusFilter: 'published' | 'all' = 'published', autoSync: boolean = false) {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  const fetchExperiences = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true)
    try {
      const action = statusFilter === 'all' ? 'getAllExperiences' : 'getExperiences'
      const params: Record<string, string> = statusFilter === 'all' ? {} : { status: statusFilter }
      const { data, error: apiErr, isDemo: demoFlag } = await apiGet<Experience[]>(action, params)

      setIsDemo(demoFlag)
      if (apiErr) {
        setError(apiErr)
      } else if (data) {
        setExperiences(
          data.sort((a, b) => {
            const orderA = Number(a.display_order) || 99
            const orderB = Number(b.display_order) || 99
            if (orderA !== orderB) return orderA - orderB
            const yearA = Number(a.year_start) || 0
            const yearB = Number(b.year_start) || 0
            return yearB - yearA
          })
        )
        setError(null)
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load experiences')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchExperiences()

    // Realtime sync: reload immediately when experiences change
    const unsubscribe = onRealtimeSync((entity) => {
      if (entity === 'experiences' || entity === 'all') {
        fetchExperiences(true)
      }
    })

    let interval: ReturnType<typeof setInterval> | null = null
    if (autoSync) {
      interval = setInterval(() => {
        fetchExperiences(true)
      }, 15000)
    }

    return () => {
      unsubscribe()
      if (interval) clearInterval(interval)
    }
  }, [fetchExperiences, autoSync])

  const createExperience = async (
    newExp: Omit<Experience, 'id' | 'created_at' | 'updated_at'>
  ): Promise<boolean> => {
    setLoading(true)
    try {
      const { data, error: apiErr } = await apiPost<Experience>('createExperience', newExp)
      if (apiErr) {
        setError(apiErr)
        return false
      }
      if (data) {
        await fetchExperiences(true)
        emitRealtimeUpdate('experiences')
        return true
      }
      return false
    } catch (err: any) {
      setError(err.message || 'Failed to create experience')
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateExperience = async (id: string, updates: Partial<Experience>): Promise<boolean> => {
    setLoading(true)
    try {
      const { error: apiErr } = await apiPost('updateExperience', { id, ...updates })
      if (apiErr) {
        setError(apiErr)
        return false
      }
      await fetchExperiences(true)
      emitRealtimeUpdate('experiences')
      return true
    } catch (err: any) {
      setError(err.message || 'Failed to update experience')
      return false
    } finally {
      setLoading(false)
    }
  }

  const deleteExperience = async (id: string): Promise<boolean> => {
    setLoading(true)
    try {
      const { error: apiErr } = await apiPost('deleteExperience', { id })
      if (apiErr) {
        setError(apiErr)
        return false
      }
      await fetchExperiences(true)
      emitRealtimeUpdate('experiences')
      return true
    } catch (err: any) {
      setError(err.message || 'Failed to delete experience')
      return false
    } finally {
      setLoading(false)
    }
  }

  const reorderExperiences = async (orderedIds: string[]): Promise<boolean> => {
    try {
      const { error: apiErr } = await apiPost('reorderExperiences', { orderedIds })
      if (apiErr) {
        setError(apiErr)
        return false
      }
      await fetchExperiences(true)
      emitRealtimeUpdate('experiences')
      return true
    } catch (err: any) {
      setError(err.message || 'Failed to reorder experiences')
      return false
    }
  }

  return {
    experiences,
    loading,
    error,
    isDemo,
    refresh: () => fetchExperiences(false),
    createExperience,
    updateExperience,
    deleteExperience,
    reorderExperiences
  }
}
