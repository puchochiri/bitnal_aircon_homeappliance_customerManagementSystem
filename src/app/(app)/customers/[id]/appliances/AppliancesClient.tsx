'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Plus, Pencil, Trash2, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ApplianceForm, type ApplianceFormValues } from '@/components/appliances/ApplianceForm'
import { useAppliances, useCreateAppliance, useUpdateAppliance, useDeleteAppliance } from '@/hooks/useAppliances'
import { useCustomer } from '@/hooks/useCustomers'
import type { LocalAppliance } from '@/db/dexie'

interface AppliancesClientProps {
  customerId: string
}

export function AppliancesClient({ customerId }: AppliancesClientProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<LocalAppliance | null>(null)

  const { data: customer } = useCustomer(customerId)
  const { data: appliances = [], isLoading } = useAppliances(customerId)
  const { mutate: createAppliance, isPending: isCreating } = useCreateAppliance()
  const { mutate: updateAppliance, isPending: isUpdating } = useUpdateAppliance()
  const { mutate: deleteAppliance } = useDeleteAppliance()

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(a: LocalAppliance) {
    setEditing(a)
    setDialogOpen(true)
  }

  function handleSubmit(values: ApplianceFormValues) {
    const payload = {
      ...values,
      brand: values.brand || null,
      model_name: values.model_name || null,
      install_date: values.install_date || null,
      serial_number: values.serial_number || null,
      memo: values.memo || null,
    }

    if (editing) {
      updateAppliance(
        { id: editing.id, customerId, input: payload },
        { onSuccess: () => setDialogOpen(false) }
      )
    } else {
      createAppliance(
        { ...payload, customer_id: customerId },
        { onSuccess: () => setDialogOpen(false) }
      )
    }
  }

  function handleDelete(id: string) {
    if (!confirm(t('common.delete') + '하시겠습니까?')) return
    deleteAppliance({ id, customerId })
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
          <div className="flex-1">
            <h1 className="text-base font-semibold">{t('appliance.title')}</h1>
            {customer && (
              <p className="text-xs text-gray-500">{customer.name}</p>
            )}
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus size={15} className="mr-1" />
            {t('appliance.add')}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">{t('common.loading')}</div>
        ) : appliances.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-400 gap-3">
            <Wrench size={40} strokeWidth={1} />
            <p className="text-sm">등록된 가전이 없습니다</p>
          </div>
        ) : (
          appliances.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{t(`appliance.types.${a.appliance_type}`)}</Badge>
                    {a.brand && (
                      <span className="text-sm font-medium text-gray-900">{a.brand}</span>
                    )}
                  </div>
                  {a.model_name && (
                    <p className="text-sm text-gray-600 mt-1">{a.model_name}</p>
                  )}
                  {a.install_date && (
                    <p className="text-xs text-gray-400 mt-1">설치: {a.install_date}</p>
                  )}
                  {a.serial_number && (
                    <p className="text-xs text-gray-400">S/N: {a.serial_number}</p>
                  )}
                  {a.memo && (
                    <p className="text-xs text-gray-500 mt-1 bg-gray-50 rounded px-2 py-1">{a.memo}</p>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(a)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(a.id)}
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t('appliance.edit') : t('appliance.add')}</DialogTitle>
          </DialogHeader>
          <ApplianceForm
            defaultValues={editing ?? undefined}
            onSubmit={handleSubmit}
            isLoading={isCreating || isUpdating}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
