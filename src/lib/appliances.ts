import { getDB, type LocalAppliance } from '@/db/dexie'

export interface CreateApplianceInput {
  customer_id: string
  brand?: string | null
  model_name?: string | null
  appliance_type: string
  install_date?: string | null
  serial_number?: string | null
  memo?: string | null
}

export async function getAppliancesByCustomer(customerId: string): Promise<LocalAppliance[]> {
  const db = getDB()
  return db.appliances.where('customerId').equals(customerId).toArray()
}

export async function getApplianceById(id: string): Promise<LocalAppliance | undefined> {
  const db = getDB()
  return db.appliances.get(id)
}

export async function createAppliance(input: CreateApplianceInput): Promise<LocalAppliance> {
  const db = getDB()
  const appliance: LocalAppliance = {
    id: crypto.randomUUID(),
    customer_id: input.customer_id,
    brand: input.brand ?? null,
    model_name: input.model_name ?? null,
    appliance_type: input.appliance_type,
    install_date: input.install_date ?? null,
    serial_number: input.serial_number ?? null,
    memo: input.memo ?? null,
    updatedAt: Date.now(),
  }
  await db.appliances.add(appliance)
  return appliance
}

export async function updateAppliance(
  id: string,
  input: Partial<CreateApplianceInput>
): Promise<LocalAppliance> {
  const db = getDB()
  const existing = await db.appliances.get(id)
  if (!existing) throw new Error('Appliance not found')
  const updated: LocalAppliance = { ...existing, ...input, updatedAt: Date.now() }
  await db.appliances.put(updated)
  return updated
}

export async function deleteAppliance(id: string): Promise<void> {
  const db = getDB()
  await db.appliances.delete(id)
}

export async function countAppliances(customerId: string): Promise<number> {
  const db = getDB()
  return db.appliances.where('customerId').equals(customerId).count()
}
