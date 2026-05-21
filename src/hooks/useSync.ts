'use client'

import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { pushLocalToCloud, pullCloudToLocal, type SyncStatus } from '@/lib/sync'

export function useSync(userId: string | null) {
  const qc = useQueryClient()
  const [status, setStatus] = useState<SyncStatus>('idle')

  const sync = useCallback(async () => {
    if (!userId) {
      toast.error('로그인이 필요합니다')
      return
    }
    setStatus('syncing')
    try {
      const pushResult = await pushLocalToCloud(userId)
      const pullResult = await pullCloudToLocal(userId)

      if (pushResult.status === 'error' || pullResult.status === 'error') {
        setStatus('error')
        toast.error(pushResult.error ?? pullResult.error ?? '동기화 실패')
      } else {
        setStatus('success')
        qc.invalidateQueries()
        toast.success(
          `동기화 완료 (↑${pushResult.pushed} ↓${pullResult.pulled})`
        )
      }
    } catch {
      setStatus('error')
      toast.error('동기화 중 오류가 발생했습니다')
    }
  }, [userId, qc])

  return { sync, status }
}
