import { getDB, type LocalCustomer } from '@/db/dexie'

export interface CreateCustomerInput {
  user_id: string
  name: string
  phone?: string | null
  email?: string | null
  address?: string | null
  memo?: string | null
}

export interface UpdateCustomerInput {
  name?: string
  phone?: string | null
  email?: string | null
  address?: string | null
  memo?: string | null
}

export async function getCustomers(userId: string): Promise<LocalCustomer[]> {
  const db = getDB()
  return db.customers.filter((c) => c.user_id === userId).sortBy('updatedAt')
}

export async function getCustomerById(id: string): Promise<LocalCustomer | undefined> {
  const db = getDB()
  return db.customers.get(id)
}

export async function searchCustomers(userId: string, query: string): Promise<LocalCustomer[]> {
  const db = getDB()
  const q = query.toLowerCase()
  return db.customers
    .filter(
      (c) =>
        c.user_id === userId &&
        (c.name.toLowerCase().includes(q) || (c.phone ?? '').includes(q))
    )
    .toArray()
}

export async function createCustomer(input: CreateCustomerInput): Promise<LocalCustomer> {
  const db = getDB()
  const now = Date.now()
  const customer: LocalCustomer = {
    id: crypto.randomUUID(),
    user_id: input.user_id,
    name: input.name,
    phone: input.phone ?? null,
    email: input.email ?? null,
    address: input.address ?? null,
    memo: input.memo ?? null,
    updatedAt: now,
  }
  await db.customers.add(customer)
  return customer
}

export async function updateCustomer(
  id: string,
  input: UpdateCustomerInput
): Promise<LocalCustomer> {
  const db = getDB()
  const existing = await db.customers.get(id)
  if (!existing) throw new Error('Customer not found')
  const updated: LocalCustomer = { ...existing, ...input, updatedAt: Date.now() }
  await db.customers.put(updated)
  return updated
}

export async function deleteCustomer(id: string): Promise<void> {
  const db = getDB()
  await db.customers.delete(id)
}

export async function countCustomers(userId: string): Promise<number> {
  const db = getDB()
  return db.customers.filter((c) => c.user_id === userId).count()
}
