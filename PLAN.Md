# PLAN.md — 에어컨·가전 유지보수 고객관리 & 커뮤니티 PWA

> 전 세계 에어컨 세척·가전 유지보수 업체를 위한 SaaS PWA  
> 무료(로컬) → 유료(클라우드 동기화) → 광고주(광고 게재) 3단계 수익 모델

---

## 1. 서비스 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | Bitnal (비트날) — 가전·에어컨 유지보수 플랫폼 |
| 대상 | 에어컨 세척·가전 수리 1인 및 소규모 업체 (전 세계) |
| 형태 | PWA (앱스토어 없음, 웹 직접 배포) |
| 언어 | 한국어 + 영어 (추후 다국어 확장) |
| 배포 | Vercel + Cloudflare 도메인 |

---

## 2. 사용자 티어 구조

```
┌──────────────────────────────────────────────────────────┐
│                     PUBLIC (비회원)                       │
│  커뮤니티 읽기 / 기종별 유지보수 DB 열람 / 광고 노출      │
└──────────────────────────────────────────────────────────┘
         ↓ 가입 (무료)
┌──────────────────────────────────────────────────────────┐
│                   FREE 회원                               │
│  고객관리 + 작업일지 → 로컬(IndexedDB) 저장만             │
│  커뮤니티 쓰기 / 기종DB 기여 / 광고 노출                 │
└──────────────────────────────────────────────────────────┘
         ↓ 월 구독 ($7~9/월)
┌──────────────────────────────────────────────────────────┐
│                   PRO 회원 (유료)                         │
│  Supabase 클라우드 저장 + 멀티기기 동기화                 │
│  사진 클라우드 업로드 / 데이터 백업/복구                  │
│  고급 통계 / PDF 견적서 / 푸시 알림                       │
└──────────────────────────────────────────────────────────┘
         ↓ 별도 광고 요금제 (월정액 or CPC)
┌──────────────────────────────────────────────────────────┐
│                   ADVERTISER (광고주)                     │
│  커뮤니티·기종DB 페이지 내 배너/카드 광고 게재            │
│  지역/기종/검색어 타겟팅 광고                             │
│  광고 대시보드 (노출수, 클릭수 통계)                      │
└──────────────────────────────────────────────────────────┘
```

---

## 3. 핵심 기능 목록

### 3-1. 고객관리 (CRM) — 유료/무료 공통, 저장 위치만 다름

| 기능 | 설명 |
|------|------|
| 고객 등록/수정/삭제 | 이름, 전화, 주소, 메모 |
| 설치 가전 등록 | 기종명, 브랜드, 설치일, 위치(실내/실외/주방 등) |
| 작업 이력 | 작업 날짜, 종류(세척/수리/점검), 금액, 사진, 메모 |
| 예약 관리 | 방문 예약 캘린더, 알림 |
| 매출 통계 | 월별/고객별/기종별 집계 |
| 현장 사진 | 카메라 API → 촬영 → 압축 → 저장 |
| GPS 방문 기록 | Geolocation API로 현장 좌표 저장 |
| 전화 연결 | tel: 링크로 즉시 통화 |
| CSV Export/Import | 데이터 백업 (무료 사용자용) |

### 3-2. 기종별 유지보수 DB — 전체 공개 (비회원 포함)

| 기능 | 설명 |
|------|------|
| 기종 검색 | 브랜드·모델명 검색 |
| 유지보수 가이드 | 세척 주기, 부품 교체 주기, 주의사항 |
| 오류코드 DB | 에러코드 → 원인 + 해결법 |
| 커뮤니티 연동 | 해당 기종의 관련 게시글 표시 |
| 기여 시스템 | FREE 이상 회원이 정보 추가·수정 제안 (관리자 승인) |
| 광고 슬롯 | 기종 페이지 내 관련 부품/서비스 광고 |

### 3-3. 커뮤니티 — 전체 공개 (비회원 읽기, FREE 이상 쓰기)

#### 게시판 구분

