'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { LocalCustomer } from '@/db/dexie'

const schema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(100),
  phone: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email('올바른 이메일 형식이 아닙니다').optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
  memo: z.string().max(1000).optional().or(z.literal('')),
})

export type CustomerFormValues = z.infer<typeof schema>

interface CustomerFormProps {
  defaultValues?: Partial<LocalCustomer>
  onSubmit: (values: CustomerFormValues) => void
  isLoading?: boolean
  onCancel: () => void
}

export function CustomerForm({
  defaultValues,
  onSubmit,
  isLoading,
  onCancel,
}: CustomerFormProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      phone: defaultValues?.phone ?? '',
      email: defaultValues?.email ?? '',
      address: defaultValues?.address ?? '',
      memo: defaultValues?.memo ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">
          {t('common.name')} <span className="text-red-500">*</span>
        </Label>
        <Input id="name" {...register('name')} placeholder="홍길동" />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">{t('common.phone')}</Label>
        <Input id="phone" {...register('phone')} placeholder="010-0000-0000" />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">{t('common.email')}</Label>
        <Input id="email" type="email" {...register('email')} placeholder="example@email.com" />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">{t('common.address')}</Label>
        <Input id="address" {...register('address')} placeholder="서울시 강남구..." />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="memo">{t('common.memo')}</Label>
        <Textarea id="memo" {...register('memo')} rows={3} placeholder="메모를 입력하세요" />
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
