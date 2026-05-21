import type { Metadata } from 'next'
import { RevenueClient } from './RevenueClient'

export const metadata: Metadata = { title: '매출 관리' }

export default function RevenuePage() {
  return <RevenueClient />
}