| 게시판 | 코드 | 설명 | 특수 기능 |
|--------|------|------|-----------|
| **전체** | `all` | 모든 게시판 글 통합 피드 (기본 진입 화면) | 게시판 뱃지 표시, 무한 스크롤 |
| 자유게시판 | `free` | 업무 팁·노하우·질문·잡담 | 태그(기종/브랜드/작업유형) |
| 기종별 유지보수팁 | `tips` | 기종 연동 유지보수 노하우 공유 | 기종DB 연동, 모델명 태그 필수 |
| 도급게시판 | `contract` | 작업 도급 의뢰·수주 | 지역·단가·기간 필드, 마감일 표시 |
| 구인/구직게시판 | `jobs` | 직원 구함·취업 희망 | 구인/구직 유형 구분, 지역·급여 필드 |
| 판매게시판 | `market` | 부품·장비·공구 중고 거래 | 가격·상태(새것/중고)·거래방식 필드 |
| 공지 | `notice` | 운영자 공지 | 관리자만 작성, 상단 고정 |

> **기본 진입 화면은 `전체(all)` 피드**  
> 최신순으로 모든 게시판 글을 통합 표시. 게시판 탭을 클릭하면 해당 게시판 필터로 전환.

#### 공통 기능

| 기능 | 설명 |
|------|------|
| 게시글 CRUD | 사진 첨부 (최대 5장), 마크다운 지원 |
| 댓글/대댓글 | 중첩 댓글 |
| 좋아요/북마크 | 게시글 반응 |
| 태그 | 기종명, 브랜드, 지역, 작업유형 태그 |
| 검색 | 전문 검색 (Supabase Full-text Search), 게시판별 필터 |
| 신고/차단 | 커뮤니티 자정 시스템 |
| 광고 카드 | 게시글 목록 사이 광고 카드 삽입 |

#### 게시판별 추가 필드

**기종별 유지보수팁** (`tips`)
```
- 연결 기종: appliance_models.id 연동 (기종DB와 양방향 링크)
- 브랜드 / 모델명 태그 (필수)
- 팁 유형: 세척 / 수리 / 절전 / 계절관리 / 기타
- 난이도: 초보 / 중급 / 전문가
- 기종DB의 해당 모델 페이지에도 관련 팁 자동 노출
```

**도급게시판** (`contract`)
```
- 작업 종류: 에어컨 세척 / 수리 / 설치 / 기타
- 지역: 국가 + 도시
- 희망 단가 (선택)
- 작업 기간: 시작일 ~ 종료일
- 모집 인원
- 마감일 (마감 시 자동 종료 표시)
- 의뢰자 연락처 (회원 정보 연동 또는 직접 입력)
```

**구인/구직게시판** (`jobs`)
```
- 유형: 구인 (사람 찾음) / 구직 (일자리 찾음)
- 직종: 에어컨 세척기사 / 수리기사 / 보조 / 기타
- 근무 지역: 국가 + 도시
- 고용 형태: 정직원 / 아르바이트 / 프리랜서 / 도급
- 급여: 월급 / 일급 / 건당 (금액 선택 입력)
- 경력: 무관 / 1년 이상 / 3년 이상 / 5년 이상
- 마감일
```

**판매게시판** (`market`)
```
- 카테고리: 부품 / 장비 / 공구 / 소모품 / 기타
- 가격 (원/달러 선택)
- 상품 상태: 새것 / 거의 새것 / 중고 양호 / 중고
- 거래 방식: 직거래 / 택배 / 모두 가능
- 거래 지역 (직거래 시)
- 판매 완료 표시 기능
```

### 3-4. 광고 시스템 — ADVERTISER 전용

| 기능 | 설명 |
|------|------|
| 광고 등록 | 이미지, 제목, URL, 설명 |
| 타겟팅 | 지역(국가/도시), 기종 카테고리, 키워드 |
| 게재 위치 | 커뮤니티 목록, 기종DB 페이지, 검색 결과 |
| 예산 설정 | 월 예산 한도 |
| 통계 대시보드 | 노출수(Impressions), 클릭수(Clicks), CTR |
| 결제 | Paddle으로 광고 크레딧 충전 |

