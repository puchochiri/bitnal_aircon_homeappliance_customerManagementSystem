import { getDB, type LocalWorkLog, type LocalWorkFinancial, type LocalWorkLogAppliance } from '@/db/dexie'

export interface CreateWorkLogInput {
  user_id: string
  customer_id: string
  work_type: string
  worked_at: string
  memo?: string | null
  appliance_ids?: string[]
  financials?: Array<{ type: 'revenue' | 'cost'; amount: number; description?: string | null }>
}

export interface WorkLogWithDetails extends LocalWorkLog {
  financials: LocalWorkFinancial[]
  applianceLinks: LocalWorkLogAppliance[]
}

export async function getWorkLogsByCustomer(customerId: string): Promise<WorkLogWithDetails[]> {
  const db = getDB()
  const logs = await db.workLogs.where('customerId').equals(customerId).reverse().sortBy('workedAt')
  return Promise.all(logs.map(enrichWorkLog))
}

export async function getWorkLogsByUser(userId: string): Promise<WorkLogWithDetails[]> {
  const db = getDB()
  const logs = await db.workLogs.filter((w) => w.user_id === userId).toArray()
  logs.sort((a, b) => (a.worked_at < b.worked_at ? 1 : -1))
  return Promise.all(logs.map(enrichWorkLog))
}

export async function getWorkLogById(id: string): Promise<WorkLogWithDetails | undefined> {
  const db = getDB()
  const log = await db.workLogs.get(id)
  if (!log) return undefined
  return enrichWorkLog(log)
}

async function enrichWorkLog(log: LocalWorkLog): Promise<WorkLogWithDetails> {
  const db = getDB()
  const [financials, applianceLinks] = await Promise.all([
    db.workFinancials.where('workLogId').equals(log.id).toArray(),
    db.workLogAppliances.where('workLogId').equals(log.id).toArray(),
  ])
  return { ...log, financials, applianceLinks }
}

export async function createWorkLog(input: CreateWorkLogInput): Promise<WorkLogWithDetails> {
  const db = getDB()
  const now = Date.now()
  const workLog: LocalWorkLog = {
    id: crypto.randomUUID(),
    user_id: input.user_id,
    customer_id: input.customer_id,
    work_type: input.work_type,
    worked_at: input.worked_at,
    memo: input.memo ?? null,
    updatedAt: now,
  }
  await db.workLogs.add(workLog)

  if (input.appliance_ids?.length) {
    const links: LocalWorkLogAppliance[] = input.appliance_ids.map((aid) => ({
      id: crypto.randomUUID(),
      work_log_id: workLog.id,
      appliance_id: aid,
    }))
    await db.workLogAppliances.bulkAdd(links)
  }

  if (input.financials?.length) {
    const fins: LocalWorkFinancial[] = input.financials.map((f) => ({
      id: crypto.randomUUID(),
      work_log_id: workLog.id,
      type: f.type,
      amount: f.amount,
      description: f.description ?? null,
    }))
    await db.workFinancials.bulkAdd(fins)
  }

  return enrichWorkLog(workLog)
}

export async function deleteWorkLog(id: string): Promise<void> {
  const db = getDB()
  await Promise.all([
    db.workLogs.delete(id),
    db.workLogAppliances.where('workLogId').equals(id).delete(),
    db.workFinancials.where('workLogId').equals(id).delete(),
  ])
}

export interface RevenueSummary {
  totalRevenue: number
  totalCost: number
  totalProfit: number
}

export async function getRevenueSummary(
  userId: string,
  fromDate: string,
  toDate: string
): Promise<RevenueSummary> {
  const db = getDB()
  const logs = await db.workLogs
    .filter(
      (w) => w.user_id === userId && w.worked_at >= fromDate && w.worked_at <= toDate
    )
    .toArray()

  const logIds = logs.map((l) => l.id)
  const financials = await db.workFinancials
    .filter((f) => logIds.includes(f.work_log_id))
    .toArray()

  const totalRevenue = financials
    .filter((f) => f.type === 'revenue')
    .reduce((sum, f) => sum + f.amount, 0)
  const totalCost = financials
    .filter((f) => f.type === 'cost')
    .reduce((sum, f) => sum + f.amount, 0)

  return { totalRevenue, totalCost, totalProfit: totalRevenue - totalCost }
}
