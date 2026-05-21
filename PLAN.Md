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
| 언어 | 한국어·영어 (MVP), 일본어·중국어·스페인어·포르투갈어·힌디어·프랑스어·아랍어·터키어·독일어·베트남어 (순차 확장) |
| 배포 | Vercel + Cloudflare 도메인 |

---

## 2. 사용자 티어 구조

```
┌──────────────────────────────────────────────────────────┐
│                     PUBLIC (비회원)                       │
│  커뮤니티 읽기 / 기종별 유지보수 DB 열람 / 광고 노출      │
└──────────────────────────────────────────────────────────┘
         ↓ 회원가입 (무료, 이메일·Google)
┌──────────────────────────────────────────────────────────┐
│                   FREE 회원                               │
│  고객 최대 30명 · 가전 최대 50개 · 사진 없음             │
│  고객관리 + 작업일지 → 로컬(IndexedDB) 저장만             │
│  커뮤니티 쓰기 / 기종DB 기여 / 광고 노출                 │
│  알림 발송 불가 (채널 설정만 가능)                        │
└──────────────────────────────────────────────────────────┘
         ↓ PRO 체험 14일 무료 → 이후 월 $4 또는 연 $40
┌──────────────────────────────────────────────────────────┐
│                   PRO 회원 (유료)                         │
│  고객·가전 무제한 · 사진 클라우드 저장 (5GB)             │
│  Supabase 클라우드 저장 + 멀티기기 동기화                 │
│  데이터 백업/복구 · 고급 통계 · PDF 견적서               │
│  SMS·이메일 발송 월 100건 포함 (초과 시 충전)            │
│  푸시 알림 · 일괄 홍보 발송 · AI 기능 무제한             │
└──────────────────────────────────────────────────────────┘
         ↓ 별도 광고 요금제 (크레딧 충전)
┌──────────────────────────────────────────────────────────┐
│                   ADVERTISER (광고주)                     │
│  커뮤니티·기종DB 페이지 내 배너/카드 광고 게재            │
│  지역/기종/검색어 타겟팅 / CPM·CPC 방식                  │
│  광고 대시보드 (노출수, 클릭수, CTR 통계)                 │
└──────────────────────────────────────────────────────────┘
```

### FREE vs PRO 기능 비교표

| 기능 | FREE | PRO |
|------|------|-----|
| 고객 등록 | 최대 30명 | 무제한 |
| 가전 등록 | 최대 50개 | 무제한 |
| 현장 사진 | ❌ | ✅ 5GB |
| 저장 위치 | 로컬(기기)만 | 클라우드 동기화 |
| 멀티기기 | ❌ | ✅ |
| 데이터 백업 | CSV 수동 | 자동 클라우드 |
| SMS·이메일 발송 | ❌ | ✅ 월 100건 포함 |
| 일괄 홍보 발송 | ❌ | ✅ |
| PDF 견적서 | ❌ | ✅ |
| 고급 통계 | 기본 | 상세 (기종별·지역별) |
| AI 기능 | 일 5회 | 무제한 |
| 광고 노출 | ✅ | ❌ (광고 없음) |
| 가격 | 무료 (영구) | $4/월 또는 $40/년 |

---

## 3. 핵심 기능 목록

### 3-1. 고객관리 (CRM) — 유료/무료 공통, 저장 위치만 다름

| 기능 | 설명 |
|------|------|
| 고객 등록/수정/삭제 | 이름, 전화, 주소, 메모 |
| 설치 가전 등록 | 기종명, 브랜드, 설치일, 위치(실내/실외/주방 등) |
| 작업 이력 | 작업 날짜, 종류(세척/수리/점검), 금액, 사진, 메모 |
| 예약·일정 관리 | 방문 예약 캘린더, 반복 일정, 알림 → 3-6 캘린더 섹션 참고 |
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
> 내 나라 게시글이 최신순으로 먼저, 이후 다른 나라 게시글이 이어서 표시.  
> 다른 나라 게시글은 번역 버튼으로 내 언어로 변환 가능.

#### 국가별 피드 정렬 구조

```
[커뮤니티 피드 — 한국 사용자 예시]

── 🇰🇷 내 나라 (한국) ─────────────────────────────
  ① 삼성 에어컨 E5 오류 해결 팁  |  방금 전
  ② 서울 강남 도급 구합니다       |  10분 전
  ③ LG 드럼세탁기 필터 교체 방법  |  1시간 전
  ...

── 🌐 다른 나라 ──────────────────────────────────
  ④ [🇯🇵 일본] Daikin エアコン E7エラー対処法
     [번역 보기 🌐]
  ⑤ [🇺🇸 미국] Samsung AC compressor noise fix
     [번역 보기 🌐]
  ⑥ [🇻🇳 베트남] Sửa máy lạnh Panasonic lỗi H11
     [번역 보기 🌐]
  ...
```

**피드 정렬 로직:**

```
1순위: 내 국가(country_code 일치) 게시글 → 최신순
2순위: 다른 나라 게시글 → 최신순
      (단, 내 나라 게시글이 20개 미만이면 다른 나라 게시글을 섞어 표시)

각 게시글에 국기 이모지 + 국가명 뱃지 표시
```

#### 게시글 번역 기능

**번역 요청 흐름:**

```
다른 나라 게시글의 [번역 보기 🌐] 버튼 클릭
  ↓
1순위: DB 캐시 확인 (이미 번역된 내용 있으면 즉시 표시)
  ↓ 없으면
2순위: Gemini API 무료 티어로 번역 실행 (기존 AI 엔진 활용)
  ↓
번역 결과를 post_translations 테이블에 캐시 저장
  → 다음 사람은 캐시에서 즉시 표시 (API 비용 절감)
  ↓
원문 보기 / 번역 보기 토글 버튼 제공
```

**번역 표시 UI:**

```
[원문] Daikin エアコン E7エラー対処法 ...
[번역 보기 🌐] ← 클릭

[번역됨 🇯🇵→🇰🇷] 다이킨 에어컨 E7 오류 대처법 ...
[원문 보기]  ⚠️ AI 번역으로 부정확할 수 있습니다
```

**번역 캐시 정책:**

```
- 번역 결과는 post_translations 테이블에 (post_id, target_lang) 키로 저장
- 동일 게시글을 다른 사용자가 같은 언어로 번역 요청 시 캐시 반환
- 번역 비용: Gemini 무료 티어 내 처리 → 운영 비용 $0
- 비회원도 번역 가능 (단, 일 10회 제한 / FREE 이상 무제한)
```

#### 공통 기능

| 기능 | 설명 |
|------|------|
| 게시글 CRUD | 사진 첨부 (최대 5장), 마크다운 지원 |
| 댓글/대댓글 | 중첩 댓글 |
| 좋아요/북마크 | 게시글 반응 |
| 태그 | 기종명, 브랜드, 지역, 작업유형 태그 |
| 검색 | 전문 검색 (Supabase Full-text Search), 게시판별 필터 |
| SNS 공유 | 게시글을 외부 SNS로 공유 (아래 상세 참고) |
| 신고/차단 | 커뮤니티 자정 시스템 |
| 광고 카드 | 게시글 목록 사이 광고 카드 삽입 |

#### SNS 공유 기능

**공유 방식 — PWA Web Share API 우선**

```
모바일 (iOS/Android PWA):
  navigator.share() 호출 → 기기 기본 공유 시트 표시
  → 사용자가 원하는 앱(카카오톡·인스타·라인 등) 직접 선택
  → 별도 버튼 불필요, 운영체제가 알아서 처리

데스크톱 (Web Share API 미지원):
  개별 공유 버튼 표시 (아이콘 형태)
```

**데스크톱 지원 공유 채널**

| 채널 | 공유 내용 |
|------|-----------|
| 카카오톡 | Kakao SDK — 제목 + 미리보기 + 링크 |
| X (Twitter) | 제목 + URL |
| Facebook | URL (FB OG 태그로 미리보기 자동 생성) |
| WhatsApp | 제목 + URL |
| LINE | 제목 + URL |
| 링크 복사 | URL 클립보드 복사 + 토스트 알림 |

**공유 시 전달 내용**

```
제목:    게시글 제목
설명:    본문 첫 100자 요약
이미지:  첨부 사진 첫 장 (없으면 서비스 기본 OG 이미지)
URL:     https://도메인/community/post/:id
         (비회원도 열람 가능한 공개 URL)
```

**OG(Open Graph) 메타태그 — 공유 미리보기 최적화**

```html
<!-- 게시글 상세 페이지에 동적 생성 -->
<meta property="og:title"       content="게시글 제목" />
<meta property="og:description" content="본문 100자 요약" />
<meta property="og:image"       content="첫 번째 첨부 사진 URL" />
<meta property="og:url"         content="https://도메인/community/post/:id" />
<meta name="twitter:card"       content="summary_large_image" />
```

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

### 3-4. 캘린더 일정관리 — 유료/무료 공통, 저장 위치만 다름

#### 뷰 종류

| 뷰 | 설명 |
|----|------|
| 월간 뷰 | 한 달 전체 일정 조망, 날짜 클릭 → 해당 일 일정 목록 |
| 주간 뷰 | 7일 타임라인, 시간대별 일정 블록 |
| 일간 뷰 | 하루 상세 타임라인 |
| 목록 뷰 | 예정된 일정을 리스트로 표시 (모바일 기본) |

#### 일정 유형 및 색상 구분

| 유형 | 색상 | 설명 |
|------|------|------|
| 방문 예약 | 파랑 | 고객 방문·작업 예약 |
| 정기 세척 | 초록 | 가전별 정기 세척 주기 자동 생성 |
| 부품 교체 | 주황 | 필터·부품 교체 주기 자동 생성 |
| 개인 일정 | 회색 | 휴가·개인 메모 |
| 마감 임박 | 빨강 | 도급/구인 마감일 연동 (커뮤니티) |

