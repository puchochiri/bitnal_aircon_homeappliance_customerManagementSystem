import type { Metadata } from 'next'
import { CustomerListClient } from './CustomerListClient'

export const metadata: Metadata = { title: '고객 관리' }

export default function CustomersPage() {
  return <CustomerListClient />
}
