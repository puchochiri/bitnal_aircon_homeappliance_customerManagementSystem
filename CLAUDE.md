# CLAUDE.md — Bitnal 프로젝트 AI 개발 가이드

> Claude Code가 이 프로젝트에서 작업할 때 반드시 읽고 따라야 할 규칙.
> 새 기능 추가 시 기존 기능을 절대 망가뜨리지 않는 것이 최우선.

---

## 프로젝트 개요

**Bitnal** — 에어컨 세척·가전 유지보수 업체를 위한 글로벌 PWA SaaS  
수익 모델: FREE(로컬) → PRO 구독($4/월) → 광고주(CPM/CPC)

**1차 출시 17개국:** 🇰🇷🇯🇵🇻🇳🇹🇭🇮🇩🇲🇲🇰🇭🇲🇾🇮🇳🇦🇺🇳🇿🇺🇸🇬🇧🇫🇷🇩🇪🇪🇸🇵🇹  
**MVP 언어:** 한국어·영어 → 일본어·베트남어·태국어·인도네시아어·말레이어·힌디어·프랑스어·독일어·스페인어·포르투갈어 (순차)

---

## 아키텍처 요약

```
bitnal/
├── apps/
│   ├── web/          Next.js App Router — 공개 페이지 (SSR/SSG)
│   │                 /models, /community, /support/faq, / (랜딩)
│   └── app/          Vite + React — 인증 필요 앱 (CSR)
│                     /app/**, /advertise/**, /admin/**
├── packages/
│   └── shared/       공통 타입·유틸
├── tests/
│   ├── unit/         Vitest 단위 테스트
│   └── e2e/          Playwright E2E 테스트
└── supabase/
    ├── migrations/   DB 마이그레이션 SQL
    └── functions/    Edge Functions
        ├── gemini-proxy/
        ├── sitemap-gen/
        ├── bulk-send/
        ├── monthly-rewards/
        └── cleanup-expired/
```

---

## 핵심 기술 스택

| 역할 | 기술 |
|------|------|
| 공개 페이지 | Next.js 14 App Router (SSR/SSG/ISR) |
| 앱 페이지 | Vite + React 18 + TypeScript |
| 스타일 | Tailwind CSS + shadcn/ui |
| 서버 상태 | TanStack Query v5 (useQuery, useMutation) |
| 클라이언트 상태 | Zustand |
| 폼 | React Hook Form + Zod |
| 로컬 DB | Dexie.js (IndexedDB 래퍼) |
| 클라우드 DB | Supabase (PostgreSQL + RLS) |
| 인증 | Supabase Auth (이메일 + Google OAuth) |
| 파일 저장 | Supabase Storage |
| AI | Gemini API (Supabase Edge Function 프록시 경유) |
| 결제 | Paddle (글로벌) + 토스페이먼츠 (한국) + Razorpay (인도, Phase 3 추가) |
| 이메일 | Resend |
| SMS | Coolsms (국내) / Twilio (해외) |
| 국제화 | i18next (한국어·영어 우선, 12개 언어 확장) |
| 캘린더 | FullCalendar |
| 단위 테스트 | Vitest + React Testing Library |
| E2E 테스트 | Playwright |
| CI/CD | GitHub Actions + Vercel |

---

## DB 테이블 관계 요약

```
users (1) ─── (m) customers
                     └─── (m) appliances
                     └─── (m) appointments

users (1) ─── (m) work_logs
                     └─── (m) work_log_appliances → appliances
                     └─── (m) work_financials  (type: revenue | cost)
                     └─── (m) work_photos

users (1) ─── (1) user_points
users (1) ─── (m) point_logs

posts ─── (m) comments
posts ─── (m) post_translations
posts ─── (m) post_likes
posts ─── (m) post_bookmarks

bulk_campaigns ─── (m) bulk_campaign_recipients

ad_campaigns ─── (m) ad_impressions
ad_campaigns ─── (m) ad_clicks
```

**핵심 설계 결정:**
- `work_logs`에 `amount`와 `appliance_id`가 없다 → `work_financials`(1:m)와 `work_log_appliances`(1:m)로 분리됨
- `appointments.user_id` 직접 보유 → customer join 없이 캘린더 쿼리 가능
- `work_logs.user_id` 직접 보유 → customer join 없이 매출 대시보드 쿼리 가능

---

## Supabase 사용 패턴

### 클라이언트 초기화

```typescript
// apps/app/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### 쿼리 패턴 (항상 이 형태로)

```typescript
// 조회
const { data, error } = await supabase
  .from('customers')
  .select('*, appliances(*)')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
if (error) throw error

// 삽입
const { data, error } = await supabase
  .from('customers')
  .insert({ user_id: userId, name, phone })
  .select()
  .single()
if (error) throw error

