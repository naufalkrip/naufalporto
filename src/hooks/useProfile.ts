import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost } from '../services/api'
import { onRealtimeSync, emitRealtimeUpdate } from '../services/realtimeSync'
import type { Profile } from '../types'

export function useProfile(autoSync: boolean = false) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  const fetchProfile = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true)
    try {
      const { data, error: apiErr, isDemo: demoFlag } = await apiGet<Profile>('getProfile')
      setIsDemo(demoFlag)
      if (apiErr) {
        setError(apiErr)
      } else if (data) {
        setProfile(data)
        setError(null)
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load profile')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()

    // Realtime sync: immediately reload when profile updates anywhere
    const unsubscribe = onRealtimeSync((entity) => {
      if (entity === 'profile' || entity === 'all') {
        fetchProfile(true)
      }
    })

    let interval: ReturnType<typeof setInterval> | null = null
    if (autoSync) {
      interval = setInterval(() => {
        fetchProfile(true)
      }, 15000)
    }

    return () => {
      unsubscribe()
      if (interval) clearInterval(interval)
    }
  }, [fetchProfile, autoSync])

  const updateProfileData = async (updates: Partial<Profile>): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: apiErr } = await apiPost<Profile>('updateProfile', updates)
      if (apiErr) {
        setError(apiErr)
        return false
      }
      if (data) {
        setProfile(prev => ({ ...prev, ...data } as Profile))
        emitRealtimeUpdate('profile')
        return true
      }
      return false
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    loading,
    error,
    isDemo,
    refresh: () => fetchProfile(false),
    updateProfile: updateProfileData
  }
}