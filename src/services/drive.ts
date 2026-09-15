import axios from 'axios'
import { getApiUrl, isLiveApiConfigured } from './api'
import { AuthService } from './auth'
import type { ApiResponse } from '../types'

export interface UploadResult {
  success: boolean
  fileId: string
  url: string
  message: string
}

export class DriveService {
  /**
   * Compress and resize an image file using HTML Canvas
   */
  static async compressImage(file: File, maxDimension: number = 1200, quality: number = 0.85): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          let width = img.width
          let height = img.height

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width)
              width = maxDimension
            } else {
              width = Math.round((width * maxDimension) / height)
              height = maxDimension
            }
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(event.target?.result as string)
            return
          }

          ctx.drawImage(img, 0, 0, width, height)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
          resolve(compressedDataUrl)
        }
        img.onerror = (err) => reject(err)
      }
      reader.onerror = (err) => reject(err)
    })
  }

  /**
   * Upload image to Google Drive or fallback to local Base64 storage
   */
  static async uploadFile(
    file: File,
    folder: 'Profile' | 'Portfolio' | 'Gallery' = 'Portfolio'
  ): Promise<UploadResult> {
    try {
      // 1. Compress client-side
      const base64Data = await this.compressImage(file)
      const token = AuthService.getToken()

      // 2. Upload to Google Drive if live API configured
      if (isLiveApiConfigured) {
        const url = `${getApiUrl()}?action=uploadImage`
        const payload = {
          base64Data,
          folder,
          filename: file.name.replace(/[^a-zA-Z0-9._-]/g, '_'),
          mimeType: 'image/jpeg',
          token
        }

        const response = await axios.post<ApiResponse<{ fileId: string; url: string }>>(
          url,
          JSON.stringify(payload),
          { headers: { 'Content-Type': 'text/plain;charset=utf-8' }, timeout: 25000 }
        )

        if (response.data && response.data.success && response.data.data) {
          return {
            success: true,
            fileId: response.data.data.fileId,
            url: response.data.data.url,
            message: 'Image successfully uploaded to Google Drive'
          }
        }
      }

      // Fallback: Use base64 data directly for local demo preview & persistence
      return {
        success: true,
        fileId: 'local_' + Date.now(),
        url: base64Data,
        message: 'Image ready (Saved locally in Demo Mode)'
      }
    } catch (err: any) {
      console.error('Image upload failed:', err)
      return {
        success: false,
        fileId: '',
        url: '',
        message: err.message || 'Failed to process image'
      }
    }
  }

  /**
   * Delete image
   */
  static async deleteFile(fileId: string): Promise<{ success: boolean; message: string }> {
    if (!fileId) return { success: false, message: 'No file ID' }

    if (isLiveApiConfigured && !fileId.startsWith('local_')) {
      try {
        const token = AuthService.getToken()
        const url = `${getApiUrl()}?action=deleteImage`
        const response = await axios.post(
          url,
          JSON.stringify({ fileId, token }),
          { headers: { 'Content-Type': 'text/plain;charset=utf-8' } }
        )
        return { success: Boolean(response.data?.success), message: response.data?.message || 'Deleted' }
      } catch (err: any) {
        return { success: false, message: err.message || 'Delete error' }
      }
    }

    return { success: true, message: 'File reference removed' }
  }
}