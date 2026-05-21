'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

declare global {
  interface Window {
    Paddle?: {
      Initialize: (opts: { token: string }) => void
      Checkout: {
        open: (opts: {
          items: Array<{ priceId: string; quantity: number }>
          customer?: { email: string }
          customData?: Record<string, string>
        }) => void
      }
    }
  }
}

const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? ''
const PADDLE_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID ?? ''

const PRO_FEATURES = [
  '고객·가전 무제한',
  '클라우드 동기화 (다중 기기)',
  '현장 사진 5GB 저장',
  '이메일·SMS 고객 알림',
  'AI 작업 보고서 무제한',
  '광고 없는 깔끔한 UI',
  '우선 고객 지원',
]

const COUNTRY_PRICES: Record<string, string> = {
  KR: '₩5,500/월',
  IN: '₹150/월',
}

export function UpgradeClient() {
  const [userEmail, setUserEmail] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [country, setCountry] = useState<string>('')
  const [isPaddleReady, setIsPaddleReady] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email ?? '')
        setUserId(data.user.id)
      }
    })
    supabase
      .from('users')
      .select('country_code')
      .single()
      .then(({ data }) => {
        if (data) setCountry(data.country_code)
      })
  }, [])

  function initPaddle() {
    if (window.Paddle && PADDLE_CLIENT_TOKEN) {
      window.Paddle.Initialize({ token: PADDLE_CLIENT_TOKEN })
      setIsPaddleReady(true)
    }
  }

  function handleUpgrade() {
    if (country === 'KR') {
      // Toss 결제 플로우 — 별도 구현 필요
      toast.info('한국 결제는 곧 토스페이먼츠로 연동됩니다')
      return
    }

    if (!isPaddleReady || !PADDLE_PRICE_ID) {
      toast.error('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요')
      return
    }

    setIsProcessing(true)
    try {
      window.Paddle?.Checkout.open({
        items: [{ priceId: PADDLE_PRICE_ID, quantity: 1 }],
        customer: userEmail ? { email: userEmail } : undefined,
        customData: { user_id: userId },
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const priceLabel = COUNTRY_PRICES[country] ?? '$4/월'

  return (
    <>
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        onLoad={initPaddle}
      />
      <Header title="PRO 업그레이드" />
      <div className="p-4 max-w-md mx-auto space-y-4">
        <Card className="p-5 border-2 border-blue-500 bg-blue-50">
          <div className="flex items-center gap-2 mb-1">
            <div className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              <Zap size={11} />
              PRO
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {priceLabel}
          </p>
          <p className="text-sm text-gray-500 mb-4">14일 무료 체험 포함</p>

          <ul className="space-y-2 mb-5">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <Check size={14} className="text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <Button
            className="w-full"
            size="lg"
            onClick={handleUpgrade}
            disabled={isProcessing}
          >
            {isProcessing ? '처리 중...' : '14일 무료 체험 시작'}
          </Button>
          <p className="text-xs text-center text-gray-400 mt-2">
            신용카드 필요 · 언제든지 취소 가능
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">FREE 플랜과 비교</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="font-medium text-gray-500">기능</div>
            <div className="font-medium text-gray-500 text-center">FREE</div>
            <div className="font-medium text-blue-600 text-center">PRO</div>

            {[
              ['고객', '30명', '무제한'],
              ['가전', '50개', '무제한'],
              ['사진', '없음', '5GB'],
              ['AI', '없음', '무제한'],
              ['동기화', '없음', '클라우드'],
              ['알림', '없음', '이메일·SMS'],
            ].map(([feature, free, pro]) => (
              <>
                <div key={`${feature}-f`} className="text-gray-600">{feature}</div>
                <div key={`${feature}-fv`} className="text-center text-gray-400">{free}</div>
                <div key={`${feature}-pv`} className="text-center text-blue-600 font-medium">{pro}</div>
              </>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
