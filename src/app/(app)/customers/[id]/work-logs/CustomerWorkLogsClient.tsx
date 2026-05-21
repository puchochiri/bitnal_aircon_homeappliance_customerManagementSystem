'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Plus, TrendingUp, TrendingDown, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { WorkLogForm, type WorkLogFormValues } from '@/components/work-logs/WorkLogForm'
import { useWorkLogsByCustomer, useCreateWorkLog, useDeleteWorkLog } from '@/hooks/useWorkLogs'
import { useCustomer } from '@/hooks/useCustomers'
import { useAppliances } from '@/hooks/useAppliances'

const DEMO_USER_ID = 'local-user'

interface CustomerWorkLogsClientProps {
  customerId: string
}

export function CustomerWorkLogsClient({ customerId }: CustomerWorkLogsClientProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: customer } = useCustomer(customerId)
  const { data: workLogs = [], isLoading } = useWorkLogsByCustomer(customerId)
  const { data: appliances = [] } = useAppliances(customerId)
  const { mutate: createWorkLog, isPending } = useCreateWorkLog()
  const { mutate: deleteWorkLog } = useDeleteWorkLog()

  const applianceMap = Object.fromEntries(appliances.map((a) => [a.id, a]))

  function handleSubmit(values: WorkLogFormValues) {
    createWorkLog(
      {
        ...values,
        user_id: DEMO_USER_ID,
        customer_id: customerId,
        financials: values.financials.map((f) => ({
          ...f,
          description: f.description || null,
        })),
      },
      { onSuccess: () => setDialogOpen(false) }
    )
  }

  const totalRevenue = workLogs.flatMap((l) => l.financials)
    .filter((f) => f.type === 'revenue')
    .reduce((s, f) => s + f.amount, 0)

  const totalCost = workLogs.flatMap((l) => l.financials)
    .filter((f) => f.type === 'cost')
    .reduce((s, f) => s + f.amount, 0)

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
            <h1 className="text-base font-semibold">{t('customer.workHistory')}</h1>
            {customer && <p className="text-xs text-gray-500">{customer.name}</p>}
          </div>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus size={15} className="mr-1" />
            {t('workLog.add')}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {workLogs.length > 0 && (
          <div className="flex gap-3 text-sm">
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp size={14} />
              <span>매출 {totalRevenue.toLocaleString()}원</span>
            </div>
            <div className="flex items-center gap-1 text-red-500">
              <TrendingDown size={14} />
              <span>비용 {totalCost.toLocaleString()}원</span>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">{t('common.loading')}</div>
        ) : workLogs.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-400 gap-3">
            <ClipboardList size={40} strokeWidth={1} />
            <p className="text-sm">작업 이력이 없습니다</p>
          </div>
        ) : (
          workLogs.map((log) => {
            const rev = log.financials.filter((f) => f.type === 'revenue').reduce((s, f) => s + f.amount, 0)
            const cost = log.financials.filter((f) => f.type === 'cost').reduce((s, f) => s + f.amount, 0)
            const linkedAppliances = log.applianceLinks
              .map((l) => applianceMap[l.appliance_id])
              .filter(Boolean)

            return (
              <Card key={log.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{t(`workLog.types.${log.work_type}`)}</Badge>
                      <span className="text-sm text-gray-500">{log.worked_at}</span>
                    </div>
                    {linkedAppliances.length > 0 && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {linkedAppliances.map((a) => (
                          <span
                            key={a!.id}
                            className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded"
                          >
                            {t(`appliance.types.${a!.appliance_type}`)}
                            {a!.brand ? ` · ${a!.brand}` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                    {log.memo && (
                      <p className="text-sm text-gray-500 mt-1">{log.memo}</p>
                    )}
                    {log.financials.length > 0 && (
                      <div className="flex gap-3 mt-2">
                        {rev > 0 && (
                          <span className="text-xs text-green-600 flex items-center gap-0.5">
                            <TrendingUp size={11} /> {rev.toLocaleString()}원
                          </span>
                        )}
                        {cost > 0 && (
                          <span className="text-xs text-red-500 flex items-center gap-0.5">
                            <TrendingDown size={11} /> {cost.toLocaleString()}원
                          </span>
                        )}
                        {(rev - cost) !== 0 && (
                          <span className="text-xs text-gray-400">
                            이익 {(rev - cost).toLocaleString()}원
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteWorkLog(log.id)}
                    className="text-gray-400 hover:text-red-600 text-xs h-7 px-2 ml-2"
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
            onSubmit={handleSubmit}
            isLoading={isPending}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