// 수정
const { error } = await supabase
  .from('customers')
  .update({ name, phone })
  .eq('id', customerId)
  .eq('user_id', userId)  // RLS 보강: user_id 조건 항상 포함
if (error) throw error

// 삭제
const { error } = await supabase
  .from('customers')
  .delete()
  .eq('id', customerId)
  .eq('user_id', userId)
if (error) throw error
```

### Edge Function 호출 패턴

```typescript
const { data, error } = await supabase.functions.invoke('gemini-proxy', {
  body: { prompt, context }
})
if (error) throw error
```

---

## 상태 관리 패턴

### 서버 상태 — TanStack Query

```typescript
// 조회
const { data: customers, isLoading } = useQuery({
  queryKey: ['customers', userId],
  queryFn: () => fetchCustomers(userId),
})

// 변경
const { mutate: addCustomer } = useMutation({
  mutationFn: createCustomer,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
})
```

### 클라이언트 상태 — Zustand

```typescript
// apps/app/src/store/useAppStore.ts
interface AppStore {
  selectedCustomerId: string | null
  setSelectedCustomer: (id: string | null) => void
}
```

### 폼 — React Hook Form + Zod

```typescript
const schema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  phone: z.string().optional(),
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
})
```

---

## Dexie (로컬 IndexedDB) 패턴

```typescript
// apps/app/src/db/dexie.ts
import Dexie from 'dexie'

const db = new Dexie('BitnalDB')
db.version(1).stores({
  customers:         '++id, name, phone, updatedAt',
  appliances:        '++id, customerId, brand, modelName',
  workLogs:          '++id, customerId, workedAt',
  workLogAppliances: '++id, workLogId, applianceId',
  workFinancials:    '++id, workLogId, type',
  workPhotos:        '++id, workLogId',
  appointments:      '++id, customerId, scheduledAt, status',
  sync_queue:        '++id, tableName, operation, createdAt',
})

// 사용 패턴
const customers = await db.customers.where('updatedAt').above(lastSync).toArray()
await db.customers.put({ ...customerData, updatedAt: Date.now() })
```

---

## 환경변수 규칙

```
VITE_SUPABASE_URL           공개 (브라우저 접근 가능)
VITE_SUPABASE_ANON_KEY      공개 (RLS로 보호됨)
SUPABASE_SERVICE_ROLE_KEY   비공개 — Edge Function 전용, 절대 클라이언트 노출 금지
GEMINI_API_KEY              비공개 — Edge Function 전용
PADDLE_API_KEY              비공개 — Edge Function 전용
PADDLE_WEBHOOK_SECRET       비공개
TOSS_SECRET_KEY             비공개
RESEND_API_KEY              비공개
COOLSMS_API_KEY             비공개
TWILIO_SID / TWILIO_TOKEN   비공개
RAZORPAY_KEY_ID             비공개 — 인도 결제 (Phase 3 추가)
RAZORPAY_KEY_SECRET         비공개 — 서버 전용
RAZORPAY_WEBHOOK_SECRET     비공개
```

**VITE_ 접두사가 없는 키는 클라이언트에 절대 노출하지 않는다.**

---

## 절대 건드리지 말아야 할 것들

### 파일/폴더

```
supabase/migrations/           기존 마이그레이션 파일 수정 금지
                               (새 마이그레이션 파일 추가는 가능)
apps/app/src/db/dexie.ts       Dexie 스키마 — 변경 전 반드시 먼저 물어볼 것
.env.local                     절대 수정·커밋 금지
.env.production                절대 수정·커밋 금지
```

### 코드 규칙

```
기존 함수 시그니처 변경 금지    (새 함수 추가는 가능)
기존 API 라우트 경로 변경 금지  (새 라우트 추가는 가능)
기존 DB 컬럼명 변경 금지        (마이그레이션 없이)
기존 테스트 삭제 금지           (실패하는 테스트는 수정, 삭제 아님)
Supabase RLS 정책 임의 변경 금지 (변경 전 반드시 명시적으로 알릴 것)
```

---

## DB 스키마 변경 시 필수 절차

```
1. supabase/migrations/ 에 새 마이그레이션 파일 생성
   파일명 형식: YYYYMMDDHHMMSS_설명.sql
   예: 20260521120000_add_work_financials.sql

2. RLS 정책도 마이그레이션에 포함
   ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
   CREATE POLICY ...

3. Dexie 스키마 변경이 필요하면 버전 번호 올리기
   db.version(2).stores({ ... })

4. TypeScript 타입 파일도 함께 업데이트
   packages/shared/types/database.ts
```

---

## 보안 필수 체크

```
모든 Supabase 쿼리:
  □ user_id 조건 포함 (RLS 보강)
  □ 서버 클라이언트(service_role)는 Edge Function 내에서만 사용

