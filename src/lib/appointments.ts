import { getDB, type LocalAppointment } from '@/db/dexie'

export interface CreateAppointmentInput {
  user_id: string
  customer_id: string
  scheduled_at: string
  work_type?: string | null
  memo?: string | null
  status?: LocalAppointment['status']
}

export async function getAppointmentsByUser(userId: string): Promise<LocalAppointment[]> {
  const db = getDB()
  return db.appointments.filter((a) => a.user_id === userId).toArray()
}

export async function createAppointment(input: CreateAppointmentInput): Promise<LocalAppointment> {
  const db = getDB()
  const apt: LocalAppointment = {
    id: crypto.randomUUID(),
    user_id: input.user_id,
    customer_id: input.customer_id,
    scheduled_at: input.scheduled_at,
    status: input.status ?? 'pending',
    work_type: input.work_type ?? null,
    memo: input.memo ?? null,
    updatedAt: Date.now(),
  }
  await db.appointments.add(apt)
  return apt
}

export async function updateAppointmentStatus(
  id: string,
  status: LocalAppointment['status']
): Promise<void> {
  const db = getDB()
  const existing = await db.appointments.get(id)
  if (!existing) throw new Error('Appointment not found')
  await db.appointments.put({ ...existing, status, updatedAt: Date.now() })
}

export async function deleteAppointment(id: string): Promise<void> {
  const db = getDB()
  await db.appointments.delete(id)
}
