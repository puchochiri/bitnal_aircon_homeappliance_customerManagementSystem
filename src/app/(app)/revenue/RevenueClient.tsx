'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { useRevenueSummary } from '@/hooks/useWorkLogs'

const DEMO_USER_ID = 'local-user'

type Period = 'this-month' | 'last-month' | '3-months'

function getDateRange(period: Period): { from: string; to: string } {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()

  if (period === 'this-month') {
    return {
      from: new Date(y, m, 1).toISOString().slice(0, 10),
      to: new Date(y, m + 1, 0).toISOString().slice(0, 10),
    }
  }
  if (period === 'last-month') {
    return {
      from: new Date(y, m - 1, 1).toISOString().slice(0, 10),
      to: new Date(y, m, 0).toISOString().slice(0, 10),
    }
  }
  return {
    from: new Date(y, m - 2, 1).toISOString().slice(0, 10),
    to: new Date(y, m + 1, 0).toISOString().slice(0, 10),
  }
}

export function RevenueClient() {
  const { t } = useTranslation()
  const [period, setPeriod] = useState<Period>('this-month')
  const { from, to } = getDateRange(period)
  const { data: summary } = useRevenueSummary(DEMO_USER_ID, from, to)

  const periods: { key: Period; label: string }[] = [
    { key: 'this-month', label: t('revenue.thisMonth') },
    { key: 'last-month', label: t('revenue.lastMonth') },
    { key: '3-months', label: t('revenue.last3Months') },
  ]

  return (
    <>
      <Header title={t('revenue.title')} />
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          {periods.map(({ key, label }) => (
            <Button
              key={key}
              size="sm"
              variant={period === key ? 'default' : 'outline'}
              onClick={() => setPeriod(key)}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Card className="p-4 flex items-center gap-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('revenue.totalRevenue')}</p>
              <p className="text-xl font-bold text-gray-900">
                {(summary?.totalRevenue ?? 0).toLocaleString('ko-KR')}원
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <TrendingDown size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('revenue.totalCost')}</p>
              <p className="text-xl font-bold text-gray-900">
                {(summary?.totalCost ?? 0).toLocaleString('ko-KR')}원
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Minus size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('revenue.totalProfit')}</p>
              <p
                className={`text-xl font-bold ${
                  (summary?.totalProfit ?? 0) >= 0 ? 'text-blue-700' : 'text-red-600'
                }`}
              >
                {(summary?.totalProfit ?? 0).toLocaleString('ko-KR')}원
              </p>
            </div>
          </Card>
        </div>

        <p className="text-xs text-gray-400 text-center">
          {from} ~ {to}
        </p>
      </div>
    </>
  )
}
