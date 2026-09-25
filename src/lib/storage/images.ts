import { createClient } from '@/lib/supabase/server'

const BUCKET_NAME = 'portfolio-images'
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function uploadImage(file: File, path: string): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient()
  
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { url: null, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' }
  }
  
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return { url: null, error: 'File size must be less than 2MB.' }
  }

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    return { url: null, error: error.message }
  }

  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path)
  
  return { url: urlData.publicUrl, error: null }
}

export async function deleteImage(path: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])
  
  return { error: error?.message || null }
}

export async function listImages(folder: string): Promise<{ urls: string[]; error: string | null }> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.storage.from(BUCKET_NAME).list(folder)
  
  if (error) {
    return { urls: [], error: error.message }
  }

  const urls = (data || []).map((file) => {
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`${folder}/${file.name}`)
    return urlData.publicUrl
  })

  return { urls, error: null }
}

export function generateImagePath(filename: string, prefix: string = 'projects'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = filename.split('.').pop()?.toLowerCase() || 'jpg'
  return `${prefix}/${timestamp}-${random}.${extension}`
}