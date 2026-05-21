'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Pencil, Trash2, Phone, Mail, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CustomerForm, type CustomerFormValues } from '@/components/customers/CustomerForm'
import { useCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/useCustomers'

interface CustomerDetailClientProps {
  customerId: string
}

export function CustomerDetailClient({ customerId }: CustomerDetailClientProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)

  const { data: customer, isLoading } = useCustomer(customerId)
  const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomer()
  const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomer()

  function handleEdit(values: CustomerFormValues) {
    updateCustomer(
      { id: customerId, input: values },
      { onSuccess: () => setEditOpen(false) }
    )
  }

  function handleDelete() {
    if (!confirm(t('customer.deleteConfirm'))) return
    deleteCustomer(customerId, { onSuccess: () => router.push('/customers') })
  }

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">{t('common.loading')}</div>
  }
  if (!customer) {
    return <div className="p-4 text-center text-gray-500">고객을 찾을 수 없습니다</div>
  }

  return (
    <>
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center gap-2 px-4 h-14">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold flex-1 truncate">{customer.name}</h1>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil size={14} className="mr-1" />
            {t('common.edit')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 size={14} className="mr-1" />
            {t('common.delete')}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Card className="p-4 space-y-3">
          <h2 className="text-sm font-medium text-gray-500">기본 정보</h2>
          {customer.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone size={15} className="text-gray-400" />
              <a href={`tel:${customer.phone}`} className="text-blue-600">
                {customer.phone}
              </a>
            </div>
          )}
          {customer.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail size={15} className="text-gray-400" />
              <a href={`mailto:${customer.email}`} className="text-blue-600">
                {customer.email}
              </a>
            </div>
          )}
          {customer.address && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin size={15} className="text-gray-400 mt-0.5" />
              <span className="text-gray-700">{customer.address}</span>
            </div>
          )}
          {customer.memo && (
            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mt-2">
              {customer.memo}
            </div>
          )}
        </Card>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/customers/${customerId}/appliances`)}
            className="flex-1"
          >
            {t('customer.appliances')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/customers/${customerId}/work-logs`)}
            className="flex-1"
          >
            {t('customer.workHistory')}
          </Button>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('customer.edit')}</DialogTitle>
          </DialogHeader>
          <CustomerForm
            defaultValues={customer}
            onSubmit={handleEdit}
            isLoading={isUpdating}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
