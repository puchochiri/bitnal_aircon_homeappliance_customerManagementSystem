'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
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

const financialSchema = z.object({
  type: z.enum(['revenue', 'cost']),
  amount: z.number().min(0),
  description: z.string().max(200).optional().or(z.literal('')),
})

const schema = z.object({
  work_type: z.string().min(1, '작업 유형을 선택해주세요'),
  worked_at: z.string().min(1, '작업일을 입력해주세요'),
  memo: z.string().max(1000).optional().or(z.literal('')),
  financials: z.array(financialSchema),
})

export type WorkLogFormValues = z.infer<typeof schema>

const WORK_TYPES = ['cleaning', 'repair', 'inspection', 'installation', 'other']

interface WorkLogFormProps {
  onSubmit: (values: WorkLogFormValues) => void
  isLoading?: boolean
  onCancel: () => void
}

export function WorkLogForm({ onSubmit, isLoading, onCancel }: WorkLogFormProps) {
  const { t } = useTranslation()
  const today = new Date().toISOString().slice(0, 10)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<WorkLogFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      work_type: 'cleaning',
      worked_at: today,
      memo: '',
      financials: [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'financials' })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>{t('workLog.workType')} *</Label>
        <Select
          defaultValue="cleaning"
          onValueChange={(v) => v && setValue('work_type', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WORK_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`workLog.types.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.work_type && <p className="text-sm text-red-500">{errors.work_type.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="worked_at">{t('workLog.workedAt')} *</Label>
        <Input id="worked_at" type="date" {...register('worked_at')} />
        {errors.worked_at && <p className="text-sm text-red-500">{errors.worked_at.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>{t('workLog.financials')}</Label>
          <div className="flex gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => append({ type: 'revenue', amount: 0, description: '' })}
            >
              <Plus size={13} className="mr-1" />
              {t('workLog.revenue')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => append({ type: 'cost', amount: 0, description: '' })}
            >
              <Plus size={13} className="mr-1" />
              {t('workLog.cost')}
            </Button>
          </div>
        </div>
        {fields.map((field, idx) => (
          <div key={field.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <span
              className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                field.type === 'revenue'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {t(`workLog.${field.type}`)}
            </span>
            <Input
              type="number"
              min="0"
              placeholder="금액"
              className="w-24 h-8 text-sm"
              {...register(`financials.${idx}.amount`, { valueAsNumber: true })}
            />
            <Input
              placeholder="항목 설명"
              className="flex-1 h-8 text-sm"
              {...register(`financials.${idx}.description`)}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => remove(idx)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="memo">{t('common.memo')}</Label>
        <Textarea id="memo" {...register('memo')} rows={2} />
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
