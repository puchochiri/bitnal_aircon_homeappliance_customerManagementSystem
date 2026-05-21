'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getAppointmentsByUser,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  type CreateAppointmentInput,
} from '@/lib/appointments'
import type { LocalAppointment } from '@/db/dexie'

const KEY = 'appointments'

export function useAppointments(userId: string) {
  return useQuery({
    queryKey: [KEY, userId],
    queryFn: () => getAppointmentsByUser(userId),
    enabled: !!userId,
  })
}

export function useCreateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateAppointmentInput) => createAppointment(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success('예약이 등록되었습니다')
    },
    onError: () => toast.error('예약 등록에 실패했습니다'),
  })
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LocalAppointment['status'] }) =>
      updateAppointmentStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success('예약 상태가 변경되었습니다')
    },
    onError: () => toast.error('상태 변경에 실패했습니다'),
  })
}

export function useDeleteAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      toast.success('예약이 삭제되었습니다')
    },
    onError: () => toast.error('예약 삭제에 실패했습니다'),
  })
}
