import type { Metadata } from 'next'
import { OnboardingClient } from './OnboardingClient'

export const metadata: Metadata = { title: 'Bitnal — 시작하기' }

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <OnboardingClient />
    </div>
  )
}
