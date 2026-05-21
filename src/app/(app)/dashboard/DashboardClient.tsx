'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Users, TrendingUp, ClipboardList, CalendarDays } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'
import { getCustomers } from '@/lib/customers'
import { getRevenueSummary } from '@/lib/workLogs'

const DEMO_USER_ID = 'local-user'

function formatCurrency(amount: number) {
  return amount.toLocaleString('ko-KR') + '원'
}

function getMonthRange() {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  }
}

export function DashboardClient() {
  const { t } = useTranslation()
  const { from, to } = getMonthRange()

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', DEMO_USER_ID],
    queryFn: () => getCustomers(DEMO_USER_ID),
  })

  const { data: revenue } = useQuery({
    queryKey: ['revenue-summary', DEMO_USER_ID, from, to],
    queryFn: () => getRevenueSummary(DEMO_USER_ID, from, to),
  })

  const stats = [
    {
      label: t('customer.title'),
      value: customers.length,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: t('revenue.totalRevenue'),
      value: formatCurrency(revenue?.totalRevenue ?? 0),
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: t('revenue.totalCost'),
      value: formatCurrency(revenue?.totalCost ?? 0),
      icon: ClipboardList,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: t('revenue.totalProfit'),
      value: formatCurrency(revenue?.totalProfit ?? 0),
      icon: CalendarDays,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ]

  const now = new Date()
  const monthLabel = `${now.getFullYear()}년 ${now.getMonth() + 1}월`

  return (
    <>
      <Header title={t('nav.dashboard')} />
      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-500">{monthLabel} 현황</p>
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="p-4">
              <div className={`inline-flex p-2 rounded-lg ${bg} mb-2`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-lg font-semibold text-gray-900 mt-0.5">{value}</p>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
