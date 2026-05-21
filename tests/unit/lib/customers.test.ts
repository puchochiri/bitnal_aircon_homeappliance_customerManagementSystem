import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/db/dexie', () => {
  const store: Record<string, object> = {}

  const table = {
    add: vi.fn(async (item: { id: string }) => {
      store[item.id] = item
      return item.id
    }),
    put: vi.fn(async (item: { id: string }) => {
      store[item.id] = item
      return item.id
    }),
    get: vi.fn(async (id: string) => store[id]),
    delete: vi.fn(async (id: string) => {
      delete store[id]
    }),
    filter: vi.fn(() => ({
      sortBy: vi.fn(async () => Object.values(store)),
      count: vi.fn(async () => Object.values(store).length),
      toArray: vi.fn(async () => Object.values(store)),
    })),
  }

  return {
    getDB: vi.fn(() => ({ customers: table })),
  }
})

import { createCustomer, updateCustomer, deleteCustomer } from '@/lib/customers'

describe('customers lib', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a customer with required fields', async () => {
    // Arrange
    const input = { user_id: 'user-1', name: '홍길동', phone: '010-1234-5678' }

    // Act
    const result = await createCustomer(input)

    // Assert
    expect(result.name).toBe('홍길동')
    expect(result.phone).toBe('010-1234-5678')
    expect(result.user_id).toBe('user-1')
    expect(result.id).toBeTruthy()
  })

  it('sets null for optional fields when not provided', async () => {
    // Arrange
    const input = { user_id: 'user-1', name: '김철수' }

    // Act
    const result = await createCustomer(input)

    // Assert
    expect(result.phone).toBeNull()
    expect(result.email).toBeNull()
    expect(result.address).toBeNull()
    expect(result.memo).toBeNull()
  })

  it('updates customer fields immutably', async () => {
    // Arrange
    const created = await createCustomer({ user_id: 'user-1', name: '이영희' })

    // Act
    const updated = await updateCustomer(created.id, { name: '이영희(수정)' })

    // Assert
    expect(updated.name).toBe('이영희(수정)')
    expect(updated.id).toBe(created.id)
  })

  it('throws when updating non-existent customer', async () => {
    // Arrange / Act / Assert
    await expect(updateCustomer('non-existent', { name: 'test' })).rejects.toThrow(
      'Customer not found'
    )
  })
})
