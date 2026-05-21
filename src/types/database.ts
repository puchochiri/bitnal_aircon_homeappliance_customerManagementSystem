export type UserTier = 'free' | 'pro' | 'advertiser' | 'admin'

export interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  country_code: string
  timezone: string
  tier: UserTier
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  user_id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  memo: string | null
  created_at: string
  updated_at: string
}

export interface Appliance {
  id: string
  customer_id: string
  brand: string | null
  model_name: string | null
  appliance_type: string
  install_date: string | null
  serial_number: string | null
  memo: string | null
  created_at: string
  updated_at: string
}

export interface WorkLog {
  id: string
  user_id: string
  customer_id: string
  work_type: string
  worked_at: string
  memo: string | null
  created_at: string
  updated_at: string
}

export interface WorkLogAppliance {
  id: string
  work_log_id: string
  appliance_id: string
}

export type FinancialType = 'revenue' | 'cost'

export interface WorkFinancial {
  id: string
  work_log_id: string
  type: FinancialType
  amount: number
  description: string | null
  created_at: string
}

export interface WorkPhoto {
  id: string
  work_log_id: string
  storage_path: string
  taken_at: string | null
  created_at: string
}

export interface Appointment {
  id: string
  user_id: string
  customer_id: string
  scheduled_at: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  work_type: string | null
  memo: string | null
  created_at: string
  updated_at: string
}

export interface UserPoints {
  user_id: string
  total_points: number
  updated_at: string
}

export interface PointLog {
  id: string
  user_id: string
  delta: number
  reason: string
  created_at: string
}
