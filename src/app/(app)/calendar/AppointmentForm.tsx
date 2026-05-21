'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { LocalCustomer } from '@/db/dexie'

const WORK_TYPES = ['cleaning', 'repair', 'inspection', 'installation', 'other']

const schema = z.object({
  customer_id: z.string().min(1, '고객을 선택해주세요'),
  scheduled_at: z.string().min(1, '날짜를 입력해주세요'),
  work_type: z.string().optional().or(z.literal('')),
  memo: z.string().max(500).optional().or(z.literal('')),
})

export type AppointmentFormValues = z.infer<typeof schema>

interface AppointmentFormProps {
  customers: LocalCustomer[]
  defaultDate?: string
  onSubmit: (values: AppointmentFormValues) => void
  isLoading?: boolean
  onCancel: () => void
}

export function AppointmentForm({
  customers,
  defaultDate,
  onSubmit,
  isLoading,
  onCancel,
}: AppointmentFormProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_id: '',
      scheduled_at: defaultDate ?? '',
      work_type: '',
      memo: '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>고객 *</Label>
        <Select onValueChange={(v: string | null) => v && setValue('customer_id', v)}>
          <SelectTrigger>
            <SelectValue placeholder="고객 선택..." />
          </SelectTrigger>
          <SelectContent>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} {c.phone ? `(${c.phone})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.customer_id && <p className="text-sm text-red-500">{errors.customer_id.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="scheduled_at">일시 *</Label>
        <Input id="scheduled_at" type="datetime-local" {...register('scheduled_at')} />
        {errors.scheduled_at && <p className="text-sm text-red-500">{errors.scheduled_at.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>{t('workLog.workType')}</Label>
        <Select onValueChange={(v: string | null) => v && setValue('work_type', v)}>
          <SelectTrigger>
            <SelectValue placeholder="작업 유형 선택..." />
          </SelectTrigger>
          <SelectContent>
            {WORK_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`workLog.types.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="memo">{t('common.memo')}</Label>
        <Textarea id="memo" {...register('memo')} rows={2} placeholder="메모..." />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? t('common.loading') : t('common.save')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  )
}
