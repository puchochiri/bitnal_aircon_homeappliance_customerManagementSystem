'use client'

import { Menu } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const { setSidebarOpen } = useAppStore()

  return (
    <header className="sticky top-0 z-10 bg-white border-b h-14 flex items-center px-4 gap-3">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
      >
        <Menu size={20} />
      </button>
      {title && <h1 className="text-lg font-semibold text-gray-900">{title}</h1>}
    </header>
  )
}
