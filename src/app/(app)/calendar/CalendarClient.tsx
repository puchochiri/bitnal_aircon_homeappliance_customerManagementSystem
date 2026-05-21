'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction'
import type { EventClickArg } from '@fullcalendar/core'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/Header'
import { getAppointmentsByUser } from '@/lib/appointments'
import { getCustomers } from '@/lib/customers'
import { useCreateAppointment, useUpdateAppointmentStatus, useDeleteAppointment } from '@/hooks/useAppointments'
import type { LocalAppointment } from '@/db/dexie'
import { AppointmentForm, type AppointmentFormValues } from './AppointmentForm'

const DEMO_USER_ID = 'local-user'

const STATUS_COLORS: Record<LocalAppointment['status'], string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  completed: '#10b981',
  cancelled: '#9ca3af',
}

export function CalendarClient() {
  const { t } = useTranslation()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedApt, setSelectedApt] = useState<LocalAppointment | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', DEMO_USER_ID],
    queryFn: () => getAppointmentsByUser(DEMO_USER_ID),
  })

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', DEMO_USER_ID],
    queryFn: () => getCustomers(DEMO_USER_ID),
  })

  const { mutate: createAppointment, isPending } = useCreateAppointment()
  const { mutate: updateStatus } = useUpdateAppointmentStatus()
  const { mutate: deleteAppointment } = useDeleteAppointment()

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
        textColor: '#fff',
        extendedProps: { apt },
      })),
    [appointments, customerMap]
  )

  function handleDateClick(info: DateClickArg) {
    setSelectedDate(info.dateStr)
    setDialogOpen(true)
  }

  function handleEventClick(info: EventClickArg) {
    setSelectedApt(info.event.extendedProps.apt as LocalAppointment)
    setDetailOpen(true)
  }

  function handleCreate(values: AppointmentFormValues) {
    createAppointment(
      {
        user_id: DEMO_USER_ID,
        customer_id: values.customer_id,
        scheduled_at: values.scheduled_at,
        work_type: values.work_type || null,
        memo: values.memo || null,
      },
      { onSuccess: () => setDialogOpen(false) }
    )
  }

  return (
    <>
      <Header
        title={t('calendar.title')}
        right={
          <Button size="sm" onClick={() => { setSelectedDate(''); setDialogOpen(true) }}>
            <Plus size={15} className="mr-1" />
            {t('calendar.addAppointment')}
          </Button>
        }
      />

      <div className="p-4">
        <div className="mb-3 flex gap-2 flex-wrap">
          {(Object.entries(STATUS_COLORS) as [LocalAppointment['status'], string][]).map(([s, color]) => (
            <div key={s} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              {t(`calendar.status.${s}`)}
            </div>
          ))}
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="ko"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('calendar.addAppointment')}</DialogTitle>
          </DialogHeader>
          <AppointmentForm
            customers={customers}
            defaultDate={selectedDate}
            onSubmit={handleCreate}
            isLoading={isPending}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>예약 상세</DialogTitle>
          </DialogHeader>
          {selectedApt && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">고객:</span> {customerMap[selectedApt.customer_id]?.name ?? '-'}</p>
                <p><span className="text-gray-500">일시:</span> {selectedApt.scheduled_at}</p>
                <p><span className="text-gray-500">작업:</span> {selectedApt.work_type ? t(`workLog.types.${selectedApt.work_type}`) : '-'}</p>
                {selectedApt.memo && <p><span className="text-gray-500">메모:</span> {selectedApt.memo}</p>}
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">상태 변경</p>
                <div className="flex gap-2 flex-wrap">
                  {(['pending', 'confirmed', 'completed', 'cancelled'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus({ id: selectedApt.id, status: s }, { onSuccess: () => setDetailOpen(false) })}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                        selectedApt.status === s
                          ? 'text-white border-transparent'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                      style={selectedApt.status === s ? { backgroundColor: STATUS_COLORS[s], borderColor: STATUS_COLORS[s] } : {}}
                    >
                      {t(`calendar.status.${s}`)}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => deleteAppointment(selectedApt.id, { onSuccess: () => setDetailOpen(false) })}
              >
                예약 삭제
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