#### 핵심 기능

| 기능 | 설명 |
|------|------|
| 일정 등록/수정/삭제 | 제목, 고객 연결, 가전 연결, 작업 유형, 시간, 메모 |
| 반복 일정 | 매주·매월·N개월마다 반복 설정 |
| 자동 일정 생성 | 가전 등록 시 세척 주기·부품 교체 주기 기반으로 일정 자동 생성 |
| 드래그 앤 드롭 | 일정 블록을 끌어서 날짜·시간 변경 |
| 고객/가전 연결 | 일정에서 고객 상세·가전 정보로 바로 이동 |
| 작업 완료 처리 | 일정에서 작업 이력으로 즉시 전환 (금액·사진 입력) |
| 오늘 하루 요약 | 앱 홈 대시보드에 당일 일정 카드 표시 |
| 푸시 알림 | 방문 예약 1일 전·1시간 전 알림 (PRO, Web Push API) |
| 공유 링크 | 고객에게 예약 확인 링크 공유 (PRO) |

#### 자동 일정 생성 로직

```
가전 등록 시:
  cleaning_cycle_months 설정 → 오늘 기준 N개월 후 "정기 세척" 일정 자동 생성
  filter_replace_months 설정 → 오늘 기준 N개월 후 "필터 교체" 일정 자동 생성

작업 완료 처리 시:
  다음 정기 세척 일정 자동 갱신 (완료일 기준 +N개월)
```

---

### 3-5. 고객 알림 시스템 — 유료/무료 공통 (발송 채널은 PRO)

#### 알림 동의 관리

| 항목 | 설명 |
|------|------|
| 동의 체크 | 고객 등록·수정 시 채널별 수신 동의 체크박스 |
| 동의 채널 | 문자(SMS) / 이메일 / 카카오톡 / WhatsApp / LINE 각각 독립 동의 |
| 동의 철회 | 고객이 수신거부 링크 클릭 시 즉시 비활성화 |
| 동의 이력 | 동의·철회 일시 기록 (GDPR·개인정보보호법 대응) |

#### 발송 채널

| 채널 | 서비스 | 비용 | 대상 지역 |
|------|--------|------|-----------|
| 문자(SMS) | Coolsms (국내) / Twilio (해외) | 건당 과금 | 전 세계 |
| 이메일 | Resend (월 3,000건 무료) | 무료~소액 | 전 세계 |
| 카카오톡 | 카카오 알림톡 API | 건당 과금 | 한국 |
| WhatsApp | Meta Business API | 건당 과금 | 글로벌 |
| LINE | LINE Notify API | 무료 | 일본·동남아 |

#### 발송 트리거 유형

| 유형 | 조건 | 예시 메시지 |
|------|------|-------------|
| 정기 세척 알림 | 가전 세척 주기 도래 N일 전 | "에어컨 정기 세척 시기가 됐습니다" |
| 예약 확인 알림 | 방문 예약 1일 전·당일 아침 | "내일 오전 10시 방문 예정입니다" |
| 작업 완료 안내 | 작업 이력 완료 처리 시 | "오늘 작업이 완료됐습니다. 영수증 첨부" |
| 부품 교체 알림 | 교체 주기 도래 N일 전 | "필터 교체 시기가 됐습니다" |
| 수동 발송 | 업주가 직접 선택 발송 | 자유 문구 |
| 이벤트 알림 | 업주가 설정한 특별 기간 | "여름철 에어컨 점검 이벤트" |

#### AI 문자 자동 작성 (→ 3-8 AI 섹션 연동)

```
고객 이력(가전 종류·마지막 작업일·작업 내역) 기반으로
AI가 자연스러운 알림 문구 초안 자동 생성
→ 업주가 확인 후 수정 발송
```

#### 일괄 홍보 메시지 발송 (Bulk Send)

> 위치로 묶거나 직접 선택한 고객들에게 AI가 고객별 맞춤 문구를 생성하여 일괄 발송

**1단계 — 수신자 선택**

| 선택 방법 | 설명 |
|-----------|------|
| 지역 묶음 선택 | 지도에서 반경 또는 행정구역(동/구/시) 단위로 고객 자동 클러스터링 |
| 필터 선택 | 마지막 작업일 / 가전 종류 / 세척 주기 도래 여부 / 태그 조건으로 필터링 |
| 수동 다중 선택 | 고객 목록에서 체크박스로 개별 선택 |
| 조건 조합 | 지역 + 필터 + 수동 선택 동시 사용 가능 |

```
예시:
  "강남구 + 에어컨 보유 + 마지막 세척 6개월 이상 경과" → 23명 선택됨
  "직접 체크: 홍길동·김철수·이영희" → 3명 선택됨
```

**2단계 — 발송 채널 설정**

```
- 동의한 채널만 자동 활성화 표시
- 우선 채널 선택 (예: 카카오톡 우선, 없으면 SMS)
- 발송 예약 시간 설정 (즉시 / 날짜·시간 예약)
```

**3단계 — AI 고객별 맞춤 문구 생성**

```
[AI 문구 생성 버튼 클릭]
  ↓
선택된 고객 각각의 이력 분석:
  - 고객명
  - 보유 가전 종류·브랜드·모델명
  - 마지막 작업일·작업 종류
  - 총 작업 횟수
  - 주소(동네 이름 활용)
  ↓
고객마다 개인화된 문구 자동 생성:

  [홍길동님] "안녕하세요 홍길동님, 지난 1월에 LG 에어컨
  세척 후 6개월이 지났습니다. 여름이 오기 전에
  정기 세척 받으시면 냉방 효율이 훨씬 좋아집니다 😊"

  [김철수님] "안녕하세요 김철수님, 삼성 스탠드형 에어컨
  점검하신 지 8개월이 됐네요. 무더위 대비해서
  미리 세척 예약하시겠어요?"
```

**4단계 — 미리보기 및 수정**

| 기능 | 설명 |
|------|------|
| 전체 미리보기 | 고객별 생성된 문구를 목록으로 일괄 확인 |
| 개별 수정 | 특정 고객 문구만 직접 편집 |
| 일괄 문구 덮어쓰기 | 전체 공통 문구로 통일하고 싶을 때 |
| 동의 미확인 고객 제외 | 수신 동의 없는 고객 자동 제외 표시 |
| 최종 발송 인원 확인 | "총 23명 중 동의 완료 18명에게 발송" |

**5단계 — 발송 실행**

```
발송 시작 → Supabase Edge Function에서 큐 처리
  ├─ 실시간 진행 상황 표시 (18명 중 12명 완료...)
  ├─ 실패 건 재시도 (1회 자동)
  └─ 완료 후 결과 요약 화면
       ✅ 성공 16명  ❌ 실패 2명 (번호 오류)
```

**발송 결과 화면**

| 항목 | 설명 |
|------|------|
| 성공/실패 건수 | 채널별 성공·실패 집계 |
| 실패 사유 | 번호 오류·수신거부·API 오류 등 |
| 오픈율 추적 | 이메일 발송 시 오픈 여부 추적 |
| 재발송 | 실패 고객만 선택해서 재발송 |

#### 발송 이력 및 통계

| 기능 | 설명 |
|------|------|
| 발송 로그 | 채널·수신자·발송 시각·성공 여부 기록 |
| 캠페인 이력 | 일괄 발송 건별 이력 (날짜·대상 수·성공률) |
| 오픈율 | 이메일 오픈율 추적 |
| 수신거부율 | 채널별 수신거부 현황 |

---

### 3-6. AI 어시스턴트 — 전 티어 무료 제공

> **비용 $0** — 브라우저 내장 AI(Chrome Gemini Nano) 우선 사용,  
> 미지원 브라우저는 Gemini API 무료 티어(일 1M 토큰) 폴백

#### AI 엔진 전략

```
1순위: Chrome Built-in AI (window.ai / Gemini Nano)
       → 완전 무료, 인터넷 없이도 작동, 개인정보 서버 전송 없음
       → Chrome 127+ 지원

2순위: Gemini API 무료 티어 (Google)
       → 분당 15회, 일 1M 토큰 무료
       → Chrome Built-in AI 미지원 브라우저 폴백

※ 서버 API 호출 없음 → 운영 비용 $0 유지
```

#### AI 기능 목록

| 기능 | 설명 | 입력 데이터 |
|------|------|-------------|
| 알림 문자 초안 작성 | 고객 이력 기반 SMS·이메일 문구 자동 생성 | 고객명, 가전종류, 마지막 작업일, 작업 내역 |
| 작업 메모 요약 | 길게 적은 작업 메모를 한 줄로 요약 | 작업 메모 텍스트 |
| 견적 문구 생성 | 작업 항목·금액 입력 시 견적서 설명문 자동 작성 | 작업 항목, 금액 |
| 고객 응대 답변 초안 | 고객 문의 내용 입력 시 답변 초안 제안 | 문의 텍스트 |
| 커뮤니티 게시글 초안 | 작업 경험 입력 시 커뮤니티 팁 게시글 초안 작성 | 작업 유형, 기종, 노하우 메모 |
| 오류코드 해설 | 기종DB 오류코드 입력 시 쉬운 말로 해설 | 오류코드, 기종명 |

#### 사용 흐름 예시 (알림 문자 초안)

```
1. 업주가 고객 상세 화면에서 "알림 보내기" 클릭
2. 발송 채널 선택 (SMS / 이메일 / 카카오)
3. AI 버튼 클릭 → 고객 이력 자동 분석
   - "삼성 에어컨 / 마지막 세척 6개월 전 / 여름철"
4. AI가 문구 초안 생성:
   "안녕하세요 [고객명]님, 지난 1월에 에어컨 세척 후
    6개월이 지났습니다. 여름철 냉방 효율을 위해
    정기 세척을 권장드립니다. 편한 날짜를 알려주시면
    방문 일정 잡아드리겠습니다 😊"
5. 업주가 문구 수정 후 발송
```