### 3-5. 사용자 관리 (Admin)

| 기능 | 설명 |
|------|------|
| 회원 목록/조회 | 가입일, 티어, 결제 상태 |
| 구독 관리 | 업그레이드/다운그레이드/취소 |
| 기종DB 승인 | 커뮤니티 기여 콘텐츠 검토/승인 |
| 광고 심사 | 광고 콘텐츠 검토/승인/거부 |
| 신고 처리 | 커뮤니티 신고 대응 |
| 공지 등록 | 전체 공지 발송 |

---

## 4. 기술 스택

### 프론트엔드

```
React 18 + TypeScript
Vite + vite-plugin-pwa
Tailwind CSS + shadcn/ui
React Router v6
React Hook Form + Zod (유효성 검사)
i18next (한국어/영어/다국어)
TanStack Query v5 (서버 상태 캐싱)
Zustand (클라이언트 상태)
```

### 로컬 저장 (FREE 회원 + 오프라인 캐시)

```
Dexie.js — IndexedDB 래퍼
browser-image-compression — 사진 압축
```

### 클라우드 백엔드 (PRO 회원)

```
Supabase
├─ Auth        — 이메일/Google OAuth
├─ PostgreSQL  — 고객/작업/커뮤니티/기종DB
├─ Storage     — 사진/파일
├─ Realtime    — 멀티기기 동기화
└─ Edge Functions — 광고 집계 등 비즈니스 로직
```

### 결제

```
Paddle (권장) — MoR, 전 세계 VAT/세금 자동 처리
또는 LemonSqueezy — 인디 개발자 친화적
(Stripe는 직접 세금 신고 필요 → 글로벌 시 번거로움)
```

### 배포 & 인프라

```
Vercel — 프론트엔드 + Edge Functions (글로벌 CDN)
Cloudflare Domains — 도메인 (연 1~2만원)
Sentry — 에러 추적 (선택)
PostHog — 사용자 행동 분석 (선택)
```

---

## 5. 데이터베이스 스키마 (Supabase PostgreSQL)

### 사용자

```sql
-- Supabase Auth와 연동된 프로필
users
  id                    uuid PK  (= auth.users.id)
  email                 text
  display_name          text
  avatar_url            text
  tier                  text  CHECK IN ('free','pro','advertiser','admin')
  subscription_id       text      -- Paddle 구독 ID
  subscription_expires  timestamptz
  country_code          text
  language              text DEFAULT 'ko'
  created_at            timestamptz
  updated_at            timestamptz
```

### 고객관리 (PRO 클라우드 — FREE는 IndexedDB에만 존재)

```sql
customers
  id          uuid PK
  user_id     uuid FK → users.id
  name        text NOT NULL
  phone       text
  address     text
  lat         numeric
  lng         numeric
  memo        text
  created_at  timestamptz

appliances
  id              uuid PK
  customer_id     uuid FK → customers.id
  brand           text
  model_name      text
  appliance_type  text   -- aircon / washer / fridge / boiler / etc
  installed_at    date
  location        text   -- 거실 / 주방 / 실외기
  serial_number   text
  notes           text

work_logs
  id              uuid PK
  customer_id     uuid FK → customers.id
  appliance_id    uuid FK → appliances.id
  work_type       text   -- cleaning / repair / inspection
  worked_at       date
  amount          numeric
  memo            text
  created_at      timestamptz

work_photos
  id              uuid PK
  work_log_id     uuid FK → work_logs.id
  storage_path    text   -- Supabase Storage 경로
  thumbnail_path  text

appointments
  id              uuid PK
  customer_id     uuid FK → customers.id
  scheduled_at    timestamptz
  work_type       text
  status          text CHECK IN ('pending','confirmed','done','cancelled')
  memo            text
```

### 기종 DB (전체 공개)

