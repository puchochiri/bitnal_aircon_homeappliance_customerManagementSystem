'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { WorkLogForm, type WorkLogFormValues } from '@/components/work-logs/WorkLogForm'
import { useWorkLogsByUser, useCreateWorkLog, useDeleteWorkLog } from '@/hooks/useWorkLogs'
import { Header } from '@/components/layout/Header'
import { useCustomers } from '@/hooks/useCustomers'

const DEMO_USER_ID = 'local-user'

export function WorkLogsClient() {
  const { t } = useTranslation()
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: workLogs = [], isLoading } = useWorkLogsByUser(DEMO_USER_ID)
  const { data: customers = [] } = useCustomers(DEMO_USER_ID)
  const { mutate: createWorkLog, isPending } = useCreateWorkLog()
  const { mutate: deleteWorkLog } = useDeleteWorkLog()

  const customerMap = Object.fromEntries(customers.map((c) => [c.id, c]))

  function handleSubmit(values: WorkLogFormValues) {
    createWorkLog(
      {
        ...values,
        user_id: DEMO_USER_ID,
        customer_id: values.customer_id ?? '',
        financials: values.financials.map((f) => ({
          ...f,
          description: f.description || null,
        })),
      },
      { onSuccess: () => setDialogOpen(false) }
    )
  }

  return (
    <>
      <Header title={t('workLog.title')} />
      <div className="p-4 space-y-3">
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus size={16} className="mr-1" />
            {t('workLog.add')}
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">{t('common.loading')}</div>
        ) : workLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">등록된 작업이 없습니다</div>
        ) : (
          workLogs.map((log) => {
            const totalRevenue = log.financials
              .filter((f) => f.type === 'revenue')
              .reduce((s, f) => s + f.amount, 0)
            const totalCost = log.financials
              .filter((f) => f.type === 'cost')
              .reduce((s, f) => s + f.amount, 0)
            const customer = customerMap[log.customer_id]

            return (
              <Card key={log.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{t(`workLog.types.${log.work_type}`)}</Badge>
                      <span className="text-sm text-gray-500">{log.worked_at}</span>
                    </div>
                    {customer && (
                      <p className="text-sm text-gray-700 mt-1">{customer.name}</p>
                    )}
                    {log.memo && (
                      <p className="text-sm text-gray-500 mt-1">{log.memo}</p>
                    )}
                    {log.financials.length > 0 && (
                      <div className="flex gap-3 mt-2">
                        {totalRevenue > 0 && (
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <TrendingUp size={13} />
                            {totalRevenue.toLocaleString()}원
                          </div>
                        )}
                        {totalCost > 0 && (
                          <div className="flex items-center gap-1 text-sm text-red-500">
                            <TrendingDown size={13} />
                            {totalCost.toLocaleString()}원
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteWorkLog(log.id)}
                    className="text-gray-400 hover:text-red-600 text-xs h-7 px-2"
                  >
                    삭제
                  </Button>
                </div>
              </Card>
            )
          })
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('workLog.add')}</DialogTitle>
          </DialogHeader>
          <WorkLogForm
            customers={customers}
            onSubmit={handleSubmit}
            isLoading={isPending}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
