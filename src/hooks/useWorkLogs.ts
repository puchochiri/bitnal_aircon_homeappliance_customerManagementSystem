'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getWorkLogsByCustomer,
  getWorkLogsByUser,
  getWorkLogById,
  createWorkLog,
  deleteWorkLog,
  getRevenueSummary,
  type CreateWorkLogInput,
} from '@/lib/workLogs'

const KEY = 'work-logs'

export function useWorkLogsByCustomer(customerId: string) {
  return useQuery({
    queryKey: [KEY, 'customer', customerId],
    queryFn: () => getWorkLogsByCustomer(customerId),
    enabled: !!customerId,
  })
}

export function useWorkLogsByUser(userId: string) {
  return useQuery({
    queryKey: [KEY, 'user', userId],
    queryFn: () => getWorkLogsByUser(userId),
    enabled: !!userId,
  })
}

export function useWorkLog(id: string) {
  return useQuery({
    queryKey: [KEY, 'detail', id],
    queryFn: () => getWorkLogById(id),
    enabled: !!id,
  })
}

export function useRevenueSummary(userId: string, from: string, to: string) {
  return useQuery({
    queryKey: ['revenue-summary', userId, from, to],
    queryFn: () => getRevenueSummary(userId, from, to),
    enabled: !!userId,
  })
}

export function useCreateWorkLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateWorkLogInput) => createWorkLog(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: ['revenue-summary'] })
      toast.success('작업이 등록되었습니다')
    },
    onError: () => toast.error('작업 등록에 실패했습니다'),
  })
}

export function useDeleteWorkLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWorkLog(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: ['revenue-summary'] })
      toast.success('작업이 삭제되었습니다')
    },
    onError: () => toast.error('작업 삭제에 실패했습니다'),
  })
}
