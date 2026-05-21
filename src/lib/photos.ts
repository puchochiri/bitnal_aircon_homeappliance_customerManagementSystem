import { supabase } from '@/lib/supabase/client'
import { getDB } from '@/db/dexie'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024

export function validatePhotoFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'JPEG, PNG, WebP 파일만 업로드할 수 있습니다'
  }
  if (file.size > MAX_FILE_SIZE) {
    return '파일 크기는 10MB 이하여야 합니다'
  }
  return null
}

export async function uploadWorkPhoto(
  workLogId: string,
  userId: string,
  file: File
): Promise<string> {
  const error = validatePhotoFile(file)
  if (error) throw new Error(error)

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${workLogId}/${crypto.randomUUID()}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from('work-photos')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadErr) throw uploadErr

  const db = getDB()
  await db.workPhotos.add({
    id: crypto.randomUUID(),
    work_log_id: workLogId,
    storage_path: path,
    taken_at: new Date().toISOString(),
  })

  return path
}

export async function getPhotoUrl(storagePath: string): Promise<string> {
  const { data } = supabase.storage
    .from('work-photos')
    .getPublicUrl(storagePath)
  return data.publicUrl
}

export async function deleteWorkPhoto(id: string, storagePath: string): Promise<void> {
  await supabase.storage.from('work-photos').remove([storagePath])
  const db = getDB()
  await db.workPhotos.delete(id)
}

export async function getPhotosByWorkLog(workLogId: string) {
  const db = getDB()
  return db.workPhotos.where('workLogId').equals(workLogId).toArray()
}
