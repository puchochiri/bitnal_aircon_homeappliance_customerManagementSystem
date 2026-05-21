import { supabase } from '@/lib/supabase/client'
import { getDB } from '@/db/dexie'

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'success'

export interface SyncResult {
  status: SyncStatus
  pushed: number
  pulled: number
  error?: string
}

export async function pushLocalToCloud(userId: string): Promise<SyncResult> {
  const db = getDB()
  const queue = await db.syncQueue.orderBy('createdAt').toArray()

  if (queue.length === 0) return { status: 'success', pushed: 0, pulled: 0 }

  let pushed = 0
  const failed: number[] = []

  for (const item of queue) {
    try {
      if (item.operation === 'insert' || item.operation === 'update') {
        const { error } = await supabase
          .from(item.tableName as 'customers')
          .upsert(item.payload as Record<string, unknown>)
        if (error) throw error
      } else if (item.operation === 'delete') {
        const { error } = await supabase
          .from(item.tableName as 'customers')
          .delete()
          .eq('id', item.recordId)
          .eq('user_id', userId)
        if (error) throw error
      }
      if (item.id !== undefined) await db.syncQueue.delete(item.id)
      pushed++
    } catch {
      if (item.id !== undefined) failed.push(item.id)
    }
  }

  if (failed.length > 0) {
    return {
      status: 'error',
      pushed,
      pulled: 0,
      error: `${failed.length}개 항목 동기화 실패`,
    }
  }

  return { status: 'success', pushed, pulled: 0 }
}

export async function pullCloudToLocal(userId: string): Promise<SyncResult> {
  const db = getDB()

  try {
    const { data: customers, error: cErr } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
    if (cErr) throw cErr

    if (customers?.length) {
      const localCustomers = customers.map((c) => ({
        ...c,
        updatedAt: new Date(c.updated_at).getTime(),
      }))
      await db.customers.bulkPut(localCustomers)
    }

    const customerIds = (customers ?? []).map((c: { id: string }) => c.id)

    if (customerIds.length > 0) {
      const { data: appliances, error: aErr } = await supabase
        .from('appliances')
        .select('*')
        .in('customer_id', customerIds)
      if (aErr) throw aErr

      if (appliances?.length) {
        const local = appliances.map((a) => ({
          ...a,
          updatedAt: new Date(a.updated_at).getTime(),
        }))
        await db.appliances.bulkPut(local)
      }
    }

    const { data: workLogs, error: wErr } = await supabase
      .from('work_logs')
      .select('*')
      .eq('user_id', userId)
    if (wErr) throw wErr

    if (workLogs?.length) {
      const local = workLogs.map((w) => ({
        ...w,
        updatedAt: new Date(w.updated_at).getTime(),
      }))
      await db.workLogs.bulkPut(local)
    }

    const { data: appointments, error: aptErr } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
    if (aptErr) throw aptErr

    if (appointments?.length) {
      const local = appointments.map((a) => ({
        ...a,
        updatedAt: new Date(a.updated_at).getTime(),
      }))
      await db.appointments.bulkPut(local)
    }

    const pulled =
      (customers?.length ?? 0) +
      (workLogs?.length ?? 0) +
      (appointments?.length ?? 0)

    return { status: 'success', pushed: 0, pulled }
  } catch (err) {
    return {
      status: 'error',
      pushed: 0,
      pulled: 0,
      error: err instanceof Error ? err.message : '동기화 실패',
    }
  }
}
