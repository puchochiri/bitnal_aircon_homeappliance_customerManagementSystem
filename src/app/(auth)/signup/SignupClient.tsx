'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { signUpWithEmail } from '@/lib/auth'

const schema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(50),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(8, '비밀번호는 8자 이상입니다'),
  passwordConfirm: z.string(),
}).refine((d) => d.password === d.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['passwordConfirm'],
})

type FormValues = z.infer<typeof schema>

export function SignupClient() {
  const { t } = useTranslation()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    try {
      await signUpWithEmail(values.email, values.password, values.name)
      toast.success('가입 완료! 이메일을 확인해주세요')
      router.push('/login')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '회원가입에 실패했습니다'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm p-6 space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-blue-600">Bitnal</h1>
        <p className="text-sm text-gray-500 mt-1">{t('auth.signup')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">{t('common.name')}</Label>
          <Input id="name" {...register('name')} placeholder="홍길동" autoComplete="name" />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input id="email" type="email" autoComplete="email" {...register('email')} placeholder="example@email.com" />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
          <Input id="passwordConfirm" type="password" autoComplete="new-password" {...register('passwordConfirm')} />
          {errors.passwordConfirm && (
            <p className="text-sm text-red-500">{errors.passwordConfirm.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? t('common.loading') : t('auth.signup')}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-blue-600 hover:underline font-medium">
          {t('auth.login')}
        </Link>
      </p>
    </Card>
  )
}