```sql
appliance_models
  id                      uuid PK
  brand                   text NOT NULL
  model_name              text NOT NULL
  appliance_type          text
  manufacture_year        int
  cleaning_cycle_months   int     -- 권장 세척 주기
  filter_replace_months   int
  refrigerant_type        text
  notes                   text
  verified                bool DEFAULT false   -- 관리자 승인
  contributed_by          uuid FK → users.id
  created_at              timestamptz

error_codes
  id                  uuid PK
  appliance_model_id  uuid FK → appliance_models.id
  code                text NOT NULL
  cause               text
  solution            text
  severity            text CHECK IN ('info','warning','critical')
  verified            bool DEFAULT false

maintenance_guides
  id                  uuid PK
  appliance_model_id  uuid FK → appliance_models.id
  title               text
  content             text   -- 마크다운
  guide_type          text   -- cleaning / part_replace / seasonal
  author_id           uuid FK → users.id
  verified            bool DEFAULT false
  created_at          timestamptz
```

### 커뮤니티

```sql
posts
  id          uuid PK
  author_id   uuid FK → users.id
  board             text CHECK IN ('free','tips','contract','jobs','market','notice')
  appliance_model_id uuid FK → appliance_models.id  -- tips 게시판 전용, 나머지 NULL
  title       text NOT NULL
  content     text   -- 마크다운
  tags        text[]
  view_count  int DEFAULT 0
  like_count  int DEFAULT 0
  is_deleted  bool DEFAULT false
  created_at  timestamptz
  updated_at  timestamptz

comments
  id          uuid PK
  post_id     uuid FK → posts.id
  author_id   uuid FK → users.id
  parent_id   uuid FK → comments.id  -- 대댓글
  content     text NOT NULL
  is_deleted  bool DEFAULT false
  created_at  timestamptz

post_likes      (post_id, user_id) PK
post_bookmarks  (post_id, user_id) PK

reports
  id           uuid PK
  reporter_id  uuid FK → users.id
  target_type  text CHECK IN ('post','comment')
  target_id    uuid
  reason       text
  status       text CHECK IN ('pending','resolved','dismissed')
  created_at   timestamptz
```

### 광고

```sql
advertisers
  id            uuid PK
  user_id       uuid FK → users.id
  company_name  text
  credits       numeric DEFAULT 0   -- 충전된 광고 크레딧
  created_at    timestamptz

ad_campaigns
  id                       uuid PK
  advertiser_id            uuid FK → advertisers.id
  title                    text
  image_url                text
  destination_url          text
  target_countries         text[]   -- 빈 배열 = 전체
  target_appliance_types   text[]
  target_keywords          text[]
  placements               text[]   -- ['community','model_db','search']
  daily_budget             numeric
  status                   text CHECK IN ('pending','active','paused','ended')
  approved_at              timestamptz
  starts_at                timestamptz
  ends_at                  timestamptz

ad_impressions
  id           uuid PK
  campaign_id  uuid FK → ad_campaigns.id
  placement    text
  created_at   timestamptz

ad_clicks
  id           uuid PK
  campaign_id  uuid FK → ad_campaigns.id
  placement    text
  created_at   timestamptz
```

---

## 6. 로컬 ↔ 클라우드 동기화 설계

### 무료 → 유료 마이그레이션 플로우

```
1. 사용자가 PRO 결제 완료 (Paddle)
2. Supabase 계정 생성/연결 (Google OAuth 또는 이메일)
3. IndexedDB의 모든 데이터를 배치 upsert로 Supabase 업로드
4. 로컬 IndexedDB는 오프라인 캐시로 유지
5. 이후 모든 CRUD → Supabase 우선 저장 → 로컬 캐시 갱신
```

### 오프라인 → 온라인 복구

```
1. 오프라인 중 작업 → IndexedDB sync_queue 테이블에 적재
2. 네트워크 복구 시 Service Worker가 sync_queue를 Supabase로 배치 전송
3. Supabase Realtime으로 다른 기기 충돌 감지 → last_write_wins 전략
```

### Dexie 로컬 스키마 (FREE + 오프라인 캐시)

```typescript
db.version(1).stores({
  customers:    '++id, name, phone, updatedAt',
  appliances:   '++id, customerId, brand, modelName',
  workLogs:     '++id, customerId, applianceId, workedAt',
  workPhotos:   '++id, workLogId',
  appointments: '++id, customerId, scheduledAt, status',
  sync_queue:   '++id, tableName, operation, createdAt',
});
```

