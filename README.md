좋은 결정이에요! 이게 사장님 비즈니스 모델에 **가장 잘 맞는 선택**입니다. 이유를 정리하고 최종 스택을 확정해드릴게요.

## 이 결정이 좋은 이유

### 1. 수수료 30% 절약

```
앱스토어 경유: 매출의 15~30% Apple/Google에 지불
웹 직접 결제: 매출의 2.9% Stripe만 지불

월 매출 $1,000 기준:
- 앱스토어: 사장님 수익 $700
- 웹 직접: 사장님 수익 $971

차이: 연 $3,252 (약 450만원)
```

### 2. 심사 지옥 탈출

```
앱스토어 경유: 매번 1~7일 심사, 거부 가능성, 정책 변경 위협
웹 직접: git push → 30초 후 모든 사용자 적용
```

### 3. 1인 개발자 부담 절반

```
앱스토어 경유: iOS + Android + Web = 3가지 빌드/배포/대응
웹 직접: Web 1가지만
```

### 4. Capacitor도 안 써도 됨

스택이 더 단순해져요. 순수 PWA만으로 충분합니다.

## 단순화된 최종 스택

이제 정말 깔끔한 스택이 됐어요.

### 📦 프론트엔드

```
- React 18 + TypeScript
- Vite (빌드)
- vite-plugin-pwa (PWA)
- Tailwind CSS + shadcn/ui (UI)
- React Router (라우팅)
- React Hook Form + Zod (폼)
- i18next (다국어)
- TanStack Query (서버 상태)
- Zustand (클라이언트 상태)
```

### 💾 로컬 저장

```
- Dexie.js (IndexedDB 래퍼)
- browser-image-compression (사진 압축)
```

### ☁️ 백엔드 (유료 사용자만)

```
- Supabase
  ├─ Auth (이메일/Google 로그인)
  ├─ Database (PostgreSQL)
  ├─ Storage (사진)
  └─ Realtime (실시간 동기화)
```

### 💳 결제

```
- Stripe (또는 Paddle/LemonSqueezy)
```

### 🚀 배포

```
- Vercel (글로벌 CDN, 무료)
- 도메인 (Cloudflare Domains, 연 1~2만원)
```

### 📊 모니터링 (선택)

```
- Sentry (에러 추적)
- PostHog (사용자 분석)
```

## 네이티브 기능은 어떻게?

앱스토어 안 가도 **카메라/위치는 웹 표준 API**로 충분히 됩니다.

### 카메라 (현장 사진)

```typescript
// 사진 촬영
<input 
  type="file" 
  accept="image/*" 
  capture="environment"  // 후면 카메라
  onChange={handlePhoto}
/>

// 또는 MediaDevices API로 더 정교한 제어
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: 'environment' }
});
```

✅ iOS Safari, Android Chrome 모두 작동

### 위치 (현장 방문 기록)

```typescript
navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log(position.coords.latitude, position.coords.longitude);
  }
);
```

✅ 모든 브라우저 지원

### 전화 걸기 (고객에게 직접)

```html
<a href="tel:010-1234-5678">전화하기</a>
```

✅ 휴대폰에서 즉시 전화 앱 실행

### 푸시 알림

```typescript
// Service Worker + Web Push API
const permission = await Notification.requestPermission();
const subscription = await registration.pushManager.subscribe({...});
```

✅ iOS 16.4+, Android, Desktop 지원

### 오프라인 작동

```typescript
// Service Worker가 자동으로 처리
// vite-plugin-pwa가 설정해줌
```

✅ 모든 PWA

### 안 되는 것 (실제로 필요 없음)

```
❌ 블루투스 (Web Bluetooth는 iOS 미지원, 어차피 안 씀)
❌ NFC (제한적, 어차피 안 씀)
❌ 백그라운드 위치 추적 (제한적, 어차피 안 씀)
❌ 시스템 연락처 접근 (못 함)
```

에어컨 CRM에서 위 기능들은 사실상 필요 없어요.

## 사용자 입장에서 흐름

### 첫 사용 (무료)

```
1. 브라우저에서 aircon-crm.com 접속
2. "지금 시작" 클릭 (회원가입 X)
3. PWA 설치 안내 표시
   - Chrome: 주소창 옆 설치 버튼 자동 표시
   - iOS Safari: "공유 → 홈 화면에 추가" 가이드
4. 홈 화면에 아이콘 생김
5. 아이콘 탭 → 전체 화면 앱처럼 실행
6. 바로 고객 추가 시작
```

### 유료 전환

```
1. 앱 안에서 "다른 기기에서도 사용하기" 클릭
2. 회원가입 페이지로 이동
3. 이메일 가입 + Stripe 결제 ($7/월)
4. 자동으로 로컬 데이터를 Supabase로 백업
5. 다른 기기에서 같은 계정으로 로그인하면 데이터 자동 동기화
```

