'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getCustomers,
  getCustomerById,
  searchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type CreateCustomerInput,
  type UpdateCustomerInput,
} from '@/lib/customers'

const QUERY_KEY = 'customers'

export function useCustomers(userId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, userId],
    queryFn: () => getCustomers(userId),
    enabled: !!userId,
  })
}

export function useCustomerSearch(userId: string, query: string) {
  return useQuery({
    queryKey: [QUERY_KEY, userId, 'search', query],
    queryFn: () => searchCustomers(userId, query),
    enabled: !!userId && query.length > 0,
  })
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'detail', id],
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  })
}

export function useCreateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCustomerInput) => createCustomer(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('고객이 등록되었습니다')
    },
    onError: () => toast.error('고객 등록에 실패했습니다'),
  })
}

export function useUpdateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCustomerInput }) =>
      updateCustomer(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('고객 정보가 수정되었습니다')
    },
    onError: () => toast.error('고객 수정에 실패했습니다'),
  })
}

export function useDeleteCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('고객이 삭제되었습니다')
    },
    onError: () => toast.error('고객 삭제에 실패했습니다'),
  })
}
