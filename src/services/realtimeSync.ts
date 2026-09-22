/**
 * Realtime Synchronization Bus
 * Provides instant 0ms event broadcasting across components, routes, and browser tabs.
 */

export type RealtimeEntity =
  | 'portfolio'
  | 'categories'
  | 'profile'
  | 'experiences'
  | 'socials'
  | 'settings'
  | 'portfolio_media'
  | 'portfolio_links'
  | 'all'

type RealtimeListener = (entity: RealtimeEntity, payload?: any) => void

const listeners = new Set<RealtimeListener>()

// Cross-tab BroadcastChannel
let broadcastChannel: BroadcastChannel | null = null

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('portofolio_realtime_sync_channel')
    broadcastChannel.onmessage = (event: MessageEvent) => {
      if (event.data && event.data.entity) {
        notifyListeners(event.data.entity, event.data.payload)
      }
    }
  } catch (err) {
    console.warn('[RealtimeSync] BroadcastChannel init warning:', err)
  }
}

// Fallback: cross-tab storage event
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key && event.key.startsWith('portofolio_mock_')) {
      const entity = mapStorageKeyToEntity(event.key)
      notifyListeners(entity)
    }
  })
}

function mapStorageKeyToEntity(key: string): RealtimeEntity {
  if (key.includes('portfolio_media')) return 'portfolio_media'
  if (key.includes('portfolio_links')) return 'portfolio_links'
  if (key.includes('portfolio')) return 'portfolio'
  if (key.includes('categories')) return 'categories'
  if (key.includes('profile')) return 'profile'
  if (key.includes('experiences')) return 'experiences'
  if (key.includes('socials')) return 'socials'
  if (key.includes('settings')) return 'settings'
  return 'all'
}

function notifyListeners(entity: RealtimeEntity, payload?: any) {
  listeners.forEach((listener) => {
    try {
      listener(entity, payload)
    } catch (err) {
      console.error('[RealtimeSync] Listener error:', err)
    }
  })
}

/**
 * Emit an update to current window and all other browser tabs immediately.
 */
export function emitRealtimeUpdate(entity: RealtimeEntity, payload?: any) {
  // 1. Instant local listeners notification (0ms)
  notifyListeners(entity, payload)

  // 2. Broadcast to other open browser tabs
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        entity,
        payload,
        timestamp: Date.now()
      })
    } catch (e) {
      // ignore
    }
  }

  // 3. Dispatch native DOM event
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('portofolio_realtime_sync', {
          detail: { entity, payload, timestamp: Date.now() }
        })
      )
    } catch (e) {
      // ignore
    }
  }
}

/**
 * Subscribe to realtime update notifications.
 * Returns an unsubscribe callback.
 */
export function onRealtimeSync(callback: (entity: RealtimeEntity, payload?: any) => void): () => void {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}
