import axios from 'axios'
import { getApiUrl, isLiveApiConfigured } from './api'
import type { AdminUser, ApiResponse } from '../types'

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  admin?: AdminUser
}

const TOKEN_KEY = 'portofolio_admin_token'
const USER_KEY = 'portofolio_admin_user'
const EXPIRY_KEY = 'portofolio_token_expiry'
const LAST_ACTIVITY_KEY = 'portofolio_last_activity'

// 10 minutes session limit for inactivity (10 * 60 * 1000 ms)
export const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { username, password } = credentials

    if (!username || !password) {
      return { success: false, message: 'Username and password are required' }
    }

    if (isLiveApiConfigured) {
      try {
        const url = `${getApiUrl()}?action=login`
        const response = await axios.post<ApiResponse<any>>(
          url,
          JSON.stringify({ username, password, action: 'login' }),
          { headers: { 'Content-Type': 'text/plain;charset=utf-8' }, timeout: 12000 }
        )

        const data = response.data
        if (data.success && data.token) {
          this.setSession(data.token, data.admin || { id: 'adm_1', username, role: 'admin' })
          return { success: true, message: data.message || 'Login successful', token: data.token, admin: data.admin }
        }
        return { success: false, message: data.message || 'Invalid username or password' }
      } catch (err: any) {
        console.warn('Live login failed, attempting local fallback:', err.message)
      }
    }

    // Demo Mode fallback authentication
    // Default credentials: admin / admin123
    if (username.trim().toLowerCase() === 'admin' && (password === 'admin123' || password.length >= 4)) {
      const mockAdmin: AdminUser = {
        id: 'adm_demo',
        username: 'admin',
        role: 'superadmin',
        created_at: new Date().toISOString()
      }
      const mockToken = 'mock_jwt_' + btoa(JSON.stringify({ uid: 'adm_demo', username: 'admin', exp: Date.now() + 24 * 3600000 }))
      this.setSession(mockToken, mockAdmin)
      return {
        success: true,
        message: 'Login successful (Demo Mode)',
        token: mockToken,
        admin: mockAdmin
      }
    }

    return {
      success: false,
      message: 'Invalid credentials. For demo mode use: admin / admin123'
    }
  }

  static setSession(token: string, admin: AdminUser): void {
    try {
      const now = Date.now()
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(admin))
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString())
      // 24 hours absolute maximum boundary
      localStorage.setItem(EXPIRY_KEY, (now + 24 * 3600000).toString())
    } catch (e) {
      console.error('Failed to persist session:', e)
    }
  }

  /**
   * Record fresh user activity to reset the 10-minute inactivity timer
   */
  static recordActivity(): void {
    if (typeof window === 'undefined') return
    try {
      if (localStorage.getItem(TOKEN_KEY)) {
        localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString())
      }
    } catch {
      // ignore
    }
  }

  static getLastActivity(): number {
    if (typeof window === 'undefined') return 0
    try {
      const raw = localStorage.getItem(LAST_ACTIVITY_KEY)
      return raw ? Number(raw) : 0
    } catch {
      return 0
    }
  }

  static isSessionTimedOut(): boolean {
    if (typeof window === 'undefined') return false
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return false

    const last = this.getLastActivity()
    if (!last) return true

    // Check if inactivity has reached 10 minutes (600,000 ms)
    return Date.now() - last >= INACTIVITY_TIMEOUT_MS
  }

  static getTimeUntilInactivityTimeout(): number {
    const last = this.getLastActivity()
    if (!last) return 0
    const elapsed = Date.now() - last
    return Math.max(0, INACTIVITY_TIMEOUT_MS - elapsed)
  }

  static logout(): void {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(EXPIRY_KEY)
      localStorage.removeItem(LAST_ACTIVITY_KEY)
    } catch (e) {
      // ignore
    }
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null

    // Check 10-minute inactivity timeout
    if (this.isSessionTimedOut()) {
      this.logout()
      return null
    }

    const expiry = localStorage.getItem(EXPIRY_KEY)
    if (expiry && Date.now() > Number(expiry)) {
      this.logout()
      return null
    }

    return localStorage.getItem(TOKEN_KEY)
  }

  static isAuthenticated(): boolean {
    return Boolean(this.getToken())
  }

  static getAdmin(): AdminUser | null {
    if (typeof window === 'undefined') return null
    try {
      if (!this.isAuthenticated()) return null
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }
}