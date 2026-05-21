import { describe, it, expect, beforeEach, vi } from 'vitest'

const stores: Record<string, Record<string, object>> = {
  workLogs: {},
  workLogAppliances: {},
  workFinancials: {},
}

vi.mock('@/db/dexie', () => {
  const makeTable = (name: string) => ({
    add: vi.fn(async (item: { id: string }) => { stores[name][item.id] = item; return item.id }),
    put: vi.fn(async (item: { id: string }) => { stores[name][item.id] = item }),
    get: vi.fn(async (id: string) => stores[name][id]),
    delete: vi.fn(async (id: string) => { delete stores[name][id] }),
    bulkAdd: vi.fn(async (items: Array<{ id: string }>) => { items.forEach(i => { stores[name][i.id] = i }) }),
    filter: vi.fn(() => ({ toArray: vi.fn(async () => Object.values(stores[name])) })),
    where: vi.fn(() => ({
      equals: vi.fn(() => ({
        toArray: vi.fn(async () => Object.values(stores[name])),
        delete: vi.fn(async () => { stores[name] = {} }),
        reverse: vi.fn(() => ({ sortBy: vi.fn(async () => Object.values(stores[name])) })),
      })),
    })),
  })

  return {
    getDB: vi.fn(() => ({
      workLogs: makeTable('workLogs'),
      workLogAppliances: makeTable('workLogAppliances'),
      workFinancials: makeTable('workFinancials'),
    })),
  }
})

import { createWorkLog, deleteWorkLog, getRevenueSummary, getMonthlyRevenue } from '@/lib/workLogs'

describe('workLogs lib', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.keys(stores).forEach(k => { stores[k] = {} })
  })

  it('creates a work log with financials', async () => {
    // Arrange
    const input = {
      user_id: 'user-1',
      customer_id: 'cust-1',
      work_type: 'cleaning',
      worked_at: '2026-05-21',
      financials: [
        { type: 'revenue' as const, amount: 50000, description: '세척비' },
        { type: 'cost' as const, amount: 10000, description: '재료비' },
      ],
    }

    // Act
    const result = await createWorkLog(input)

    // Assert
    expect(result.work_type).toBe('cleaning')
    expect(result.worked_at).toBe('2026-05-21')
    expect(result.financials).toHaveLength(2)
    expect(result.financials[0].amount).toBe(50000)
  })

  it('calculates revenue summary correctly', async () => {
    // Arrange
    await createWorkLog({
      user_id: 'user-1',
      customer_id: 'cust-1',
      work_type: 'cleaning',
      worked_at: '2026-05-10',
      financials: [
        { type: 'revenue' as const, amount: 80000 },
        { type: 'cost' as const, amount: 20000 },
      ],
    })

    // Act
    const summary = await getRevenueSummary('user-1', '2026-05-01', '2026-05-31')

    // Assert
    expect(summary.totalRevenue).toBe(80000)
    expect(summary.totalCost).toBe(20000)
    expect(summary.totalProfit).toBe(60000)
  })

  it('returns 6 months of data with correct structure', async () => {
    // Act
    const monthly = await getMonthlyRevenue('user-1', 6)

    // Assert
    expect(monthly).toHaveLength(6)
    monthly.forEach((entry) => {
      expect(entry.month).toMatch(/^\d{4}-\d{2}$/)
      expect(typeof entry.revenue).toBe('number')
      expect(typeof entry.cost).toBe('number')
      expect(entry.profit).toBe(entry.revenue - entry.cost)
    })
  })
})
