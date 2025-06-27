
import { supabase } from "@/integrations/supabase/client"

export interface UploadResult {
  url: string
  path: string
  error?: string
}

export const storageService = {
  /**
   * Upload a file to Supabase storage
   * @param file - The file to upload
   * @param bucket - The storage bucket name (default: 'documents')
   * @param folder - Optional folder path within the bucket
   * @returns Promise with upload result
   */
  async uploadFile(
    file: File, 
    bucket: string = 'documents', 
    folder?: string
  ): Promise<UploadResult> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = folder ? `${folder}/${fileName}` : fileName

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw error
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      return {
        url: publicUrl,
        path: data.path
      }
    } catch (error: any) {
      console.error('Error uploading file:', error)
      return {
        url: '',
        path: '',
        error: error.message || 'Failed to upload file'
      }
    }
  },

  /**
   * Upload multiple files to Supabase storage
   * @param files - Array of files to upload
   * @param bucket - The storage bucket name
   * @param folder - Optional folder path within the bucket
   * @returns Promise with array of upload results
   */
  async uploadMultipleFiles(
    files: File[], 
    bucket: string = 'documents', 
    folder?: string
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => 
      this.uploadFile(file, bucket, folder)
    )
    
    return Promise.all(uploadPromises)
  },

  /**
   * Delete a file from Supabase storage
   * @param path - The file path in storage
   * @param bucket - The storage bucket name
   * @returns Promise with deletion result
   */
  async deleteFile(path: string, bucket: string = 'documents'): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path])

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Error deleting file:', error)
      return false
    }
  },

  /**
   * Get public URL for a file
   * @param path - The file path in storage
   * @param bucket - The storage bucket name
   * @returns Public URL string
   */
  getPublicUrl(path: string, bucket: string = 'documents'): string {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return publicUrl
  },

  /**
   * Upload partner registration documents
   * @param files - Array of files to upload
   * @returns Promise with array of upload URLs
   */
  async uploadPartnerDocuments(files: File[]): Promise<string[]> {
    const results = await this.uploadMultipleFiles(files, 'documents', 'partner-registrations')
    
    // Filter out failed uploads and return only successful URLs
    return results
      .filter(result => !result.error && result.url)
      .map(result => result.url)
  },

  /**
   * Upload activity owner registration documents
   * @param files - Array of files to upload
   * @returns Promise with array of upload URLs
   */
  async uploadActivityOwnerDocuments(files: File[]): Promise<string[]> {
    const results = await this.uploadMultipleFiles(files, 'documents', 'activity-owner-registrations')
    
    // Filter out failed uploads and return only successful URLs
    return results
      .filter(result => !result.error && result.url)
      .map(result => result.url)
  },

  /**
   * Upload activity images
   * @param files - Array of image files to upload
   * @returns Promise with array of upload URLs
   */
  async uploadActivityImages(files: File[]): Promise<string[]> {
    const results = await this.uploadMultipleFiles(files, 'images', 'activities')
    
    // Filter out failed uploads and return only successful URLs
    return results
      .filter(result => !result.error && result.url)
      .map(result => result.url)
  }
}

export default storageService
