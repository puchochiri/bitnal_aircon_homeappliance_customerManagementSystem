'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Users, TrendingUp, ClipboardList, CalendarDays, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/Header'
import { getCustomers } from '@/lib/customers'
import { getRevenueSummary, getWorkLogsByUser } from '@/lib/workLogs'
import { getAppointmentsByUser } from '@/lib/appointments'

const DEMO_USER_ID = 'local-user'

function formatCurrency(amount: number) {
  return amount.toLocaleString('ko-KR') + '원'
}

function getMonthRange() {
  const now = new Date()
  return {
    from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10),
  }
}

const APT_BADGE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

export function DashboardClient() {
  const { t } = useTranslation()
  const { from, to } = getMonthRange()
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', DEMO_USER_ID],
    queryFn: () => getCustomers(DEMO_USER_ID),
  })

  const { data: revenue } = useQuery({
    queryKey: ['revenue-summary', DEMO_USER_ID, from, to],
    queryFn: () => getRevenueSummary(DEMO_USER_ID, from, to),
  })

  const { data: recentLogs = [] } = useQuery({
    queryKey: ['work-logs', 'user', DEMO_USER_ID],
    queryFn: () => getWorkLogsByUser(DEMO_USER_ID),
    select: (logs) => logs.slice(0, 3),
  })

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', DEMO_USER_ID],
    queryFn: () => getAppointmentsByUser(DEMO_USER_ID),
    select: (apts) =>
      apts
        .filter((a) => a.scheduled_at >= todayStr && a.status !== 'cancelled')
        .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))
        .slice(0, 3),
  })

  const customerMap = Object.fromEntries(customers.map((c) => [c.id, c]))

  const stats = [
    { label: t('customer.title'), value: customers.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('revenue.totalRevenue'), value: formatCurrency(revenue?.totalRevenue ?? 0), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: t('revenue.totalCost'), value: formatCurrency(revenue?.totalCost ?? 0), icon: ClipboardList, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: t('revenue.totalProfit'), value: formatCurrency(revenue?.totalProfit ?? 0), icon: CalendarDays, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <>
      <Header title={t('nav.dashboard')} />
      <div className="p-4 space-y-5">
        <div>
          <p className="text-xs text-gray-500 mb-2">
            {now.getFullYear()}년 {now.getMonth() + 1}월 현황
          </p>
          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label} className="p-4">
                <div className={`inline-flex p-2 rounded-lg ${bg} mb-2`}>
                  <Icon size={18} className={color} />
                </div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-base font-semibold text-gray-900 mt-0.5">{value}</p>
              </Card>
            ))}
          </div>
        </div>

        {appointments.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-gray-700">다가오는 예약</h2>
              <Link href="/calendar" className="text-xs text-blue-600">전체 보기</Link>
            </div>
            <div className="space-y-2">
              {appointments.map((apt) => (
                <Card key={apt.id} className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {customerMap[apt.customer_id]?.name ?? '고객'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {apt.scheduled_at.slice(0, 16).replace('T', ' ')}
                    </p>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${APT_BADGE[apt.status]}`}>
                    {t(`calendar.status.${apt.status}`)}
                  </span>
                </Card>
              ))}
            </div>
          </div>
        )}

        {recentLogs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-gray-700">최근 작업</h2>
              <Link href="/work-logs" className="text-xs text-blue-600">전체 보기</Link>
            </div>
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <Card key={log.id} className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {t(`workLog.types.${log.work_type}`)}
                      </Badge>
                      <p className="text-xs text-gray-400">{log.worked_at}</p>
                    </div>
                    {customerMap[log.customer_id] && (
                      <p className="text-sm text-gray-600 mt-0.5 truncate">
                        {customerMap[log.customer_id]?.name}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-gray-300 shrink-0" />
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