#### AI 사용 제한 (무료 유지 위해)

```
Chrome Built-in AI: 제한 없음 (로컬 실행)
Gemini API 폴백:
  - FREE 회원: 일 20회
  - PRO 회원: 일 100회
  (Gemini API 무료 티어 한도 내 충분히 운영 가능)
```

---

### 3-7. 종목 선택 & 콘텐츠 개인화 필터링

> 사용자가 자신이 취급하는 가전 종목을 선택하면  
> 커뮤니티·기종DB·알림·광고 등 **모든 콘텐츠가 해당 종목만 표시**됨

#### 취급 종목 선택 (회원가입 직후 온보딩 + 설정에서 언제든 변경)

```
선택 가능 종목 (다중 선택):

[에어컨]  [세탁기]  [냉장고]  [보일러]
[정수기]  [공기청정기]  [건조기]  [식기세척기]
[가스레인지]  [전자레인지]  [TV·영상기기]  [기타 가전]

→ 선택한 종목만 이후 모든 화면에서 기본 필터로 적용
→ "전체 보기" 토글로 언제든 필터 해제 가능
```

#### 종목 필터가 적용되는 화면

| 화면 | 필터 동작 |
|------|-----------|
| 커뮤니티 전체 피드 | 선택 종목 태그가 달린 게시글만 표시 |
| 기종별 유지보수팁 게시판 | 선택 종목 기종의 팁만 표시 |
| 기종 DB | 선택 종목 기종만 목록에 표시 |
| 오류코드 검색 | 선택 종목 기종의 오류코드만 표시 |
| 홈 대시보드 | 선택 종목 관련 최신 팁·공지 카드 표시 |
| 광고 | 선택 종목 관련 광고만 노출 (광고주 타겟팅 연동) |
| 알림 자동화 | 선택 종목 기준 세척 주기·교체 주기 알림 |

#### UI 동작 방식

```
[커뮤니티 화면 예시 — 에어컨·세탁기 선택 시]

상단 필터 바:
  [내 종목 ✓]  [에어컨 ×]  [세탁기 ×]  [전체 보기]
                                         ↑ 클릭 시 전체 피드로 전환

게시글 목록:
  ✅ "삼성 에어컨 E1 오류코드 해결법" — 표시
  ✅ "드럼세탁기 세척 노하우" — 표시
  ❌ "냉장고 냉각 불량 수리기" — 숨김 (냉장고 미선택)
  ❌ "보일러 점화 오류" — 숨김 (보일러 미선택)

[종목 추가] 버튼 → 설정 화면으로 이동
```

#### 국가 자동 감지 및 설정

**GPS 기반 자동 감지 (첫 실행 시):**

```
앱 첫 실행 또는 회원가입 시:
  1. Geolocation API로 현재 좌표 획득
     (위치 권한 거부 시 → IP 기반 감지로 폴백: ipapi.co 무료 API)
  2. 좌표 → 국가 코드 변환 (reverse geocoding)
  3. "현재 위치: 🇰🇷 대한민국으로 설정되었습니다. 맞나요?" 확인 모달
     [맞아요 ✓]  [변경할게요]
  4. 확인 시 → 계정에 country_code 저장 + 언어 자동 설정 (ko)
```

**수동 변경 (언제든지):**

```
경로: 설정 → 내 지역 → 국가 변경
  - 국가 검색 + 국기 목록에서 선택
  - 변경 즉시 피드 정렬 기준 반영
  - "현재 위치로 재감지" 버튼 (GPS 재실행)
```

**국가 설정이 적용되는 곳:**

| 적용 화면 | 동작 |
|-----------|------|
| 커뮤니티 피드 | 내 나라 게시글 최신순 우선 표시 |
| 도급·구인 게시판 | 내 나라 공고 먼저 표시 |
| 판매 게시판 | 내 나라 매물 먼저 표시 |
| 광고 | 내 나라 타겟 광고 우선 노출 |
| 알림 발송 | SMS 국가코드 자동 설정 |

#### 온보딩 흐름 (첫 로그인 시)

```
0단계: GPS 자동으로 국가 감지 → 확인 모달 (자동, 1초 이내)
1단계: "어떤 가전을 취급하시나요?" (종목 다중 선택)
2단계: "주로 활동하는 지역은?" (국가 자동 입력됨, 도시만 추가 선택)
3단계: "경력은 얼마나 되셨나요?" (선택 — 커뮤니티 프로필 표시용)
→ 완료 → 홈으로 진입 (국가 + 종목 기반 피드 즉시 적용)
```

#### 비회원의 경우

```
GPS 또는 IP로 국가 자동 감지 → 로컬 스토리지에 임시 저장
→ 회원가입 시 계정으로 이전
→ 감지 실패 시 전체 콘텐츠 표시 (기본값)
```

---

### 3-8. 광고 시스템 — ADVERTISER 전용

| 기능 | 설명 |
|------|------|
| 광고 등록 | 이미지, 제목, URL, 설명 |
| 타겟팅 | 지역(국가/도시), 기종 카테고리, 키워드 |
| 게재 위치 | 커뮤니티 목록, 기종DB 페이지, 검색 결과 |
| 예산 설정 | 월 예산 한도 |
| 통계 대시보드 | 노출수(Impressions), 클릭수(Clicks), CTR |
| 결제 | Paddle으로 광고 크레딧 충전 |

### 3-9. 고객지원 & AI 헬프데스크 — 전 티어 공개

#### 지원 게시판 구성

| 게시판 | 코드 | 작성 권한 | 설명 |
|--------|------|-----------|------|
| 버그 신고 | `bug` | FREE 이상 | 오류·이상 동작 신고 |
| 기능 요청 | `feature` | FREE 이상 | 새 기능·개선 아이디어 제안 |
| 사용 문의 | `inquiry` | FREE 이상 | 사용법·기능 질문 |
| 공식 FAQ | `faq` | 관리자만 작성 | 자주 묻는 질문 공식 답변 |

#### 인기순 우선 표시 (Hot 정렬)

```
게시글 노출 우선순위 계산:
  score = (공감수 × 3) + (댓글수 × 2) + (조회수 × 0.5)
          - 작성 후 경과 시간 패널티 (시간이 지날수록 점수 감소)

기능 요청 게시판:
  "+1 공감" 버튼 → 같은 요청에 동의 클릭
  공감 많은 순으로 자동 정렬 → 개발 우선순위 반영

버그 신고 게시판:
  "나도 겪음" 버튼 → 동일 버그 피해자 수 집계
  피해자 많은 버그를 관리자 대시보드 상단 표시
```

#### 처리 상태 배지 (관리자 관리)

| 상태 | 색상 | 설명 |
|------|------|------|
| 접수됨 | 회색 | 신규 등록 |
| 검토 중 | 파랑 | 운영자 확인 완료 |
| 진행 중 | 주황 | 개발/수정 작업 중 |
| 완료 | 초록 | 해결·배포 완료 |
| 보류 | 노랑 | 일정 미정 또는 반려 |

#### AI 헬프데스크 — 1차 자동 응답

> 문의 작성 전 AI가 먼저 답변 시도 → 해결 안 되면 게시판 등록

**작동 흐름:**

```
1. 사용자가 "문의하기" 또는 "버그 신고" 클릭
2. 문의 내용 입력 (자유 텍스트)
3. [AI 먼저 답변 시도]
   ├─ FAQ DB 검색 → 유사 질문 있으면 즉시 답변 표시
   ├─ 사용법 문의 → 해당 기능 설명 + 화면 이동 링크 제공
   ├─ 버그 신고 → 기존 동일 버그 신고 있으면 링크 안내
   └─ 기능 요청 → 유사 요청 있으면 "+1 공감" 유도
4. AI가 해결 못한 경우
   → "게시판에 등록하기" 버튼 표시
   → 대화 내용을 게시글 초안으로 자동 변환
5. 게시글 등록 완료
```

**AI가 답변 가능한 유형:**

| 질문 유형 | AI 처리 방식 |
|-----------|-------------|
| "에어컨 세척 주기 어떻게 설정해요?" | 캘린더 자동 일정 생성 기능 안내 + 이동 링크 |
| "데이터가 사라졌어요" | 동기화 상태 확인 방법 안내, FAQ 링크 |
| "비밀번호 찾기가 안 돼요" | 이메일 재설정 절차 단계별 안내 |
| "고객 사진이 안 올라가요" | 파일 크기·형식 제한 안내 |
| "어떤 브라우저 써야 해요?" | 권장 환경 안내 |
| "결제를 취소하고 싶어요" | 구독 취소 화면 이동 링크 제공 |

**AI 지식 베이스 구성:**

```
1. 공식 FAQ (faq 게시판 내용 자동 학습)
2. 완료된 문의·버그 신고의 답변 내용
3. 앱 기능 설명 문서 (관리자가 마크다운으로 관리)
4. Chrome Built-in AI / Gemini 무료 티어로 처리
   (기존 AI 엔진 전략과 동일, 추가 비용 없음)
```

#### 관리자 지원 대시보드

| 기능 | 설명 |
|------|------|
| 미처리 문의 현황 | 상태별(접수/검토/진행) 건수 한눈에 표시 |
| 인기 버그 TOP 10 | "나도 겪음" 많은 순 자동 정렬 |
| 인기 기능 요청 TOP 10 | 공감 많은 순 자동 정렬 → 로드맵 반영 참고 |
| 답변 등록 | 게시글에 공식 답변 달기 + 상태 변경 |
| FAQ 자동 등록 | 반복 문의를 FAQ로 전환하는 버튼 |

