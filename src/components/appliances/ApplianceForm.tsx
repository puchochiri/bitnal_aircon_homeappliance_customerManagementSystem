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
import type { LocalAppliance } from '@/db/dexie'

const APPLIANCE_TYPES = ['aircon', 'refrigerator', 'washer', 'dryer', 'dishwasher', 'boiler', 'other']

const schema = z.object({
  appliance_type: z.string().min(1),
  brand: z.string().max(100).optional().or(z.literal('')),
  model_name: z.string().max(100).optional().or(z.literal('')),
  install_date: z.string().optional().or(z.literal('')),
  serial_number: z.string().max(100).optional().or(z.literal('')),
  memo: z.string().max(500).optional().or(z.literal('')),
})

export type ApplianceFormValues = z.infer<typeof schema>

interface ApplianceFormProps {
  defaultValues?: Partial<LocalAppliance>
  onSubmit: (values: ApplianceFormValues) => void
  isLoading?: boolean
  onCancel: () => void
}

export function ApplianceForm({
  defaultValues,
  onSubmit,
  isLoading,
  onCancel,
}: ApplianceFormProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ApplianceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      appliance_type: defaultValues?.appliance_type ?? 'aircon',
      brand: defaultValues?.brand ?? '',
      model_name: defaultValues?.model_name ?? '',
      install_date: defaultValues?.install_date ?? '',
      serial_number: defaultValues?.serial_number ?? '',
      memo: defaultValues?.memo ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>{t('appliance.applianceType')} *</Label>
        <Select
          defaultValue={defaultValues?.appliance_type ?? 'aircon'}
          onValueChange={(v) => v && setValue('appliance_type', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {APPLIANCE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`appliance.types.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="brand">{t('appliance.brand')}</Label>
          <Input id="brand" {...register('brand')} placeholder="삼성, LG..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="model_name">{t('appliance.modelName')}</Label>
          <Input id="model_name" {...register('model_name')} placeholder="모델명" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="install_date">{t('appliance.installDate')}</Label>
          <Input id="install_date" type="date" {...register('install_date')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="serial_number">{t('appliance.serialNumber')}</Label>
          <Input id="serial_number" {...register('serial_number')} placeholder="시리얼 번호" />
        </div>
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
