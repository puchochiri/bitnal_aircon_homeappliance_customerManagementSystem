'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getAppliancesByCustomer,
  createAppliance,
  updateAppliance,
  deleteAppliance,
  type CreateApplianceInput,
} from '@/lib/appliances'

const KEY = 'appliances'

export function useAppliances(customerId: string) {
  return useQuery({
    queryKey: [KEY, customerId],
    queryFn: () => getAppliancesByCustomer(customerId),
    enabled: !!customerId,
  })
}

export function useCreateAppliance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateApplianceInput) => createAppliance(input),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [KEY, vars.customer_id] })
      toast.success('가전이 등록되었습니다')
    },
    onError: () => toast.error('가전 등록에 실패했습니다'),
  })
}

export function useUpdateAppliance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      customerId,
      input,
    }: {
      id: string
      customerId: string
      input: Partial<CreateApplianceInput>
    }) => updateAppliance(id, input),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [KEY, vars.customerId] })
      toast.success('가전 정보가 수정되었습니다')
    },
    onError: () => toast.error('가전 수정에 실패했습니다'),
  })
}

export function useDeleteAppliance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, customerId }: { id: string; customerId: string }) =>
      deleteAppliance(id),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [KEY, vars.customerId] })
      toast.success('가전이 삭제되었습니다')
    },
    onError: () => toast.error('가전 삭제에 실패했습니다'),
  })
}
