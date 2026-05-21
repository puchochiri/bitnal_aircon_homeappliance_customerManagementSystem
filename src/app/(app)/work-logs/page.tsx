import type { Metadata } from 'next'
import { WorkLogsClient } from './WorkLogsClient'

export const metadata: Metadata = { title: '작업 일지' }

export default function WorkLogsPage() {
  return <WorkLogsClient />
}
