import Link from 'next/link'
import type { Metadata } from 'next'
import { Check, Globe, Smartphone, TrendingUp, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Bitnal — 에어컨 세척·가전 유지보수 고객관리',
  description:
    '에어컨 세척·가전 수리 1인 업체를 위한 PWA SaaS. 고객 관리, 작업 일지, 매출 통계, AI 보고서를 무료로 시작하세요.',
  openGraph: {
    title: 'Bitnal — AC & Appliance Maintenance CRM',
    description: 'Free customer management PWA for AC cleaning professionals worldwide.',
    type: 'website',
  },
}

const FEATURES = [
  { icon: Smartphone, title: '앱 설치 불필요', desc: '웹 브라우저에서 바로 사용. PWA로 홈 화면에 추가 가능.' },
  { icon: TrendingUp, title: '매출·비용 통계', desc: '작업별 수입/지출을 기록하고 월별 이익을 한눈에.' },
  { icon: Globe, title: '17개국 지원', desc: '한국·일본·미국·영국·호주 등 17개국, 한국어·영어 제공.' },
  { icon: Zap, title: 'AI 작업 보고서', desc: 'Gemini AI가 작업 완료 메시지와 유지보수 일정을 자동 생성.' },
]

const PLANS = [
  {
    name: 'FREE',
    price: '무료',
    period: '영구',
    features: ['고객 최대 30명', '가전 최대 50개', '작업 일지·캘린더', '로컬 저장 (기기 내)'],
    cta: '무료로 시작',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'PRO',
    price: '$4',
    period: '/월',
    features: ['고객·가전 무제한', '클라우드 동기화', '현장 사진 5GB', '이메일·SMS 알림', 'AI 무제한', '광고 없음'],
    cta: '14일 무료 체험',
    href: '/signup?plan=pro',
    highlight: true,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white/80 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">Bitnal</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              로그인
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              무료 시작
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
          🌏 17개국 지원 · 한국어·영어 제공
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
          에어컨 세척 업체를 위한<br />
          <span className="text-blue-600">무료 고객관리 앱</span>
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
          고객 등록, 작업 일지, 매출 통계, 예약 캘린더까지 — 설치 없이 바로 사용하세요.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/signup"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            무료로 시작하기
          </Link>
          <Link
            href="/dashboard"
            className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            데모 체험
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">신용카드 불필요 · 영구 무료 플랜 있음</p>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            업무에 꼭 필요한 기능만
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-5 shadow-sm">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                  <Icon size={20} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">심플한 요금제</h2>
        <p className="text-center text-gray-500 mb-10 text-sm">
          한국은 ₩5,500/월 · 인도는 ₹150/월 · 그 외 $4/월
        </p>
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {PLANS.map(({ name, price, period, features, cta, href, highlight }) => (
            <div
              key={name}
              className={`rounded-2xl p-6 border-2 ${
                highlight
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-100 bg-white'
              }`}
            >
              {highlight && (
                <div className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full inline-block mb-2">
                  인기
                </div>
              )}
              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">{price}</span>
                <span className="text-gray-500 text-sm">{period}</span>
              </div>
              <p className="text-lg font-semibold text-gray-800 mb-4">{name}</p>
              <ul className="space-y-2 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check size={14} className="text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={href}
                className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  highlight
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-xs text-gray-400">
        <p>© 2026 Bitnal · <Link href="/support/faq" className="hover:underline">FAQ</Link> · <Link href="/support/privacy" className="hover:underline">개인정보처리방침</Link></p>
      </footer>
    </div>
  )
}