---

## 7. 화면 구성 (라우팅)

```
/                           랜딩 페이지 (비회원)
/login                      로그인
/register                   회원가입

/app                        앱 홈 대시보드 (FREE 이상)
/app/customers              고객 목록
/app/customers/:id          고객 상세 + 가전 + 작업이력
/app/customers/new          고객 등록
/app/appointments           예약 캘린더
/app/revenue                매출 통계
/app/settings               계정 + 구독 관리

/models                     기종 DB 목록 (비회원 공개)
/models/:id                 기종 상세 + 오류코드 + 가이드
/models/new                 기종 등록 (FREE 이상)

/community                  커뮤니티 전체 피드 (기본 진입, 비회원 공개)
/community/free             자유게시판
/community/tips             기종별 유지보수팁 게시판
/community/contract         도급게시판
/community/jobs             구인/구직게시판
/community/market           판매게시판
/community/notice           공지사항
/community/post/:id         게시글 상세
/community/post/new         게시글 작성 (FREE 이상, 게시판 선택)

/advertise                  광고주 랜딩
/advertise/dashboard        광고 대시보드 (ADVERTISER)
/advertise/campaign/new     캠페인 등록

/admin                      관리자 패널 (ADMIN 전용)
/admin/users                회원 관리
/admin/ads                  광고 심사
/admin/models               기종DB 승인
/admin/reports              신고 처리
```

---

## 8. 수익 모델 상세

| 수익원 | 방식 | 단가 |
|--------|------|------|
| PRO 월 구독 | 자동 갱신 | $7~9/월 |
| PRO 연 구독 | 2개월 할인 | $70~90/년 |
| 광고 크레딧 | CPM/CPC 방식 | $5~20 CPM |

### 수익 시뮬레이션

```
[PRO 100명]
  매출:        $700/월
  Paddle 수수료: ~$28 (4%)
  인프라:       $26 (Supabase Pro)
  순이익:       $646/월 (마진 92%)

[PRO 1,000명 + 광고 $500]
  매출:        $7,500/월
  Paddle 수수료: ~$300
  인프라:       $50
  순이익:       $7,150/월 (마진 95%)
```

---

## 9. 개발 로드맵

### Phase 1 — 로컬 MVP (4주)
**목표**: 1인 사업자가 바로 쓸 수 있는 완성품

- [ ] 프로젝트 셋업 (Vite + React + TypeScript + Tailwind + shadcn)
- [ ] PWA 설정 (vite-plugin-pwa + Service Worker + manifest)
- [ ] Dexie 스키마 + CRUD 훅
- [ ] 고객 등록/조회/수정/삭제
- [ ] 가전 등록 (고객별)
- [ ] 작업 이력 등록 + 현장 사진 촬영
- [ ] 예약 캘린더
- [ ] 매출 통계 (월별 차트)
- [ ] CSV Export/Import (로컬 백업)
- [ ] PWA 설치 UX (iOS/Android/Desktop)
- [ ] 한국어 UI

### Phase 2 — 커뮤니티 & 기종DB (3주)
**목표**: 전 세계 사용자가 방문하는 콘텐츠 허브

- [ ] Supabase 프로젝트 셋업 (커뮤니티/기종DB용)
- [ ] 기종 DB 페이지 (비회원 공개)
- [ ] 오류코드 DB
- [ ] 커뮤니티 게시판 (비회원 읽기)
- [ ] 댓글/좋아요/북마크
- [ ] 태그 + Full-text 검색
- [ ] i18next 영어 추가
- [ ] 랜딩 페이지 (SEO 최적화)

### Phase 3 — 인증 & 유료화 (3주)
**목표**: 구독 수익 창출

