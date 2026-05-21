'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

const SUPPORTED_COUNTRIES = [
  { code: 'KR', name: '대한민국', flag: '🇰🇷' },
  { code: 'JP', name: '日本', flag: '🇯🇵' },
  { code: 'VN', name: 'Việt Nam', flag: '🇻🇳' },
  { code: 'TH', name: 'ประเทศไทย', flag: '🇹🇭' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'MM', name: 'မြန်မာ', flag: '🇲🇲' },
  { code: 'KH', name: 'កម្ពុជា', flag: '🇰🇭' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Deutschland', flag: '🇩🇪' },
  { code: 'ES', name: 'España', flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
]

function detectCountryFromLocale(): string {
  if (typeof navigator === 'undefined') return 'US'
  const lang = navigator.language || 'en-US'
  const region = lang.split('-')[1]?.toUpperCase()
  if (region && SUPPORTED_COUNTRIES.some((c) => c.code === region)) return region
  const langCode = lang.split('-')[0].toLowerCase()
  const LANG_MAP: Record<string, string> = {
    ko: 'KR', ja: 'JP', vi: 'VN', th: 'TH', id: 'ID', my: 'MM',
    km: 'KH', ms: 'MY', hi: 'IN', fr: 'FR', de: 'DE', es: 'ES', pt: 'PT',
  }
  return LANG_MAP[langCode] ?? 'US'
}

export function OnboardingClient() {
  const router = useRouter()
  const [selected, setSelected] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [showList, setShowList] = useState(false)

  useEffect(() => {
    setSelected(detectCountryFromLocale())
  }, [])

  const selectedCountry = SUPPORTED_COUNTRIES.find((c) => c.code === selected)

  async function handleConfirm() {
    if (!selected) return
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error } = await supabase
          .from('users')
          .update({ country_code: selected })
          .eq('id', user.id)
        if (error) throw error
      }
      localStorage.setItem('bitnal_country', selected)
      router.push('/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '저장에 실패했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="w-full max-w-sm p-6 space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <Globe size={24} className="text-blue-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">어느 나라에서 사용하시나요?</h1>
        <p className="text-sm text-gray-500 mt-1">
          요금, 알림, 언어를 지역에 맞게 설정합니다
        </p>
      </div>

      {!showList ? (
        <div className="space-y-3">
          <div
            className="flex items-center justify-between p-3 border-2 border-blue-500 rounded-xl bg-blue-50 cursor-pointer"
            onClick={() => setShowList(true)}
          >
            <span className="text-lg">
              {selectedCountry?.flag} {selectedCountry?.name}
            </span>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
          <p className="text-xs text-center text-gray-400">
            탭하면 다른 나라를 선택할 수 있습니다
          </p>
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-1 border rounded-xl p-1">
          {SUPPORTED_COUNTRIES.map((country) => (
            <button
              key={country.code}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                selected === country.code
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => { setSelected(country.code); setShowList(false) }}
            >
              <span>{country.flag}</span>
              <span className="text-sm">{country.name}</span>
            </button>
          ))}
        </div>
      )}

      <Button className="w-full" onClick={handleConfirm} disabled={!selected || isSaving}>
        {isSaving ? '저장 중...' : '시작하기'}
      </Button>

      <p className="text-xs text-center text-gray-400">
        설정 → 내 지역에서 나중에 변경할 수 있습니다
      </p>
    </Card>
  )
}