사용자 입력:
  □ Zod 스키마로 검증 (클라이언트 + 서버 양쪽)
  □ 마크다운 렌더링 시 DOMPurify 적용 (XSS 방지)

파일 업로드:
  □ 타입 검증 (image/jpeg, image/png, image/webp만 허용)
  □ 크기 제한 (사진: 10MB 이하)

API 키:
  □ VITE_ 접두사 없는 키는 Edge Function에서만 사용
  □ 절대 console.log에 API 키 출력 금지
```

---

## 작업 요청 방식 (권장 패턴)

### 좋은 요청 방법

```
"apps/app/src/app/revenue/ 폴더만 수정해서
 차트에 기간 필터(이번달/지난달/3개월/직접입력)를 추가해줘.
 기존 테스트는 모두 통과해야 하고, 새 기능 테스트도 추가해줘."

"work_logs에 GPS 위치 저장 기능을 추가해줘.
 DB 변경이 필요하면 먼저 계획을 설명해줘."

"먼저 어떻게 구현할지 계획만 설명해줘. 코드는 아직 작성하지 마."
→ 계획 확인 후 → "좋아, 이 계획대로 구현해줘."
```

### 피해야 할 요청

```
❌ "전체 코드베이스를 리팩토링해줘"
❌ "이 기능과 관련된 모든 파일을 최신화해줘"
❌ "더 좋은 구조로 바꿔줘" (범위 무한 확장)
❌ "supabase/migrations/ 파일들을 정리해줘" (기존 마이그레이션 수정 위험)
```

---

## 새 기능 추가 전 체크리스트

```
코드 작성 전:
  □ 기존 관련 테스트 실행 확인 (npx vitest run)
  □ 영향받는 파일 범위 파악
  □ DB 변경 필요 여부 확인

코드 작성 후:
  □ 기존 테스트 전체 통과 (npx vitest run)
  □ 새 기능 테스트 추가
  □ TypeScript 오류 없음 (npx tsc --noEmit)
  □ 새 환경변수 있으면 .env.local.example 업데이트
  □ DB 변경 있으면 마이그레이션 파일 포함
```

---

## 자주 사용하는 명령어

```bash
# 개발 서버
npm run dev                    # 앱 실행
supabase start                 # 로컬 Supabase 시작

# 테스트
npx vitest run                 # 단위 테스트 전체
npx vitest run --coverage      # 커버리지 포함
npx playwright test            # E2E 전체
npx playwright test e2e/customer.spec.ts  # 특정 E2E

# 타입 검사
npx tsc --noEmit

# 린트·포맷
npx eslint .
npx prettier --check .
npx prettier --write .

# DB
supabase db diff -f 마이그레이션명    # 스키마 변경사항 마이그레이션 파일 생성
supabase db reset                    # 로컬 DB 초기화 + 마이그레이션 재적용
supabase db push --project-ref REF   # Supabase 배포

# 빌드
npm run build                  # 전체 빌드
```

---

## 티어 구조 (비즈니스 로직)

```
PUBLIC  → 커뮤니티 읽기, 기종DB 열람, 광고 노출
FREE    → 고객 30명 제한, 가전 50개 제한, 로컬(IndexedDB)만, 사진 없음
PRO     → 무제한, 클라우드 동기화, 사진 5GB, 알림 발송, AI 무제한
ADMIN   → 전체 관리 권한

users.tier: 'free' | 'pro' | 'advertiser' | 'admin'
tier 확인은 항상 서버 (Edge Function 또는 RLS)에서 — 클라이언트 체크만으로 절대 안 됨
```

---

## 국가 처리 원칙 (전체 앱 공통)

```
국가는 users.country_code 하나만 사용한다.
어떤 화면에서도 국가 선택 UI를 새로 만들면 안 된다.

국가 선택이 허용되는 곳:
  - 온보딩 최초 1회 (GPS 감지 확인 모달)
  - 설정 → 내 지역 → 국가 변경

국가가 화면에 표시될 때: 읽기 전용 뱃지만 (예: 🇰🇷 대한민국)
```

---

## 결제 라우팅

```
country_code === 'KR' → 토스페이먼츠 (₩5,500/월)
country_code === 'IN' → Razorpay (₹150/월, Phase 3 추가)
그 외                  → Paddle ($4/월, PPP 로컬라이징 가능)
```

## 알림 채널 우선순위 (구현 순서)

```
1순위: 이메일 (Resend) — 월 3,000건 무료
2순위: SMS (Coolsms 국내 / Twilio 해외)
3순위: 카카오 알림톡 — 한국 사용자 요청 시
4순위: WhatsApp — 글로벌 사용자 요청 시
5순위: LINE — 일본·동남아 사용자 요청 시

사용자 요청이 없으면 3순위 이후는 구현하지 않는다.
```
