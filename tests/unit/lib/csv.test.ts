import { describe, it, expect, vi, beforeEach } from 'vitest'

const stores: Record<string, Record<string, object>> = {
  customers: {},
  workLogs: {},
  workFinancials: {},
}

vi.mock('@/db/dexie', () => ({
  getDB: vi.fn(() => ({
    customers: {
      filter: vi.fn((fn: (c: { user_id: string }) => boolean) => {
        const results = () => (Object.values(stores.customers) as Array<{ user_id: string }>).filter(fn)
        return {
          sortBy: vi.fn(async () => results()),
          toArray: vi.fn(async () => results()),
        }
      }),
    },
    workLogs: {
      filter: vi.fn((fn: (w: { user_id: string }) => boolean) => {
        const results = () => (Object.values(stores.workLogs) as Array<{ user_id: string }>).filter(fn)
        return {
          sortBy: vi.fn(async () => results()),
          toArray: vi.fn(async () => results()),
        }
      }),
    },
    workFinancials: {
      filter: vi.fn((fn: (f: { work_log_id: string }) => boolean) => {
        const results = () => (Object.values(stores.workFinancials) as Array<{ work_log_id: string }>).filter(fn)
        return {
          sortBy: vi.fn(async () => results()),
          toArray: vi.fn(async () => results()),
        }
      }),
    },
  })),
}))

// Stub browser APIs not present in jsdom
const mockClick = vi.fn()
const mockRevokeObjectURL = vi.fn()
const mockCreateObjectURL = vi.fn(() => 'blob:mock')
vi.stubGlobal('URL', { createObjectURL: mockCreateObjectURL, revokeObjectURL: mockRevokeObjectURL })
vi.spyOn(document, 'createElement').mockReturnValue({
  click: mockClick,
  set href(_: string) {},
  set download(_: string) {},
} as unknown as HTMLElement)

import { exportCustomersCSV, exportWorkLogsCSV } from '@/lib/csv'

describe('csv export', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.keys(stores).forEach((k) => { stores[k] = {} })
  })

  it('exportCustomersCSV creates a Blob and triggers download', async () => {
    stores.customers['c1'] = {
      id: 'c1',
      user_id: 'u1',
      name: '홍길동',
      phone: '010-1234-5678',
      email: null,
      address: null,
      memo: null,
      updatedAt: Date.now(),
    }

    await exportCustomersCSV('u1')

    expect(mockCreateObjectURL).toHaveBeenCalledOnce()
    expect(mockClick).toHaveBeenCalledOnce()
    expect(mockRevokeObjectURL).toHaveBeenCalledOnce()
  })

  it('exportWorkLogsCSV creates a Blob and triggers download', async () => {
    stores.workLogs['w1'] = {
      id: 'w1',
      user_id: 'u1',
      customer_id: 'c1',
      work_type: 'cleaning',
      worked_at: '2026-05-21',
      memo: null,
      updatedAt: Date.now(),
    }

    await exportWorkLogsCSV('u1')

    expect(mockCreateObjectURL).toHaveBeenCalledOnce()
    expect(mockClick).toHaveBeenCalledOnce()
  })
})
