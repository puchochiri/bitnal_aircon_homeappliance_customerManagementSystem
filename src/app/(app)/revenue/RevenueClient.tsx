'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingUp, TrendingDown, Minus, Download } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { useRevenueSummary, useMonthlyRevenue } from '@/hooks/useWorkLogs'
import { exportWorkLogsCSV } from '@/lib/csv'
import { toast } from 'sonner'

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

function formatKRW(value: number): string {
  return value.toLocaleString('ko-KR') + '원'
}

export function RevenueClient() {
  const { t } = useTranslation()
  const [period, setPeriod] = useState<Period>('this-month')
  const { from, to } = getDateRange(period)
  const { data: summary } = useRevenueSummary(DEMO_USER_ID, from, to)
  const { data: monthly = [] } = useMonthlyRevenue(DEMO_USER_ID, 6)

  const periods: { key: Period; label: string }[] = [
    { key: 'this-month', label: t('revenue.thisMonth') },
    { key: 'last-month', label: t('revenue.lastMonth') },
    { key: '3-months', label: t('revenue.last3Months') },
  ]

  async function handleExport() {
    try {
      await exportWorkLogsCSV(DEMO_USER_ID)
      toast.success('CSV 파일이 다운로드되었습니다')
    } catch {
      toast.error('내보내기에 실패했습니다')
    }
  }

  const chartData = monthly.map((m) => ({
    month: m.month.slice(5),
    수입: m.revenue,
    비용: m.cost,
    순이익: m.profit,
  }))

  return (
    <>
      <Header
        title={t('revenue.title')}
        right={
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download size={14} className="mr-1" />
            CSV
          </Button>
        }
      />
      <div className="p-4 space-y-4">
        <div className="flex gap-2 flex-wrap">
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
                {formatKRW(summary?.totalRevenue ?? 0)}
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
                {formatKRW(summary?.totalCost ?? 0)}
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
                {formatKRW(summary?.totalProfit ?? 0)}
              </p>
            </div>
          </Card>
        </div>

        <p className="text-xs text-gray-400 text-center">
          {from} ~ {to}
        </p>

        {/* Monthly trend chart */}
        <Card className="p-4">
          <p className="text-sm font-semibold text-gray-700 mb-4">최근 6개월 추이</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
              />
              <Tooltip
                formatter={(value) => formatKRW(Number(value ?? 0))}
                labelStyle={{ fontWeight: 600 }}
              />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="수입" fill="#22c55e" radius={[2, 2, 0, 0]} />
              <Bar dataKey="비용" fill="#ef4444" radius={[2, 2, 0, 0]} />
              <Bar dataKey="순이익" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  )
}