---

### 3-10. 고수 랭크 제도 & 기여 포상

> 커뮤니티에 기여할수록 랭크가 올라가고, 일정 랭크 이상은 **PRO를 무료**로 사용

#### 랭크 5단계

| 랭크 | 이름 | 필요 포인트 | 혜택 |
|------|------|-------------|------|
| ⭐ 1단계 | 새싹 | 0 ~ 99P | FREE 기본 |
| ⭐⭐ 2단계 | 성장 | 100 ~ 499P | FREE + AI 일 20회 |
| ⭐⭐⭐ 3단계 | 전문가 | 500 ~ 1,999P | **PRO 무료** (클라우드 동기화 포함) |
| 👑 4단계 | 고수 | 2,000 ~ 9,999P | **PRO 무료** + 광고 없음 + 고수 뱃지 |
| 🏆 5단계 | 전설 | 10,000P 이상 | **PRO 무료** + 광고 없음 + 전설 뱃지 + 관리자 권한 일부 |

#### 포인트 획득 기준

| 활동 | 포인트 | 제한 |
|------|--------|------|
| 게시글 작성 | +5P | 일 3회까지 |
| 게시글에 좋아요 받기 | +2P/개 | 무제한 |
| 댓글 작성 | +1P | 일 10회까지 |
| 댓글에 좋아요 받기 | +1P/개 | 무제한 |
| 기종DB 정보 기여 (승인 시) | +20P | 건당 |
| 오류코드 등록 (승인 시) | +15P | 건당 |
| 유지보수 가이드 작성 (승인 시) | +30P | 건당 |
| 베스트 답변 선정 (Q&A) | +50P | 건당 |
| 신규 사용자 추천 가입 | +30P | 건당 |
| 버그 신고 → 실제 수정됨 | +40P | 건당 |
| 관리자 특별 포상 | 자유 | 관리자 수동 지급 |

**어뷰징 방지:**
```
- 자기 글에 자기 좋아요 불가 (본인 제외)
- IP·계정 기반 중복 좋아요 차단
- 일일 포인트 최대 획득 한도: 100P
- 신고 누적 시 포인트 차감 및 랭크 강등 가능
```

#### 기여 포상 시스템

**월간 자동 포상 (매월 1일 자동 집계)**

| 포상 | 대상 | 혜택 |
|------|------|------|
| 이달의 MVP | 전월 포인트 1위 | PRO 3개월 + 전체 공지 소개 |
| 이달의 기여자 | 기종DB 기여 최다자 | PRO 2개월 + 기여자 뱃지 |
| 이달의 도움왕 | 베스트 답변 최다자 | PRO 1개월 + 도움왕 뱃지 |
| Top 10 활동자 | 전월 포인트 2~10위 | PRO 1개월 |

**관리자 수동 포상 (언제든지)**

```
관리자 → 특정 사용자 선택 → 포상 유형 선택:
  - PRO N개월 지급
  - 특별 뱃지 부여 (이름/디자인 지정)
  - 보너스 포인트 지급
  - 커뮤니티 공지로 포상 발표
```

**포인트 랭킹 공개 (커뮤니티 명예의 전당)**

```
/community/ranking 페이지:
  - 전체 랭킹 TOP 50
  - 이달의 TOP 10 (월별 리셋)
  - 국가별 TOP 10
  - 종목별 TOP 10 (에어컨 분야 1위 등)
```

#### 랭크 표시 위치

```
프로필 사진 옆: ⭐⭐⭐ 전문가  (랭크 아이콘 + 이름)
게시글 작성자: [전문가] 홍길동  (뱃지 표시)
댓글 작성자:  [고수 👑] 김철수
검색 결과:    고수 이상 작성글에 👑 아이콘 우선 표시
```

#### 랭크 혜택 상세

```
[전문가 이상 — PRO 무료]
  ✅ 고객·가전 무제한 등록
  ✅ 사진 클라우드 저장
  ✅ 멀티기기 동기화
  ✅ SMS·이메일 발송 (월 100건)
  ✅ PDF 견적서
  ✅ AI 기능 무제한

[고수 이상 — 추가 혜택]
  ✅ 광고 없음 (깨끗한 UI)
  ✅ 👑 고수 뱃지 (프로필·게시글 표시)
  ✅ 커뮤니티 게시글 상단 노출 가중치

[전설 — 최고 혜택]
  ✅ 고수 혜택 전체 포함
  ✅ 🏆 전설 뱃지
  ✅ 기종DB 기여 즉시 승인 (관리자 검토 없이)
  ✅ 커뮤니티 공지 작성 권한
  ✅ 신고 처리 투표 참여 권한
```

---

### 3-11. 사용자 관리 (Admin)

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
i18next + react-i18next (12개 언어, RTL 대응 포함)
TanStack Query v5 (서버 상태 캐싱)
Zustand (클라이언트 상태)
FullCalendar (캘린더 UI — 월간/주간/일간/목록 뷰, 드래그앤드롭)
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

토스페이먼츠 (한국 사용자 전용)
  — KakaoPay, NaverPay, Toss, 신용카드 지원
  — 원화(KRW) 고정 가격 정책 적용 (₩5,500/월, ₩55,000/년)
  — Paddle 웹훅과 별도로 토스 웹훅 처리 필요 (구독 상태 이중 관리)
```

### 알림 발송 서비스

```
이메일:    Resend (월 3,000건 무료 → 유료 시 $20/월 = 50,000건)
SMS:       Coolsms (국내) / Twilio (해외) — 건당 과금
카카오톡:  카카오 알림톡 API — 건당 과금
WhatsApp:  Meta Business API — 건당 과금
LINE:      LINE Messaging API — 월 200건 무료 (LINE Notify는 2025-03 서비스 종료됨)
발송 실행:  Supabase Edge Functions (cron 트리거 + 즉시 발송)
```

### 국가 감지 & 번역

```
국가 자동 감지:
  1순위: Geolocation API (브라우저 GPS) → 좌표 획득
  2순위: ipapi.co 무료 API (IP 기반, 월 30,000회 무료) → 국가 코드 반환
  역지오코딩: Google Maps Geocoding API (or nominatim 무료 오픈소스)

게시글 번역:
  Gemini API 무료 티어 — 번역 결과 post_translations 테이블에 캐시
  (한 번 번역하면 같은 언어 요청은 캐시에서 무료 제공)
  번역 비용: $0 (Gemini 무료 한도 내)
```

### AI 엔진 (운영 비용 $0)

```
1순위: Chrome Built-in AI (window.ai / Gemini Nano)
       — 브라우저 내장, 완전 무료, 오프라인 작동
       — Chrome 127+ 지원 (2024년 7월 이후)

2순위: Gemini API 무료 티어 (Google AI Studio)
       — 분당 15회, 일 1M 토큰 무료
       — Built-in AI 미지원 브라우저 폴백
       — 게시글 번역에도 동일 엔진 사용

API 키 처리:
  - Chrome Built-in AI: 키 불필요 (브라우저 내장)
  - Gemini API: Supabase Edge Function을 얇은 프록시로 사용
    → 클라이언트에 API 키 노출 금지 (보안)
    → Edge Function 무료 한도(월 50만 호출) 내 비용 $0 유지
    → 향후 사용자별 rate limit 적용 가능
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
  city                  text
  language              text DEFAULT 'ko'
  appliance_interests   text[]  DEFAULT '{}'
    -- 선택 종목: aircon / washer / fridge / boiler / purifier /
    --            air_purifier / dryer / dishwasher / stove / microwave / tv / other
  career_years          int     -- 경력 (온보딩 입력, 선택)
  onboarding_done       bool DEFAULT false
  created_at            timestamptz
  updated_at            timestamptz
```

### 고객관리 (PRO 클라우드 — FREE는 IndexedDB에만 존재)

```sql
customers
  id              uuid PK
  user_id         uuid FK → users.id
  name            text NOT NULL
  phone           text
  address         text
  lat             numeric
  lng             numeric
  memo            text
  -- 알림 수신 동의 (채널별)
  consent_sms     bool DEFAULT false
  consent_email   bool DEFAULT false
  consent_kakao   bool DEFAULT false
  consent_whatsapp bool DEFAULT false
  consent_line    bool DEFAULT false
  consent_at      timestamptz          -- 최초 동의 일시
  created_at      timestamptz

-- 알림 동의 변경 이력 (GDPR·개인정보보호법 대응)
customer_consent_logs
  id           uuid PK
  customer_id  uuid FK → customers.id
  channel      text CHECK IN ('sms','email','kakao','whatsapp','line')
  action       text CHECK IN ('agree','revoke')
  created_at   timestamptz

-- 일괄 발송 캠페인 (홍보 메시지 묶음)
bulk_campaigns
  id               uuid PK
  user_id          uuid FK → users.id
  title            text                   -- 캠페인명 (업주 메모용)
  channel          text CHECK IN ('sms','email','kakao','whatsapp','line')
  filter_rule      jsonb                  -- 수신자 선택 조건 스냅샷
  base_message     text                   -- 공통 기본 문구
  ai_generated     bool DEFAULT false
  total_count      int                    -- 발송 대상 총 수
  success_count    int DEFAULT 0
  fail_count       int DEFAULT 0
  status           text CHECK IN ('draft','sending','done','partial_fail')
  scheduled_at     timestamptz            -- 예약 발송 시각 (즉시면 NULL)
  sent_at          timestamptz
  created_at       timestamptz

-- 일괄 발송 수신자별 상세
bulk_campaign_recipients
  id              uuid PK
  campaign_id     uuid FK → bulk_campaigns.id
  customer_id     uuid FK → customers.id
  message         text                   -- 고객별 개인화 문구
  status          text CHECK IN ('pending','sent','failed')
  error_message   text
  sent_at         timestamptz

