import { describe, it, expect, beforeEach, vi } from 'vitest'

const store: Record<string, object> = {}

vi.mock('@/db/dexie', () => {
  const table = {
    add: vi.fn(async (item: { id: string }) => { store[item.id] = item; return item.id }),
    put: vi.fn(async (item: { id: string }) => { store[item.id] = item; return item.id }),
    get: vi.fn(async (id: string) => store[id]),
    delete: vi.fn(async (id: string) => { delete store[id] }),
    where: vi.fn(() => ({
      equals: vi.fn(() => ({
        toArray: vi.fn(async () => Object.values(store)),
        count: vi.fn(async () => Object.values(store).length),
      })),
    })),
  }
  return { getDB: vi.fn(() => ({ appliances: table })) }
})

import { createAppliance, updateAppliance, deleteAppliance } from '@/lib/appliances'

describe('appliances lib', () => {
  beforeEach(() => { vi.clearAllMocks(); Object.keys(store).forEach(k => delete store[k]) })

  it('creates an appliance with required fields', async () => {
    // Arrange
    const input = { customer_id: 'cust-1', appliance_type: 'aircon', brand: '삼성' }

    // Act
    const result = await createAppliance(input)

    // Assert
    expect(result.appliance_type).toBe('aircon')
    expect(result.brand).toBe('삼성')
    expect(result.customer_id).toBe('cust-1')
    expect(result.id).toBeTruthy()
  })

  it('sets null for optional fields when omitted', async () => {
    // Arrange / Act
    const result = await createAppliance({ customer_id: 'cust-1', appliance_type: 'washer' })

    // Assert
    expect(result.brand).toBeNull()
    expect(result.model_name).toBeNull()
    expect(result.install_date).toBeNull()
    expect(result.serial_number).toBeNull()
  })

  it('updates appliance fields', async () => {
    // Arrange
    const created = await createAppliance({ customer_id: 'cust-1', appliance_type: 'aircon' })

    // Act
    const updated = await updateAppliance(created.id, { brand: 'LG' })

    // Assert
    expect(updated.brand).toBe('LG')
    expect(updated.id).toBe(created.id)
  })

  it('throws when updating non-existent appliance', async () => {
    await expect(updateAppliance('no-id', { brand: 'X' })).rejects.toThrow('Appliance not found')
  })
})
