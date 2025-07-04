
import { supabase } from "@/integrations/supabase/client"

export interface UploadResult {
  url: string
  path: string
  error?: string
}

export const uploadService = {
  /**
   * Core upload function with CDN support
   * @param file - The file to upload
   * @param bucket - The storage bucket name
   * @param folder - Folder path within the bucket
   * @param userId - Optional user ID for organization
   * @returns Promise with upload result including CDN URL
   */
  async uploadFile(
    file: File,
    bucket: string,
    folder: string,
    userId?: string
  ): Promise<UploadResult> {
    try {
      const fileExt = file.name.split(".").pop()
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2)
      const fileName = userId 
        ? `${folder}/${userId}/${timestamp}-${randomId}.${fileExt}`
        : `${folder}/${timestamp}-${randomId}.${fileExt}`

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false
        })

      if (error) {
        console.error("Upload error:", error)
        return { url: "", path: "", error: error.message }
      }

      // Get public CDN URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      return {
        url: publicUrl,
        path: data.path,
      }
    } catch (error: any) {
      console.error("Upload service error:", error)
      return { url: "", path: "", error: error.message || "Upload failed" }
    }
  },

  /**
   * Upload multiple files with CDN support
   * @param files - Array of files to upload
   * @param bucket - The storage bucket name
   * @param folder - Folder path within the bucket
   * @param userId - Optional user ID for organization
   * @returns Promise with array of upload results
   */
  async uploadMultipleFiles(
    files: File[], 
    bucket: string, 
    folder: string,
    userId?: string
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => 
      this.uploadFile(file, bucket, folder, userId)
    )
    
    return Promise.all(uploadPromises)
  },

  /**
   * Upload activity media (images/videos) with CDN
   * @param file - Media file to upload
   * @param activityId - Activity identifier
   * @param mediaType - Type of media (image or video)
   * @param userId - Optional user ID
   * @returns Promise with upload result including CDN URL
   */
  async uploadActivityMedia(
    file: File,
    activityId: string,
    mediaType: "image" | "video",
    userId?: string
  ): Promise<UploadResult> {
    return this.uploadFile(
      file,
      "activity-media",
      `activities/${activityId}/${mediaType}s`,
      userId
    )
  },

  /**
   * Upload activity images with CDN
   * @param files - Array of image files to upload
   * @param activityId - Activity identifier
   * @param userId - Optional user ID
   * @returns Promise with array of CDN URLs
   */
  async uploadActivityImages(files: File[], activityId?: string, userId?: string): Promise<string[]> {
    const folder = activityId ? `activities/${activityId}` : 'activities'
    const results = await this.uploadMultipleFiles(files, 'activity-media', folder, userId)
    
    return results
      .filter(result => !result.error && result.url)
      .map(result => result.url)
  },

  /**
   * Upload profile images with CDN
   * @param file - Profile image file
   * @param userId - User identifier
   * @returns Promise with upload result including CDN URL
   */
  async uploadProfileImage(
    file: File,
    userId: string
  ): Promise<UploadResult> {
    return this.uploadFile(
      file,
      "profiles",
      "avatars",
      userId
    )
  },

  /**
   * Upload business documents with CDN
   * @param file - Document file to upload
   * @param businessId - Business identifier
   * @param documentType - Type of document
   * @param userId - Optional user ID
   * @returns Promise with upload result including CDN URL
   */
  async uploadBusinessDocument(
    file: File,
    businessId: string,
    documentType: string,
    userId?: string
  ): Promise<UploadResult> {
    return this.uploadFile(
      file,
      "business-documents",
      `${businessId}/${documentType}`,
      userId
    )
  },

  /**
   * Upload partner registration documents with CDN
   * @param files - Array of document files to upload
   * @param partnerId - Partner identifier
   * @param userId - Optional user ID
   * @returns Promise with array of CDN URLs
   */
  async uploadPartnerDocuments(files: File[], partnerId?: string, userId?: string): Promise<string[]> {
    const folder = partnerId ? `partner-registrations/${partnerId}` : 'partner-registrations'
    const results = await this.uploadMultipleFiles(files, 'documents', folder, userId)
    
    return results
      .filter(result => !result.error && result.url)
      .map(result => result.url)
  },

  /**
   * Upload activity owner registration documents with CDN
   * @param files - Array of document files to upload
   * @param ownerId - Activity owner identifier
   * @param userId - Optional user ID
   * @returns Promise with array of CDN URLs
   */
  async uploadActivityOwnerDocuments(files: File[], ownerId?: string, userId?: string): Promise<string[]> {
    const folder = ownerId ? `activity-owner-registrations/${ownerId}` : 'activity-owner-registrations'
    const results = await this.uploadMultipleFiles(files, 'documents', folder, userId)
    
    return results
      .filter(result => !result.error && result.url)
      .map(result => result.url)
  },

  /**
   * Delete file from storage
   * @param bucket - Storage bucket name
   * @param path - File path in storage
   * @returns Promise with deletion result
   */
  async deleteFile(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path])

      if (error) {
        console.error("Delete error:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Delete service error:", error)
      return false
    }
  },

  /**
   * Get CDN URL for existing file
   * @param bucket - Storage bucket name
   * @param path - File path in storage
   * @returns CDN URL string
   */
  getFileUrl(bucket: string, path: string): string {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return publicUrl
  },

  /**
   * Get public CDN URL for a file (alias for getFileUrl)
   * @param path - The file path in storage
   * @param bucket - The storage bucket name
   * @returns CDN URL string
   */
  getPublicUrl(path: string, bucket: string = 'documents'): string {
    return this.getFileUrl(bucket, path)
  }
}

export default uploadService
