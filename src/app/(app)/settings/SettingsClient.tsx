'use client'

import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/Header'
import { localeNames, supportedLocales, type Locale } from '@/i18n/config'

export function SettingsClient() {
  const { t, i18n } = useTranslation()

  function changeLang(lang: Locale) {
    i18n.changeLanguage(lang)
    localStorage.setItem('bitnal_lang', lang)
  }

  return (
    <>
      <Header title={t('nav.settings')} />
      <div className="p-4 space-y-4">
        <Card className="p-4 space-y-3">
          <h2 className="text-sm font-medium text-gray-700">언어 설정</h2>
          <div className="flex gap-2">
            {supportedLocales.map((lang) => (
              <button
                key={lang}
                onClick={() => changeLang(lang)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  i18n.language === lang
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                }`}
              >
                {localeNames[lang]}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-4 space-y-2">
          <h2 className="text-sm font-medium text-gray-700">플랜</h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{t('tier.free')}</Badge>
            <span className="text-sm text-gray-500">
              고객 최대 30명 · 로컬 저장
            </span>
          </div>
          <button className="text-sm text-blue-600 hover:underline">
            {t('tier.upgradeToPro')} →
          </button>
        </Card>

        <Card className="p-4 space-y-2">
          <h2 className="text-sm font-medium text-gray-700">앱 정보</h2>
          <p className="text-sm text-gray-500">Bitnal v0.1.0</p>
          <p className="text-sm text-gray-400">에어컨 세척·가전 유지보수 관리 PWA</p>
        </Card>
      </div>
    </>
  )
}
