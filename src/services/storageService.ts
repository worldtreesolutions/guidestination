import { supabase } from "@/integrations/supabase/client"
import { uploadService } from "./uploadService"

export interface UploadResult {
  url: string
  path: string
  error?: string
}

export const storageService = {
  /**
   * Upload a file to Supabase storage with CDN
   * @deprecated Use uploadService.uploadFile instead
   */
  async uploadFile(
    file: File, 
    bucket: string = 'documents', 
    folder?: string
  ): Promise<UploadResult> {
    return uploadService.uploadFile(file, bucket, folder || '')
  },

  /**
   * Upload multiple files to Supabase storage with CDN
   * @deprecated Use uploadService.uploadMultipleFiles instead
   */
  async uploadMultipleFiles(
    files: File[], 
    bucket: string = 'documents', 
    folder?: string
  ): Promise<UploadResult[]> {
    return uploadService.uploadMultipleFiles(files, bucket, folder || '')
  },

  /**
   * Delete a file from Supabase storage
   */
  async deleteFile(path: string, bucket: string = 'documents'): Promise<boolean> {
    return uploadService.deleteFile(bucket, path)
  },

  /**
   * Get public CDN URL for a file
   */
  getPublicUrl(path: string, bucket: string = 'documents'): string {
    return uploadService.getFileUrl(bucket, path)
  },

  /**
   * Upload partner registration documents with CDN
   */
  async uploadPartnerDocuments(files: File[], partnerId?: string, userId?: string): Promise<string[]> {
    return uploadService.uploadPartnerDocuments(files, partnerId, userId)
  },

  /**
   * Upload activity owner registration documents with CDN
   */
  async uploadActivityOwnerDocuments(files: File[], ownerId?: string, userId?: string): Promise<string[]> {
    return uploadService.uploadActivityOwnerDocuments(files, ownerId, userId)
  },

  /**
   * Upload activity images with CDN
   */
  async uploadActivityImages(files: File[], activityId?: string, userId?: string): Promise<string[]> {
    return uploadService.uploadActivityImages(files, activityId, userId)
  }
}

export default storageService
