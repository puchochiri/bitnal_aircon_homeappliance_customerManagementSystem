'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CustomerCard } from '@/components/customers/CustomerCard'
import { CustomerForm, type CustomerFormValues } from '@/components/customers/CustomerForm'
import { useCustomers, useCreateCustomer } from '@/hooks/useCustomers'
import { Header } from '@/components/layout/Header'
import { exportCustomersCSV } from '@/lib/csv'
import { toast } from 'sonner'

const DEMO_USER_ID = 'local-user'
const FREE_LIMIT = 30

export function CustomerListClient() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: customers = [], isLoading } = useCustomers(DEMO_USER_ID)
  const { mutate: createCustomer, isPending } = useCreateCustomer()

  const filtered = search
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          (c.phone ?? '').includes(search)
      )
    : customers

  const isAtLimit = customers.length >= FREE_LIMIT

  async function handleExport() {
    try {
      await exportCustomersCSV(DEMO_USER_ID)
      toast.success('CSV 파일이 다운로드되었습니다')
    } catch {
      toast.error('내보내기에 실패했습니다')
    }
  }

  function handleSubmit(values: CustomerFormValues) {
    createCustomer(
      { ...values, user_id: DEMO_USER_ID },
      { onSuccess: () => setDialogOpen(false) }
    )
  }

  return (
    <>
      <Header
        title={t('customer.title')}
        right={
          <Button size="sm" variant="outline" onClick={handleExport} disabled={customers.length === 0}>
            <Download size={14} className="mr-1" />
            CSV
          </Button>
        }
      />
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              placeholder={t('customer.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            disabled={isAtLimit}
            size="sm"
            className="shrink-0"
          >
            <Plus size={16} className="mr-1" />
            {t('customer.add')}
          </Button>
        </div>

        {isAtLimit && (
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {t('tier.customerLimit')} — {t('tier.upgradeToPro')}
          </p>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">{t('common.loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {search ? '검색 결과가 없습니다' : t('customer.empty')}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center">
          {customers.length} / {FREE_LIMIT}명
        </p>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('customer.add')}</DialogTitle>
          </DialogHeader>
          <CustomerForm
            onSubmit={handleSubmit}
            isLoading={isPending}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
