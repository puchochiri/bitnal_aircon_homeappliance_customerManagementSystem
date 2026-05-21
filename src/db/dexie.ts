import Dexie, { type Table } from 'dexie'
import type {
  Customer,
  Appliance,
  WorkLog,
  WorkLogAppliance,
  WorkFinancial,
  WorkPhoto,
  Appointment,
} from '@/types/database'

interface SyncQueueItem {
  id?: number
  tableName: string
  operation: 'insert' | 'update' | 'delete'
  recordId: string
  payload: unknown
  createdAt: number
}

type LocalCustomer = Omit<Customer, 'created_at' | 'updated_at'> & {
  updatedAt: number
}
type LocalAppliance = Omit<Appliance, 'created_at' | 'updated_at'> & {
  updatedAt: number
}
type LocalWorkLog = Omit<WorkLog, 'created_at' | 'updated_at'> & {
  updatedAt: number
}
type LocalWorkLogAppliance = WorkLogAppliance
type LocalWorkFinancial = Omit<WorkFinancial, 'created_at'>
type LocalWorkPhoto = Omit<WorkPhoto, 'created_at'>
type LocalAppointment = Omit<Appointment, 'created_at' | 'updated_at'> & {
  updatedAt: number
}

class BitnalDB extends Dexie {
  customers!: Table<LocalCustomer>
  appliances!: Table<LocalAppliance>
  workLogs!: Table<LocalWorkLog>
  workLogAppliances!: Table<LocalWorkLogAppliance>
  workFinancials!: Table<LocalWorkFinancial>
  workPhotos!: Table<LocalWorkPhoto>
  appointments!: Table<LocalAppointment>
  syncQueue!: Table<SyncQueueItem>

  constructor() {
    super('BitnalDB')
    this.version(1).stores({
      customers: '++id, name, phone, updatedAt',
      appliances: '++id, customerId, brand, modelName',
      workLogs: '++id, customerId, workedAt',
      workLogAppliances: '++id, workLogId, applianceId',
      workFinancials: '++id, workLogId, type',
      workPhotos: '++id, workLogId',
      appointments: '++id, customerId, scheduledAt, status',
      syncQueue: '++id, tableName, operation, createdAt',
    })
  }
}

let _db: BitnalDB | null = null

export function getDB(): BitnalDB {
  if (!_db) {
    _db = new BitnalDB()
  }
  return _db
}

export type {
  LocalCustomer,
  LocalAppliance,
  LocalWorkLog,
  LocalWorkLogAppliance,
  LocalWorkFinancial,
  LocalWorkPhoto,
  LocalAppointment,
  SyncQueueItem,
}