-- 알림 발송 로그 (단건 + 일괄 공용)
notification_logs
  id              uuid PK
  user_id         uuid FK → users.id
  customer_id     uuid FK → customers.id
  campaign_id     uuid FK → bulk_campaigns.id  -- 일괄 발송 시 연결
  channel         text CHECK IN ('sms','email','kakao','whatsapp','line')
  trigger_type    text CHECK IN ('cleaning_cycle','visit_reminder','work_done','part_replace','manual','event','bulk')
  message         text
  ai_generated    bool DEFAULT false
  status          text CHECK IN ('sent','failed','pending')
  sent_at         timestamptz
  error_message   text

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
  appliance_id    uuid FK → appliances.id   -- 연결 가전 (선택)
  scheduled_at    timestamptz
  end_at          timestamptz               -- 종료 시각
  work_type       text                      -- cleaning / repair / inspection / personal
  event_type      text CHECK IN ('visit','auto_cleaning','auto_part_replace','personal')
  status          text CHECK IN ('pending','confirmed','done','cancelled')
  memo            text
  is_recurring    bool DEFAULT false
  recur_rule      text                      -- 'monthly:3' / 'weekly:1' 등
  notify_before   int DEFAULT 60           -- 알림 시간(분), 0=알림 없음
  share_token     text                      -- 고객 공유 링크용 토큰 (PRO)
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
  id                 uuid PK
  author_id          uuid FK → users.id
  board              text CHECK IN ('free','tips','contract','jobs','market','notice')
  appliance_model_id uuid FK → appliance_models.id  -- tips 전용, 나머지 NULL
  appliance_types    text[] DEFAULT '{}'             -- 종목 태그 (필터링용)
    -- aircon / washer / fridge / boiler / purifier 등 다중 선택 가능
    -- 종목 기반 피드 필터링의 핵심 컬럼 (§3-7)
  country_code       text NOT NULL   -- 작성자 국가 (피드 정렬 기준)
  original_lang      text NOT NULL   -- 원문 언어 코드 (ko/en/ja/zh 등)
  title              text NOT NULL
  content            text            -- 마크다운
  tags               text[]
  view_count         int DEFAULT 0
  like_count         int DEFAULT 0
  is_deleted         bool DEFAULT false
  created_at         timestamptz
  updated_at         timestamptz

-- 번역 캐시 (같은 번역을 반복 요청하지 않도록)
post_translations
  id           uuid PK
  post_id      uuid FK → posts.id
  target_lang  text NOT NULL          -- 번역 목표 언어 (ko/en/ja 등)
  title_translated  text
  content_translated text
  translated_at     timestamptz
  UNIQUE (post_id, target_lang)       -- 언어당 하나만 저장

comments
  id           uuid PK
  post_id      uuid FK → posts.id
  author_id    uuid FK → users.id
  parent_id    uuid FK → comments.id  -- 대댓글
  country_code text                    -- 댓글 작성자 국가
  original_lang text
  content      text NOT NULL
  is_deleted   bool DEFAULT false
  created_at   timestamptz

-- 댓글 번역 캐시
comment_translations
  comment_id        uuid FK → comments.id
  target_lang       text NOT NULL
  content_translated text
  translated_at     timestamptz
  PRIMARY KEY (comment_id, target_lang)

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

### 랭크 & 포인트

```sql
-- 사용자 포인트 현황
user_points
  user_id          uuid PK FK → users.id
  total_points     int DEFAULT 0       -- 누적 전체 포인트
  monthly_points   int DEFAULT 0       -- 이달 포인트 (매월 1일 리셋)
  rank             text DEFAULT 'sprout'
    CHECK IN ('sprout','growth','expert','master','legend')
  rank_updated_at  timestamptz
  pro_granted_by_rank bool DEFAULT false  -- 랭크로 PRO 무료 적용 여부

-- 포인트 적립/차감 이력
point_logs
  id           uuid PK
  user_id      uuid FK → users.id
  points       int                     -- 양수: 적립, 음수: 차감
  reason       text CHECK IN (
    'post_write','post_like_received','comment_write','comment_like_received',
    'model_db_contribute','error_code_add','guide_write',
    'best_answer','referral','bug_report_resolved',
    'admin_reward','abuse_penalty'
  )
  ref_type     text                    -- 'post' / 'comment' / 'model' 등
  ref_id       uuid                    -- 관련 리소스 ID
  created_at   timestamptz

-- 월간 포상 이력
monthly_rewards
  id            uuid PK
  user_id       uuid FK → users.id
  year_month    text NOT NULL           -- '2025-06' 형식
  reward_type   text CHECK IN ('mvp','top_contributor','help_king','top10')
  pro_months    int                     -- 지급된 PRO 개월 수
  badge_name    text                    -- 부여된 뱃지명
  announced     bool DEFAULT false      -- 공지 완료 여부
  created_at    timestamptz

-- 관리자 수동 포상
admin_rewards
  id           uuid PK
  admin_id     uuid FK → users.id
  target_id    uuid FK → users.id
  reward_type  text CHECK IN ('pro_months','badge','points','announcement')
  value        text                     -- '3' (개월) or 뱃지명 or 포인트수
  memo         text                     -- 포상 이유
  created_at   timestamptz

-- 사용자 뱃지 보유 목록
user_badges
  id          uuid PK
  user_id     uuid FK → users.id
  badge_name  text NOT NULL
  badge_icon  text                      -- 이모지 or 이미지 URL
  granted_by  text CHECK IN ('rank','monthly_reward','admin')
  granted_at  timestamptz
```

### 고객지원 게시판

```sql
support_posts
  id            uuid PK
  author_id     uuid FK → users.id
  board         text CHECK IN ('bug','feature','inquiry','faq')
  title         text NOT NULL
  content       text              -- 마크다운
  status        text CHECK IN ('open','reviewing','in_progress','done','hold')
                DEFAULT 'open'
  hot_score     numeric DEFAULT 0 -- (공감×3 + 댓글×2 + 조회×0.5) - 시간패널티
  view_count    int DEFAULT 0
  vote_count    int DEFAULT 0     -- "+1 공감" / "나도 겪음" 합산
  official_answer text            -- 관리자 공식 답변 (마크다운)
  answered_at   timestamptz
  is_deleted    bool DEFAULT false
  created_at    timestamptz
  updated_at    timestamptz

-- "+1 공감" / "나도 겪음" 중복 방지
support_votes
  post_id   uuid FK → support_posts.id
  user_id   uuid FK → users.id
  PRIMARY KEY (post_id, user_id)

-- AI 자동 답변 이력
support_ai_responses
  id          uuid PK
  session_id  text              -- 비회원도 세션 단위로 추적
  user_id     uuid FK → users.id  -- 로그인 시
  query       text              -- 사용자 질문
  answer      text              -- AI 답변
  resolved    bool DEFAULT false -- 사용자가 "해결됐어요" 클릭 여부
  linked_post_id uuid FK → support_posts.id  -- 미해결 시 연결된 게시글
  created_at  timestamptz
```

### 레퍼럴

```sql
-- 추천인 추적 (§11-3 레퍼럴 프로그램)
referrals
  id             uuid PK
  referrer_id    uuid FK → users.id   -- 추천한 사람
  referred_id    uuid FK → users.id   -- 추천받아 가입한 사람
  referral_code  text NOT NULL         -- 추천인 코드
  reward_given   bool DEFAULT false    -- 추천인 보상 지급 여부
  created_at     timestamptz
  UNIQUE (referred_id)                 -- 한 사람은 한 명에게만 추천받을 수 있음

-- Web Push 구독 정보 (Phase 6)
push_subscriptions
  id          uuid PK
  user_id     uuid FK → users.id
  endpoint    text NOT NULL            -- 브라우저 Push 엔드포인트
  p256dh      text NOT NULL            -- 암호화 키
  auth        text NOT NULL            -- 인증 시크릿
  user_agent  text                     -- 디바이스 식별용 (선택)
  created_at  timestamptz
  UNIQUE (user_id, endpoint)
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
/app/calendar               캘린더 (월간 뷰 기본)
/app/calendar/week          주간 뷰
/app/calendar/day           일간 뷰
/app/calendar/list          목록 뷰 (모바일 기본)
/app/calendar/event/:id     일정 상세/수정
/app/calendar/event/new     일정 등록
/app/revenue                매출 통계
/app/notify                 알림 발송 홈 (단건·일괄 선택)
/app/notify/bulk            일괄 홍보 발송 — 수신자 선택 → 문구 생성 → 발송
/app/notify/bulk/:id        발송 캠페인 결과 상세
/app/notify/history         발송 이력 전체 목록
/app/settings               계정 + 구독 관리
/app/settings/interests     취급 종목 선택·변경
/app/profile                내 프로필 (랭크·포인트·뱃지·기여 이력)
/app/profile/:userId        다른 사용자 프로필 (공개)
/onboarding                 첫 로그인 온보딩 (종목·지역·경력 설정)

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
/community/ranking          명예의 전당 (전체·월간·국가별·종목별 TOP)

/support                    고객지원 홈 — AI 헬프데스크 (비회원 공개)
/support/ask                AI에게 먼저 질문 (챗 UI)
/support/bug                버그 신고 게시판 (인기순 기본)
/support/feature            기능 요청 게시판 (공감순 기본)
/support/inquiry            사용 문의 게시판
/support/faq                공식 FAQ
/support/post/:id           지원 게시글 상세

/advertise                  광고주 랜딩
/advertise/dashboard        광고 대시보드 (ADVERTISER)
/advertise/campaign/new     캠페인 등록

/admin                      관리자 패널 (ADMIN 전용)
/admin/users                회원 관리
/admin/ads                  광고 심사
/admin/models               기종DB 승인
/admin/reports              신고 처리
/admin/support              지원 게시판 관리 (미처리 현황·인기 버그·인기 요청)
/admin/ranking              랭크 관리 (포인트 조정·수동 포상·월간 포상 발표)
```

