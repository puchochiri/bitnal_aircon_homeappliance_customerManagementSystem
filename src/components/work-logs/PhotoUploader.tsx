'use client'

import { useRef, useState } from 'react'
import { Camera, X, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { uploadWorkPhoto, getPhotoUrl, validatePhotoFile } from '@/lib/photos'

interface PhotoUploaderProps {
  workLogId: string
  userId: string
  disabled?: boolean
}

export function PhotoUploader({ workLogId, userId, disabled }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [previews, setPreviews] = useState<Array<{ url: string; path: string }>>([])

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return

    for (const file of Array.from(files)) {
      const err = validatePhotoFile(file)
      if (err) { toast.error(err); continue }

      setUploading(true)
      try {
        const path = await uploadWorkPhoto(workLogId, userId, file)
        const url = await getPhotoUrl(path)
        setPreviews((prev) => [...prev, { url, path }])
        toast.success('사진이 업로드되었습니다')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '업로드 실패')
      } finally {
        setUploading(false)
      }
    }
  }

  if (disabled) {
    return (
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
        <AlertCircle size={15} />
        PRO 플랜에서 사진 업로드가 가능합니다
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {previews.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {previews.map(({ url, path }) => (
            <div key={path} className="relative w-20 h-20 rounded-lg overflow-hidden border">
              <Image src={url} alt="작업 사진" fill className="object-cover" />
              <button
                onClick={() => setPreviews((prev) => prev.filter((p) => p.path !== path))}
                className="absolute top-0.5 right-0.5 bg-black/50 rounded-full p-0.5"
              >
                <X size={10} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors w-full justify-center"
      >
        <Camera size={16} />
        {uploading ? '업로드 중...' : '사진 추가'}
      </button>
    </div>
  )
}
