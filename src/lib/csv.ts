import { getDB } from '@/db/dexie'

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value == null) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

function toRow(cells: (string | number | null | undefined)[]): string {
  return cells.map(escapeCsvCell).join(',')
}

function downloadCSV(content: string, filename: string): void {
  const bom = '﻿'
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function exportCustomersCSV(userId: string): Promise<void> {
  const db = getDB()
  const customers = await db.customers.filter((c) => c.user_id === userId).sortBy('updatedAt')

  const header = toRow(['이름', '전화번호', '이메일', '주소', '메모'])
  const rows = customers.map((c) =>
    toRow([c.name, c.phone, c.email, c.address, c.memo])
  )

  downloadCSV([header, ...rows].join('\n'), `bitnal-customers-${today()}.csv`)
}

export async function exportWorkLogsCSV(userId: string): Promise<void> {
  const db = getDB()
  const logs = await db.workLogs.filter((w) => w.user_id === userId).toArray()
  logs.sort((a, b) => (a.worked_at < b.worked_at ? 1 : -1))

  const customers = await db.customers.filter((c) => c.user_id === userId).toArray()
  const customerMap = new Map(customers.map((c) => [c.id, c.name]))

  const header = toRow(['작업일', '고객명', '작업유형', '수입(원)', '비용(원)', '순이익(원)', '메모'])

  const rows = await Promise.all(
    logs.map(async (log) => {
      const financials = await db.workFinancials
        .filter((f) => f.work_log_id === log.id)
        .toArray()
      const revenue = financials
        .filter((f) => f.type === 'revenue')
        .reduce((s, f) => s + f.amount, 0)
      const cost = financials
        .filter((f) => f.type === 'cost')
        .reduce((s, f) => s + f.amount, 0)
      return toRow([
        log.worked_at,
        customerMap.get(log.customer_id) ?? '',
        log.work_type,
        revenue,
        cost,
        revenue - cost,
        log.memo,
      ])
    })
  )

  downloadCSV([header, ...rows].join('\n'), `bitnal-worklogs-${today()}.csv`)
}