---

## 8. 수익 모델 상세

### 구독 요금

| 수익원 | 방식 | 단가 | 비고 |
|--------|------|------|------|
| PRO 월 구독 | 자동 갱신 | $4/월 (약 5,500원) | 14일 무료 체험 후 과금 |
| PRO 연 구독 | 연 1회 결제 | $40/년 (약 55,000원) | 월 대비 2개월 무료 |
| SMS 발송 추가 충전 | 건당 | $0.03/건 (약 40원) | PRO 월 100건 초과 시 |
| 이메일 발송 추가 | 건당 | 무료 (Resend 한도 내) | 초과 시 $0.001/건 |
| 광고 크레딧 — CPM | 1,000 노출당 | $3~10 CPM | 배너·카드 광고 |
| 광고 크레딧 — CPC | 클릭 1회당 | $0.1~0.5 CPC | 검색 결과 광고 |

### 결제 수단

| 지역 | 수단 | 서비스 |
|------|------|--------|
| 한국 | 카드·카카오페이·네이버페이·토스 | 토스페이먼츠 |
| 글로벌 | 카드·PayPal·Apple Pay·Google Pay | Paddle (MoR, 세금 자동) |

> **한국 사용자** → 토스페이먼츠 (원화 결제, 친숙한 UX)  
> **해외 사용자** → Paddle (VAT·GST 자동 처리, 달러/유로/엔 등)  
> Paddle이 Merchant of Record이므로 해외 세금 신고 불필요

### 14일 무료 체험 정책

```
- 카드 등록 없이 14일 체험 가능 (신용카드 정보 미요구)
- 14일 후 자동 안내 메일 → 결제 등록 유도
- 미결제 시 자동으로 FREE 티어로 다운그레이드
- 클라우드 데이터는 30일간 보존 후 삭제 (재구독 시 복구 가능)
- 체험 종료 3일 전·1일 전 알림 발송
```

### 무료→PRO 전환 트리거 (사용 중 자연스러운 유도)

| 상황 | 표시 메시지 |
|------|-------------|
| 고객 31번째 등록 시도 | "무료 플랜은 최대 30명입니다. PRO로 업그레이드하면 무제한!" |
| 사진 촬영 시도 | "사진 저장은 PRO 기능입니다. 14일 무료 체험해보세요" |
| 두 번째 기기 접속 | "이 기기에서 사용하려면 PRO가 필요해요 (14일 무료)" |
| 알림 발송 시도 | "고객 알림 발송은 PRO 기능입니다" |
| 30일 사용 후 | "30일간 잘 사용하셨네요! 데이터를 안전하게 클라우드에 백업하세요" |
| 폰 교체 안내 | "새 기기에서도 이어서 쓰려면 PRO로 클라우드 백업하세요" |

### 수익 시뮬레이션

```
[PRO 100명, $4/월 + SMS 충전 $50]
  매출:          $450/월
  토스/Paddle 수수료: ~$18 (4%)
  인프라:         $26 (Supabase Pro)
  SMS 원가:       $30 (Coolsms)
  순이익:         $376/월 (마진 84%)

[PRO 1,000명 + 광고 $300 + SMS 충전 $300]
  매출:          $4,600/월
  수수료:         ~$184
  인프라:         $50
  SMS 원가:       $180
  순이익:         $4,186/월 (마진 91%)

[PRO 5,000명 + 광고 $1,000 + SMS 충전 $1,000]
  매출:          $22,000/월
  수수료:         ~$880
  인프라:         $100
  SMS 원가:       $600
  순이익:         $20,420/월 (마진 93%)
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
- [ ] 캘린더 일정관리 (월간/주간/일간/목록 뷰, 드래그앤드롭)
- [ ] 일정 유형별 색상 구분 (방문/정기세척/부품교체/개인)
- [ ] 가전 등록 시 정기 세척·부품 교체 일정 자동 생성
- [ ] 작업 완료 처리 → 다음 정기 일정 자동 갱신
- [ ] 매출 통계 (월별 차트)
- [ ] CSV Export/Import (로컬 백업)
- [ ] PWA 설치 UX (iOS/Android/Desktop)
- [ ] 온보딩 화면 (종목 선택 → 지역 → 경력)
- [ ] 종목 기반 콘텐츠 필터링 (커뮤니티·기종DB·대시보드)
- [ ] 상단 필터 바 (내 종목 / 종목별 태그 / 전체 보기 토글)
- [ ] 한국어 UI

### Phase 2 — 커뮤니티 & 기종DB (3주)
**목표**: 전 세계 사용자가 방문하는 콘텐츠 허브

- [ ] Supabase 프로젝트 셋업 (커뮤니티/기종DB용)
- [ ] 기종 DB 페이지 (비회원 공개)
- [ ] 오류코드 DB
- [ ] 커뮤니티 게시판 (비회원 읽기)
- [ ] 댓글/좋아요/북마크
- [ ] 태그 + Full-text 검색
- [ ] GPS·IP 기반 국가 자동 감지 (Geolocation API + ipapi.co 폴백)
- [ ] 국가별 피드 정렬 (내 나라 최신순 → 다른 나라 최신순)
- [ ] 게시글 국가 뱃지 (국기 이모지 + 국가명)
- [ ] 게시글 번역 버튼 (Gemini API → post_translations 캐시)
- [ ] 설정 화면 국가 수동 변경 + "현재 위치로 재감지" 버튼
- [ ] SNS 공유 (Web Share API + 채널별 버튼 + OG 메타태그)
- [ ] i18next 영어 추가 (번역 키 구조 확정 — 이후 언어 확장 기반)
- [ ] 랜딩 페이지 (SSG + SEO 최적화)
- [ ] robots.txt (AI 크롤러 명시 허용: GPTBot·PerplexityBot·ClaudeBot)
- [ ] llms.txt (AI 검색엔진 안내 파일)
- [ ] JSON-LD Schema.org (SoftwareApplication·FAQPage·HowTo·Product)
- [ ] 동적 메타태그 + hreflang (다국어 페이지별 자동 생성)
- [ ] sitemap.xml 자동 생성 (기종DB·커뮤니티 인기글)
- [ ] Google Search Console + Naver Search Advisor + Bing Webmaster 등록
- [ ] Core Web Vitals 목표치 달성 (LCP < 2.5s, CLS < 0.1)

### Phase 3 — 인증 & 유료화 (3주)
**목표**: 구독 수익 창출

- [ ] Supabase Auth (이메일 + Google OAuth)
- [ ] 이메일 인증 플로우 (Supabase 내장)
- [ ] FREE 가입 → 커뮤니티 쓰기 권한
- [ ] Paddle 결제 연동 (PRO 구독 — 글로벌)
- [ ] 토스페이먼츠 결제 연동 (PRO 구독 — 한국, ₩5,500/월)
- [ ] 결제 웹훅 처리 (Paddle + 토스 이중 관리, users.tier 업데이트)
- [ ] SMS 크레딧 추가 충전 흐름 (Paddle/Toss로 단건 결제)
- [ ] 로컬→클라우드 마이그레이션 플로우
- [ ] 멀티기기 동기화 (Supabase Realtime)
- [ ] 사진 클라우드 업로드 (Supabase Storage)
- [ ] 오프라인 sync_queue + 자동 복구
- [ ] 구독 관리 화면
- [ ] 계정 삭제 기능 (GDPR — 전체 데이터 삭제 또는 익명화)

### Phase 4 — AI 어시스턴트 & 고객 알림 & 랭크 시스템 (5~6주)
**목표**: 업주 업무 자동화 + 고객 재방문율 향상
> ⚠️ 작업량이 많아 Phase 4a(AI+알림 3주) / Phase 4b(랭크+지원게시판 2~3주)로 분리 권장

- [ ] Chrome Built-in AI (window.ai) 연동
- [ ] Gemini API 무료 티어 폴백 구현
- [ ] AI 알림 문자 초안 자동 생성 (고객 이력 기반)
- [ ] AI 작업 메모 요약
- [ ] AI 견적 문구 생성
- [ ] AI 커뮤니티 게시글 초안 작성
- [ ] AI 헬프데스크 챗 (FAQ·사용법 자동 답변)
- [ ] 고객지원 게시판 (버그/기능요청/문의/FAQ)
- [ ] 랭크 포인트 시스템 (point_logs, user_points 집계)
- [ ] 활동별 포인트 자동 적립 (게시글·댓글·좋아요·기종DB 기여)
- [ ] 랭크 자동 승급·강등 (전문가 이상 PRO 자동 무료 적용)
- [ ] 랭크 뱃지 프로필·게시글 표시
- [ ] 월간 자동 포상 (MVP·기여자·도움왕·TOP10 Supabase cron)
- [ ] 관리자 수동 포상 화면
- [ ] 명예의 전당 페이지 (/community/ranking)
- [ ] hot_score 인기순 정렬 (공감·댓글·조회 가중치)
- [ ] "+1 공감" / "나도 겪음" 버튼
- [ ] 처리 상태 배지 (접수→검토→진행→완료)
- [ ] 고객 알림 동의 관리 (채널별 체크박스)
- [ ] 동의 이력 로그 (GDPR 대응)
- [ ] 이메일 발송 (Resend)
- [ ] SMS 발송 (Coolsms / Twilio)
- [ ] 카카오 알림톡 연동
- [ ] WhatsApp / LINE 연동
- [ ] 발송 트리거 자동화 (세척 주기·예약 알림 — Supabase cron)
- [ ] 일괄 홍보 발송 (지역·필터·수동 선택 + AI 개인화 문구)
- [ ] 발송 이력·통계 화면

### Phase 5 — 광고 시스템 (2주)
**목표**: 광고 수익 창출

- [ ] 광고주 회원가입 + 심사 플로우
- [ ] 광고 캠페인 등록 (이미지/URL/타겟팅)
- [ ] 커뮤니티·기종DB 내 광고 게재 로직
- [ ] 노출수/클릭수 집계 (Supabase Edge Functions)
- [ ] 광고 대시보드 (CTR 통계)
- [ ] Paddle 광고 크레딧 충전

### Phase 6 — 관리자 & 운영 고도화 (1~2주)

- [ ] Admin 패널 (회원/광고/콘텐츠 관리)
- [ ] 지원 대시보드 (미처리 문의·인기 버그 TOP10·인기 기능 요청 TOP10)
- [ ] 공식 답변 등록 + 상태 변경 (접수→완료)
- [ ] 반복 문의 → FAQ 자동 전환 버튼
- [ ] AI 지식 베이스 관리 (앱 기능 설명 문서 마크다운 편집)
- [ ] 기종DB 기여 승인 워크플로
- [ ] 신고 처리 시스템
- [ ] 푸시 알림 (Web Push API)
- [ ] PDF 견적서 생성 (PRO 전용)
- [ ] 고급 통계 대시보드

### Phase 7 — 출시 & 성장 (지속)

- [ ] 프로덕션 배포 (Vercel)
- [ ] Sentry 에러 추적
- [ ] PostHog 사용자 분석
- [ ] 베타 사용자 모집
- [ ] 다국어 순차 확장 (우선순위 순)
  - 1차: 일본어(ja), 중국어 간체(zh-CN), 스페인어(es)
  - 2차: 포르투갈어(pt), 베트남어(vi), 힌디어(hi)
  - 3차: 프랑스어(fr), 아랍어(ar), 터키어(tr), 독일어(de)
- [ ] 업종 확장 (보일러, 정수기, 가스레인지, 세탁기)

---

## 10. AI 검색 최적화 (GEO — Generative Engine Optimization)

> Google AI Overviews, Perplexity, ChatGPT Search, Naver AI 등  
> **AI 검색엔진에서 최상단에 노출**되도록 기술·콘텐츠 양면 최적화

### 10-1. AI 검색엔진 타겟

| 검색엔진 | 크롤러 이름 | 주요 지역 |
|----------|-------------|-----------|
| Google AI Overviews | Googlebot | 전 세계 |
| Perplexity AI | PerplexityBot | 영어권 |
| ChatGPT Search | GPTBot / OAI-SearchBot | 영어권 |
| Claude (Anthropic) | ClaudeBot | 영어권 |
| Naver AI | Yeti | 한국 |
| Bing AI (Copilot) | Bingbot | 영어·유럽 |

### 10-2. 핵심 기술 구현

#### SSR / SSG — 공개 페이지 전용 (크롤링 필수)

```
문제: React SPA는 JS 실행 전에 빈 HTML → AI 크롤러가 내용 못 읽음
해결: 공개 페이지(커뮤니티·기종DB·FAQ·지원게시판)만 SSR 적용

