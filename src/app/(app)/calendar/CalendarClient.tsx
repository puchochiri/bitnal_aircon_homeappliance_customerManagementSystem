'use client'

import { useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Header } from '@/components/layout/Header'
import { getAppointmentsByUser } from '@/lib/appointments'
import { getCustomers } from '@/lib/customers'

const DEMO_USER_ID = 'local-user'

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  completed: '#10b981',
  cancelled: '#6b7280',
}

export function CalendarClient() {
  const { t } = useTranslation()
  const qc = useQueryClient()

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', DEMO_USER_ID],
    queryFn: () => getAppointmentsByUser(DEMO_USER_ID),
  })

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', DEMO_USER_ID],
    queryFn: () => getCustomers(DEMO_USER_ID),
  })

  const customerMap = useMemo(
    () => Object.fromEntries(customers.map((c) => [c.id, c])),
    [customers]
  )

  const events = useMemo(
    () =>
      appointments.map((apt) => ({
        id: apt.id,
        title: customerMap[apt.customer_id]?.name ?? '고객',
        date: apt.scheduled_at.slice(0, 10),
        backgroundColor: STATUS_COLORS[apt.status],
        borderColor: STATUS_COLORS[apt.status],
        extendedProps: { apt },
      })),
    [appointments, customerMap]
  )

  return (
    <>
      <Header title={t('calendar.title')} />
      <div className="p-4">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="ko"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: '',
          }}
          events={events}
          height="auto"
          eventClick={(info) => {
            const apt = info.event.extendedProps.apt
            alert(`${customerMap[apt.customer_id]?.name ?? '고객'}\n${apt.scheduled_at}\n상태: ${t(`calendar.status.${apt.status}`)}`)
          }}
        />
      </div>
    </>
  )
}
