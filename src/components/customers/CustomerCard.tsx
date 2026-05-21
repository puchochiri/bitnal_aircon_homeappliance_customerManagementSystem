'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { LocalCustomer } from '@/db/dexie'

interface CustomerCardProps {
  customer: LocalCustomer
}

export function CustomerCard({ customer }: CustomerCardProps) {
  return (
    <Link href={`/customers/${customer.id}`}>
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{customer.name}</h3>
            <div className="mt-1 space-y-0.5">
              {customer.phone && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Phone size={13} />
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Mail size={13} />
                  <span className="truncate">{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin size={13} />
                  <span className="truncate">{customer.address}</span>
                </div>
              )}
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400 flex-shrink-0 ml-2" />
        </div>
      </Card>
    </Link>
  )
}
