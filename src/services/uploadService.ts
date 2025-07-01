
import { supabase } from "@/integrations/supabase/client"

export interface UploadResult {
  url: string
  path: string
  error?: string
}

export const uploadService = {
  // Upload file to Supabase Storage with CDN
  async uploadFile(
    file: File,
    bucket: string,
    folder: string,
    userId?: string
  ): Promise<UploadResult | null> {
    try {
      const fileExt = file.name.split(".").pop()
      const timestamp = Date.now()
      const fileName = `${folder}/${userId || "anonymous"}/${timestamp}.${fileExt}`

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

      // Get public URL (served via CDN)
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      return {
        url: publicUrl,
        path: fileName,
      }
    } catch (error) {
      console.error("Upload service error:", error)
      return { url: "", path: "", error: "Upload failed" }
    }
  },

  // Upload activity media (images/videos)
  async uploadActivityMedia(
    file: File,
    activityId: string,
    mediaType: "image" | "video",
    userId?: string
  ): Promise<UploadResult | null> {
    return this.uploadFile(
      file,
      "activity-media",
      `activities/${activityId}/${mediaType}s`,
      userId
    )
  },

  // Upload profile images
  async uploadProfileImage(
    file: File,
    userId: string
  ): Promise<UploadResult | null> {
    return this.uploadFile(
      file,
      "profiles",
      "avatars",
      userId
    )
  },

  // Upload business documents
  async uploadBusinessDocument(
    file: File,
    businessId: string,
    documentType: string,
    userId?: string
  ): Promise<UploadResult | null> {
    return this.uploadFile(
      file,
      "business-documents",
      `${businessId}/${documentType}`,
      userId
    )
  },

  // Delete file from storage
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

  // Get file URL from path
  getFileUrl(bucket: string, path: string): string {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return publicUrl
  }
}