- [ ] Supabase Auth (이메일 + Google OAuth)
- [ ] FREE 가입 → 커뮤니티 쓰기 권한
- [ ] Paddle 결제 연동 (PRO 구독)
- [ ] 로컬→클라우드 마이그레이션 플로우
- [ ] 멀티기기 동기화 (Supabase Realtime)
- [ ] 사진 클라우드 업로드 (Supabase Storage)
- [ ] 오프라인 sync_queue + 자동 복구
- [ ] 구독 관리 화면

### Phase 4 — 광고 시스템 (2주)
**목표**: 광고 수익 창출

- [ ] 광고주 회원가입 + 심사 플로우
- [ ] 광고 캠페인 등록 (이미지/URL/타겟팅)
- [ ] 커뮤니티·기종DB 내 광고 게재 로직
- [ ] 노출수/클릭수 집계 (Supabase Edge Functions)
- [ ] 광고 대시보드 (CTR 통계)
- [ ] Paddle 광고 크레딧 충전

### Phase 5 — 관리자 & 운영 고도화 (1~2주)

- [ ] Admin 패널 (회원/광고/콘텐츠 관리)
- [ ] 기종DB 기여 승인 워크플로
- [ ] 신고 처리 시스템
- [ ] 푸시 알림 (Web Push API)
- [ ] PDF 견적서 생성 (PRO 전용)
- [ ] 고급 통계 대시보드

### Phase 6 — 출시 & 성장 (지속)

- [ ] 프로덕션 배포 (Vercel)
- [ ] Sentry 에러 추적
- [ ] PostHog 사용자 분석
- [ ] 베타 사용자 모집
- [ ] 추가 언어 (일본어, 스페인어, 태국어, 베트남어)
- [ ] 업종 확장 (보일러, 정수기, 가스레인지, 세탁기)

---

## 10. 비기능 요구사항

| 항목 | 목표 |
|------|------|
| PWA 성능 | Lighthouse PWA/Performance 90점 이상 |
| 오프라인 | 핵심 기능(고객 조회/작업 등록) 오프라인 완전 작동 |
| 보안 | Supabase RLS(Row Level Security) 전 테이블 적용 |
| SEO | 커뮤니티/기종DB 페이지 정적 생성 또는 SSR |
| API 응답 | < 200ms (Supabase 리전 최적화) |
| GDPR | EU 사용자 개인정보 처리방침 + 삭제 요청 대응 |

---

## 11. 보안 체크리스트

- [ ] Supabase RLS: 사용자는 본인 데이터만 CRUD
- [ ] 커뮤니티: 작성자만 수정/삭제 (관리자 예외)
- [ ] 광고: advertiser_id 본인 캠페인만 조회
- [ ] Admin 권한: 서버 측 Edge Function에서 role 검증
- [ ] 입력 검증: Zod 스키마로 모든 폼 검증
- [ ] XSS 방지: 마크다운 렌더링 시 DOMPurify 적용
- [ ] 이미지: 업로드 전 타입/크기 검증
- [ ] Rate Limiting: Edge Function에서 IP 기반 제한

---

## 12. 폴더 구조 (예상)

```
src/
├── app/                  # 인증 필요 (CRM)
│   ├── customers/
│   ├── appointments/
│   ├── revenue/
│   └── settings/
├── public-pages/         # 공개 페이지
│   ├── landing/
│   ├── community/
│   └── models/
├── advertise/            # 광고주 섹션
├── admin/                # 관리자 패널
├── components/           # 공통 UI 컴포넌트
├── db/                   # Dexie 스키마 + 훅
├── lib/
│   ├── supabase.ts
│   ├── sync.ts           # 동기화 엔진
│   └── paddle.ts
├── hooks/                # 커스텀 훅
├── store/                # Zustand 스토어
├── i18n/                 # 번역 파일 (ko, en)
└── types/                # TypeScript 타입
```

---

## 13. 즉시 시작할 작업

1. `npm create vite@latest` — React + TypeScript 프로젝트 생성
2. Tailwind CSS + shadcn/ui 설치
3. vite-plugin-pwa 설정 (manifest + Service Worker)
4. Dexie 스키마 첫 버전 작성
5. 고객 CRUD 화면 구현 (Phase 1 첫 기능)

---

*최종 업데이트: 2026-05-21*