방법 A (권장): 공개 페이지를 Next.js App Router로 분리
  next.js (공개 페이지: SSR/SSG)
  ├─ /models/**         → SSG (기종DB, 빌드 시 정적 생성)
  ├─ /community/**      → ISR (1분 캐시 후 재생성)
  ├─ /support/faq       → SSG
  └─ /                  → SSG (랜딩)

  React + Vite (앱 내부: /app/**)
  └─ CSR 유지 (인증 후 사용, 크롤러 진입 불필요)

방법 B: Vite SSR (vite-plugin-ssr)
  → 하나의 코드베이스 유지, 설정 복잡도 증가
```

#### llms.txt — AI 크롤러 전용 안내 파일

```
# /public/llms.txt
# Bitnal — 에어컨·가전 유지보수 전문 플랫폼

## 서비스 소개
에어컨 세척·가전 유지보수 업체를 위한 고객관리 PWA.
무료(로컬 저장)와 유료(클라우드 동기화) 플랜 제공.

## 주요 콘텐츠
- 기종별 유지보수 가이드: /models
- 에어컨 오류코드 DB: /models?type=aircon
- 업계 커뮤니티 (팁·도급·구인·판매): /community
- 사용법·FAQ: /support/faq

## AI 크롤러 허용
GPTBot, PerplexityBot, ClaudeBot, Googlebot 모두 허용
```

#### robots.txt — AI 크롤러 명시 허용

```
User-agent: *
Allow: /
Allow: /models/
Allow: /community/
Allow: /support/faq
Disallow: /app/          # 인증 필요 영역
Disallow: /admin/

User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

Sitemap: https://도메인/sitemap.xml
```

#### JSON-LD 구조화 데이터 — 페이지별 Schema.org

```typescript
// 기종 상세 페이지 (/models/:id)
{
  "@type": "Product",
  "name": "삼성 에어컨 AR09BXFANWK",
  "brand": "Samsung",
  "description": "벽걸이형 에어컨, 세척 주기 6개월 권장",
  "maintenanceSchedule": "6개월마다 필터 청소, 1년마다 전문 세척"
}

// FAQ 페이지 (/support/faq)
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "에어컨 세척은 얼마나 자주 해야 하나요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "일반 가정용은 6개월~1년에 1회, 업소용은 3개월에 1회 권장합니다."
      }
    }
  ]
}

// 유지보수 가이드 (/models/:id/guide)
{
  "@type": "HowTo",
  "name": "에어컨 필터 청소 방법",
  "step": [
    { "@type": "HowToStep", "text": "전원을 끕니다" },
    { "@type": "HowToStep", "text": "전면 패널을 열고 필터를 꺼냅니다" }
  ]
}

// 서비스 앱
{
  "@type": "SoftwareApplication",
  "name": "Bitnal",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS, Android (PWA)",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "무료 플랜 영구 제공"
  }
}
```

#### 동적 OG·메타태그 — 페이지별 자동 생성

```typescript
// 기종 페이지 예시
<title>삼성 AR09BXFANWK 에어컨 세척 주기·오류코드 완전정리 | Bitnal</title>
<meta name="description"
  content="삼성 AR09BXFANWK 권장 세척 주기 6개월, E1·E2·E3 오류코드 원인과 해결법 정리.
           에어컨 전문가 커뮤니티 Bitnal에서 확인하세요." />
<meta property="og:title" content="..." />
<link rel="canonical" href="https://도메인/models/samsung-ar09bxfanwk" />
<link rel="alternate" hreflang="en" href="https://도메인/en/models/..." />
<link rel="alternate" hreflang="ja" href="https://도메인/ja/models/..." />
```

#### 자동 Sitemap 생성 (Supabase Edge Function)

```
매일 자정 실행:
  1. appliance_models 전체 조회 → /models/:slug URL 생성
  2. 커뮤니티 인기 게시글 (view_count > 100) → /community/post/:id
  3. support FAQ 게시글 전체 → /support/faq/:id
  4. /sitemap.xml 파일 자동 갱신 (Vercel Blob 저장)
  5. Google Search Console API로 인덱싱 요청 자동 발송
```

### 10-3. 콘텐츠 SEO 전략 (AI가 인용하게 만드는 글쓰기)

#### AI가 선호하는 콘텐츠 구조

```
1. 질문-답변 형식 (FAQPage Schema)
   "에어컨 세척 주기는?" → 명확한 한 줄 답변 먼저, 상세 설명 후

2. 숫자·데이터 포함
   "6개월마다", "효율 30% 향상", "2024년 기준"

3. 전문가 신호 (E-E-A-T)
   - 작성자 프로필 (경력·자격증)
   - 최종 업데이트 날짜 표시
   - 출처·근거 링크

4. 기종 고유명사 정확 표기
   "삼성 AR09BXFANWK" (모델번호 포함) → 롱테일 검색 독점
```

#### 자동 콘텐츠 생성 (AI 활용)

```
기종 등록 시 AI가 자동 생성:
  - SEO 최적화 제목 (모델명 + 핵심 키워드)
  - 메타 디스크립션 (160자 이내)
  - 기본 유지보수 가이드 초안
  - FAQ 3~5개 초안

관리자 검토 후 승인 → 자동 인덱싱 요청
```

#### 다국어 콘텐츠 SEO

```
hreflang 자동 생성:
  ko: /models/samsung-ar09
  en: /en/models/samsung-ar09
  ja: /ja/models/samsung-ar09
  zh: /zh/models/samsung-ar09
  ...

각 언어별 메타태그·JSON-LD 별도 생성
→ 해당 국가 AI 검색에서 각 언어로 노출
```

### 10-4. 기술 성능 최적화 (Google Core Web Vitals)

| 지표 | 목표 | 방법 |
|------|------|------|
| LCP (최대 콘텐츠 렌더링) | < 2.5초 | 이미지 WebP 변환, CDN 캐싱 |
| CLS (누적 레이아웃 이동) | < 0.1 | 이미지 크기 명시, 폰트 preload |
| INP (상호작용 응답) | < 200ms | React 코드 스플리팅, 지연 로딩 |
| TTFB (첫 바이트 시간) | < 800ms | Vercel Edge Network, SSR 캐싱 |

### 10-5. 검색 노출 모니터링

| 도구 | 목적 |
|------|------|
| Google Search Console | 검색 노출수·클릭수·순위 추적 |
| Naver Search Advisor | 네이버 검색 최적화 |
| Bing Webmaster Tools | ChatGPT Search 연동 인덱싱 |
| Ahrefs / Semrush (선택) | 키워드 순위·경쟁사 분석 |

---

## 11. 초기 홍보 & 사용자 모집 전략

### 11-1. 출시 전 (베타 단계)

```
1. 씨앗 커뮤니티 직접 공략
   - 네이버 카페: "에어컨 청소 사업자", "가전수리 창업" 관련 카페
   - 카카오 오픈채팅: 에어컨 기사 모임방
   - 유튜브 에어컨 세척 채널 댓글 (협업 제안)
   - 해외: Facebook Groups "AC technician", "Appliance repair business"

2. 커뮤니티 초기 콘텐츠 시딩 (Cold Start 해결)
   - 출시 전 관리자가 기종별 유지보수팁 50개 이상 직접 등록
   - 인기 에어컨 모델 오류코드 DB 100개 이상 선 구축
   - 업계 전문가 1~3명을 베타 파트너로 영입 → 콘텐츠 기여
   → 첫 방문자가 "유용한 정보가 있다" 느끼게 해야 가입으로 이어짐

3. 베타 인센티브
   - 첫 100명: PRO 3개월 무료
   - 기종DB 기여자: PRO 1개월 추가 제공
   - 후기 작성자: 다음 달 요금 50% 할인
```

### 11-2. 출시 직후 (초기 성장)

```
1. 검색 SEO 빠른 진입
   - "삼성 에어컨 오류코드", "LG 세탁기 E6 오류" 등 롱테일 키워드
   - 블로그 형식 유지보수 가이드 → Google 검색 상단 목표
   - AI 검색 (Perplexity, ChatGPT) 인용 유도 (10-2 섹션 참고)

2. 바이럴 루프 설계
   - 게시글 SNS 공유 → 비회원 랜딩 → 가입 → 고객 알림 발송
   - 업주가 고객에게 보낸 알림 메시지 하단에 "Bitnal로 발송됨" 서명
     → 고객도 서비스 인지 (무료 홍보)

3. 업계 유튜버·인플루언서 협업
   - 에어컨 세척 유튜버에게 협업 제안 (PRO 제공 + 수익 쉐어)
   - "에어컨 기사 필수 앱" 리뷰 콘텐츠

4. Product Hunt 출시 (영어권)
   - 글로벌 SaaS 커뮤니티 노출
   - 첫날 투표 상위 = 수천 명 트래픽
```

### 11-3. 성장 지속 전략

```
1. 레퍼럴 프로그램
   - 추천인 코드로 가입 시: 추천인 1개월 무료, 신규 가입자 30일 무료 체험
   - 추천인 5명 달성 시: 1년 무료

2. 파트너십
   - 에어컨 부품 도매업체 → 판매게시판 연동 + 광고
   - 냉매 공급업체 광고 유치
   - 가전 수리 교육 업체 협업

3. 지역별 단계적 확장
   - 1단계: 한국 (에어컨 시장 성숙, 기사 수 많음)
   - 2단계: 일본 (DIY 문화 + 에어컨 보급률 높음)
   - 3단계: 동남아 (에어컨 급성장 시장: 베트남·태국·인도네시아)
   - 4단계: 중동·인도 (더운 기후, 에어컨 의존도 높음)
```

---

## 12. 서비스 신뢰 & 데이터 보호 정책

### 12-1. 데이터 분실 방지 (FREE 사용자 공략 포인트)

```
FREE 사용자의 최대 불안: "폰 바꾸면 데이터 날아간다"
→ 이를 적극 고지하고 PRO 업그레이드로 유도

화면 내 상시 표시:
  ⚠️ "현재 데이터는 이 기기에만 저장됩니다.
      기기 분실·교체 시 복구 불가합니다.
      PRO로 안전하게 백업하세요 →"

CSV 내보내기 1클릭 제공 (FREE도 가능):
  → 최소한의 안전망 제공 → 신뢰 확보
  → "내 데이터는 내 것" 인식 강화
```

### 12-2. 서비스 지속성 약속

```
공개 정책 페이지에 명시:
  - 서비스 종료 시 최소 6개월 전 공지
  - 종료 전 전체 데이터 CSV/JSON 내보내기 무료 제공
  - 오픈소스 코어 공개 검토 (최후 수단)
  → "이 서비스가 없어져도 내 데이터는 지킬 수 있다"는 신뢰
```

### 12-3. 법적 준수 문서 (출시 필수)

| 문서 | 내용 |
|------|------|
| 이용약관 | 서비스 이용 조건, 금지 행위, 분쟁 해결 |
| 개인정보처리방침 | 수집 항목, 보유 기간, 제3자 제공 (한국어·영어 필수) |
| 쿠키 정책 | GDPR 쿠키 동의 배너 (EU 사용자 접속 시 자동 표시) |
| 환불 정책 | 14일 이내 100% 환불, 이후 비례 환불 |
| 계정 삭제 정책 | 설정 화면에서 삭제 신청 → 30일 유예 → 전체 데이터 삭제 (GDPR Article 17 대응) |

### 12-4. 보안 신뢰 표시 (랜딩 페이지)

```
✅ SSL/TLS 암호화 (HTTPS 필수)
✅ Supabase SOC 2 Type II 인증 인프라
✅ 데이터 한국/일본 리전 선택 저장
✅ 결제 정보는 Paddle/토스가 관리 (당사 미보관)
✅ 언제든 데이터 내보내기·삭제 가능
```

---

## 13. 비기능 요구사항

| 항목 | 목표 |
|------|------|
| PWA 성능 | Lighthouse PWA/Performance 90점 이상 |
| 오프라인 | 핵심 기능(고객 조회/작업 등록) 오프라인 완전 작동 |
| 보안 | Supabase RLS(Row Level Security) 전 테이블 적용 |
| SEO / GEO | 공개 페이지 SSR/SSG, JSON-LD 구조화 데이터, llms.txt, AI 크롤러 허용 |
| API 응답 | < 200ms (Supabase 리전 최적화) |
| GDPR | EU 사용자 개인정보 처리방침 + 삭제 요청 대응 |

---

## 14. 보안 체크리스트

- [ ] Supabase RLS: 사용자는 본인 데이터만 CRUD
- [ ] 커뮤니티: 작성자만 수정/삭제 (관리자 예외)
- [ ] 광고: advertiser_id 본인 캠페인만 조회
- [ ] Admin 권한: 서버 측 Edge Function에서 role 검증
- [ ] 입력 검증: Zod 스키마로 모든 폼 검증
- [ ] XSS 방지: 마크다운 렌더링 시 DOMPurify 적용
- [ ] 이미지: 업로드 전 타입/크기 검증
- [ ] Rate Limiting: Edge Function에서 IP 기반 제한
- [ ] Gemini API 키: 클라이언트 노출 금지 → Supabase Edge Function 프록시 경유
- [ ] 계정 삭제: 요청 시 30일 유예 후 전체 데이터 삭제 (GDPR Article 17)
- [ ] GDPR 쿠키 동의 배너: EU 사용자 접속 감지 시 자동 표시
- [ ] 추천인 코드: 중복 사용 및 자기 추천 차단 (referrals.UNIQUE 제약으로 DB 레벨 보장)

---

## 15. 폴더 구조 (예상)

> §10에서 공개 페이지는 Next.js App Router, 앱 내부는 Vite+React로 분리하므로
> **모노레포(monorepo)** 구조로 두 프로젝트를 함께 관리한다.

```
bitnal/                        ← 모노레포 루트
├── apps/
│   ├── web/                   ← Next.js (공개 페이지 — SSR/SSG)
│   │   ├── app/
│   │   │   ├── (landing)/     # 랜딩 페이지 SSG
│   │   │   ├── models/        # 기종DB SSG
│   │   │   ├── community/     # 커뮤니티 ISR
│   │   │   └── support/faq    # FAQ SSG
│   │   ├── public/
│   │   │   ├── robots.txt
│   │   │   ├── llms.txt
│   │   │   └── sitemap.xml    # Edge Function 자동 갱신
│   │   └── next.config.ts
│   │
│   └── app/                   ← Vite + React (인증 필요 앱 — CSR)
│       └── src/
│           ├── app/           # /app/** 라우트 (CRM)
│           │   ├── customers/
│           │   ├── appointments/
│           │   ├── revenue/
│           │   ├── notify/
│           │   └── settings/
│           ├── advertise/     # 광고주 섹션
│           ├── admin/         # 관리자 패널
│           ├── components/    # 공통 UI 컴포넌트
│           ├── db/            # Dexie 스키마 + 훅
│           ├── lib/
│           │   ├── supabase.ts
│           │   ├── sync.ts    # 동기화 엔진
│           │   ├── paddle.ts
│           │   └── toss.ts
│           ├── hooks/         # 커스텀 훅
│           ├── store/         # Zustand 스토어
│           ├── i18n/          # 번역 파일 (ko, en, ...)
│           └── types/         # TypeScript 타입
│
├── packages/
│   └── shared/                ← 공통 타입·유틸 (두 앱이 공유)
│
└── supabase/
    ├── migrations/            # DB 마이그레이션
    └── functions/             # Edge Functions
        ├── gemini-proxy/      # Gemini API 키 보호 프록시
        ├── sitemap-gen/       # Sitemap 자동 생성
        ├── bulk-send/         # 일괄 발송 큐
        └── monthly-rewards/   # 월간 포상 cron
```

---

## 16. 즉시 시작할 작업

1. `npm create vite@latest` — React + TypeScript 프로젝트 생성
2. Tailwind CSS + shadcn/ui 설치
3. vite-plugin-pwa 설정 (manifest + Service Worker)
4. Dexie 스키마 첫 버전 작성
5. 고객 CRUD 화면 구현 (Phase 1 첫 기능)

---

*최종 업데이트: 2026-05-21 (pre-dev 전체 리뷰 반영)*