## 단순화된 비용 구조

### 운영 비용 (사장님 부담)

```
[0~50명 유료 사용자]
- Vercel: $0 (무료)
- Supabase: $0 (무료 티어)
- 도메인: $1/월
- Stripe: 매출의 2.9% + $0.30/거래
- 총: 거의 $0

[50~5,000명 유료 사용자]
- Vercel: $0~20
- Supabase Pro: $25/월
- 도메인: $1/월
- Stripe: 매출의 2.9% + $0.30/거래
- 총: 약 $26/월 + 거래 수수료
```

### 수익 시나리오

```
[유료 사용자 100명, 월 $7 구독]
- 매출: $700/월
- Stripe 수수료: $23/월 (3.3%)
- 인프라: $26/월
- 순이익: $651/월 (마진 93%)

[유료 사용자 1,000명]
- 매출: $7,000/월
- Stripe 수수료: $233/월
- 인프라: $50/월 (Supabase Pro 충분)
- 순이익: $6,717/월 (마진 96%)
```

이 마진이 가능한 이유는 **무료 사용자가 사장님 인프라를 안 쓰기 때문**이에요. 로컬에만 저장하니까요.

## 글로벌 결제 고민

Stripe 외에 고려할 옵션:

| 서비스 | 특징 | 추천 케이스 |
|---|---|---|
| **Paddle** | Merchant of Record (세금 자동) | 글로벌 + 세금 신경 안 쓰고 싶을 때 |
| **Stripe** | 가장 표준, API 좋음 | 미국/유럽 중심 |
| **LemonSqueezy** | MoR, 사용 쉬움 | 인디 개발자에게 인기 |

**Paddle/LemonSqueezy의 강점**: 사장님 대신 전 세계 VAT/세금을 처리해줘요. Stripe는 사장님이 직접 세금 신고해야 합니다. 1인 창업자에겐 Paddle/LemonSqueezy가 더 편할 수 있어요.

## PWA 설치 안내 (사장님이 만들 UI)

iOS는 자동 설치 안내가 없어서, 사장님이 직접 가이드를 만들어야 해요:

```typescript
// 사용자 환경 감지
const isIOS = /iPhone|iPad/.test(navigator.userAgent);
const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;

if (isIOS && !isInStandaloneMode) {
  // "공유 버튼 → 홈 화면에 추가" 안내 모달 표시
}

// Android/Desktop은 자동
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  // "설치하기" 버튼 표시
  showInstallButton(() => e.prompt());
});
```

이 UX 디자인이 PWA 성공의 큰 부분이에요. 잘 만든 예: figma.com, twitter.com

## 단계별 로드맵 (최종)

### Phase 1: MVP (3~4주)

**목표**: 사장님이 본인 사업에 쓸 수 있는 완성품

- 프로젝트 셋업
- 핵심 기능: 고객/에어컨/작업/예약/매출
- Dexie 로컬 저장
- 사진 촬영 + 저장
- Export/Import (백업)
- PWA 설치 UX
- 한국어만

### Phase 2: 다듬기 (1~2주)

- 영어 추가 (i18next)
- 랜딩 페이지
- 사용 가이드/튜토리얼

### Phase 3: 유료화 (2~3주)

- Supabase 통합 (Auth + DB + Storage)
- 동기화 엔진
- Stripe 결제
- 무료/유료 분기 로직
- 무료→유료 마이그레이션

### Phase 4: 출시 (1주)

- 프로덕션 배포
- 베타 사용자 모집
- 피드백 수집

### Phase 5: 성장 (지속)

- 다른 niche 확장 (에어컨 → 청소, 수리, 일반 서비스업)
- 추가 언어
- 추가 기능 (통계, 알림, PDF 견적서)

---

이제 정말 깔끔하게 정리됐어요. 

✅ **웹 PWA만** (앱스토어 X)  
✅ **무료**: 로컬만 사용, 인프라 비용 0  
✅ **유료**: Supabase 동기화, 매출 거의 100% 사장님 몫  
✅ **하나의 React 코드베이스**  
✅ **글로벌 SaaS** 가능

이제 코딩을 시작할 수 있어요. 다음 중 어떤 걸 도와드릴까요?

1. **프로젝트 초기 셋업 코드** (`npm create`부터 첫 페이지 띄우기까지)
2. **Dexie 스키마 + CRUD 함수**
3. **PWA 설치 UX 디자인** (특히 iOS 대응)
4. **DB 스키마 SQL** (Supabase 테이블 생성용)
5. **랜딩 페이지 디자인 시안**
6. **동기화 엔진 코드**
