
import { supabase } from "@/integrations/supabase/client"

export const MAX_VIDEO_DURATION = 15 // seconds
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB
export const MIN_IMAGE_WIDTH = 1200
export const MIN_IMAGE_HEIGHT = 800

export async function uploadFile(file: File, path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("media")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    })

  if (error) {
    throw error
  }

  const { data: { publicUrl } } = supabase.storage
    .from("media")
    .getPublicUrl(data.path)

  return publicUrl
}

export async function validateVideo(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const video = document.createElement("video")
    video.preload = "metadata"

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src)
      resolve(video.duration <= MAX_VIDEO_DURATION && file.size <= MAX_VIDEO_SIZE)
    }

    video.src = URL.createObjectURL(file)
  })
}

export async function validateImage(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      window.URL.revokeObjectURL(img.src)
      resolve(img.width >= MIN_IMAGE_WIDTH && img.height >= MIN_IMAGE_HEIGHT)
    }
    img.src = URL.createObjectURL(file)
  })
}
