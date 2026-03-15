# Art Finder — 마스터 프롬프트

## 프로젝트 개요

대한민국 문화예술 행사 탐색 웹앱. 공공데이터포털 문화포털 API에서 공연·전시·행사 데이터를 가져오고, 네이버 블로그 검색으로 리뷰를 제공한다.
Cafe24 호스팅에 정적 파일로 배포 (`/artfinder` 경로), PHP 프록시로 API CORS 우회.

---

## 기술 스택

| 항목 | 사용 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router, 프로덕션 `output: 'export'` 정적 빌드) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v4 + CSS Custom Variables (다크/라이트 테마) |
| 애니메이션 | Framer Motion |
| 아이콘 | Lucide React |
| 날짜 처리 | date-fns (한국어 로케일) |
| XML 파싱 | xml-js (`xml2js` compact mode) |
| 데이터 소스 | 문화포털 문화예술 정보 API (`apis.data.go.kr/B553457/cultureinfo`) |
| 리뷰 소스 | 네이버 블로그·웹 검색 API |
| 배포 | Cafe24 FTP 업로드 (GitHub Actions) |

---

## 디렉토리 구조

```
src/
├── app/
│   ├── page.tsx            # 홈 (검색·카테고리 필터·무한스크롤)
│   ├── layout.tsx
│   ├── globals.css         # CSS 변수 기반 다크/라이트 테마
│   ├── calendar/
│   │   └── page.tsx        # 월별 문화 캘린더
│   └── event/
│       └── page.tsx        # 행사 상세 페이지
├── components/
│   ├── ArtCard.tsx             # 행사 카드 (포스터·날짜·장소·카테고리 배지)
│   ├── EventDetailContent.tsx  # 행사 상세 내용 (모달·페이지 공용)
│   ├── GlobalEventModal.tsx    # searchParams ?eventId= 기반 글로벌 모달
│   ├── Modal.tsx               # 모달 래퍼
│   ├── ReviewSection.tsx       # 네이버 블로그 리뷰 섹션
│   ├── DonationPopup.tsx       # 후원 팝업
│   └── ThemeToggle.tsx         # 다크/라이트 토글
├── hooks/
│   └── useTheme.ts             # 테마 상태 관리
├── middleware.ts               # DEV 전용 API 프록시 (문화포털·네이버)
├── types/
│   └── index.ts               # CultureEvent, ApiResponse 인터페이스
└── utils/
    ├── api.ts                  # 문화포털 API 호출 (XML → JSON 정규화)
    └── reviewApi.ts            # 네이버 블로그/웹 검색 API 호출

public/
├── proxy.php                  # PROD: 문화포털 API PHP 프록시
└── naver_proxy.php            # PROD: 네이버 API PHP 프록시
```

---

## 핵심 데이터 타입

```typescript
interface CultureEvent {
  seq: string;          // 행사 고유 ID
  title: string;
  startDate: string;    // YYYYMMDD
  endDate: string;      // YYYYMMDD
  place: string;        // 공연장/장소명
  realmName: string;    // '공연/전시' | '행사/축제' | '교육/체험'
  area: string;         // 시도
  sigungu?: string;     // 시군구
  thumbnail: string;    // 이미지 URL
  gpsX: string;
  gpsY: string;
  url: string;          // 원문 링크
}
```

---

## API 통신 메커니즘

### 개발 환경 (DEV)
```
클라이언트 → /artfinder/api/culture/ → Next.js Middleware → 문화포털 API
클라이언트 → /artfinder/naver-api   → Next.js Middleware → 네이버 API
```

### 프로덕션 (Cafe24 정적 호스팅)
```
클라이언트 → /artfinder/proxy.php       → 문화포털 API
클라이언트 → /artfinder/naver_proxy.php → 네이버 API
```

### 문화포털 API 엔드포인트

| 용도 | 경로 |
|---|---|
| 목록 조회 | `/period2` |
| 상세 조회 | `/detail2?seq={id}` |

### 주요 파라미터

| 파라미터 | 설명 |
|---|---|
| `PageNo` | 페이지 번호 |
| `numOfrows` | 페이지당 결과 수 |
| `keyword` | 검색어 |
| `serviceTp` | `A`: 공연/전시, `B`: 행사/축제, `C`: 교육/체험 (빈값: 전체) |
| `from` / `to` | 기간 필터 (`YYYYMMDD`, 기본: 오늘 ~ 1년 후) |

### XML 응답 파싱 패턴

```typescript
// xml-js compact mode 사용
const json = xml2js(xmlText, { compact: true });

// getText 헬퍼로 안전하게 값 추출
const getText = (val: any) => {
  if (val?._text) return val._text;
  if (val?._cdata) return val._cdata;
  return String(val ?? '');
};
```

---

## 카테고리 시스템

```typescript
const CATEGORIES = [
  { id: '',  name: '전체',    color: 'from-slate-500 to-slate-600' },
  { id: 'A', name: '공연/전시', color: 'from-indigo-600 to-blue-600' },
  { id: 'B', name: '행사/축제', color: 'from-pink-600 to-rose-600' },
  { id: 'C', name: '교육/체험', color: 'from-emerald-600 to-teal-600' },
];
```

카테고리별 카드 border/badge 색상도 동일 팔레트로 통일.

---

## 홈 페이지 데이터 플로우

```
useEffect (debouncedSearchTerm, selectedCategory 변경 시 reset)
  └── fetchCultureEvents({ pageNo, numOfRows: 20, keyword, serviceTp })
        └── IS_DEV ? /artfinder/api/culture/ : /artfinder/proxy.php
              └── XML 응답 → xml2js → CultureEvent[] 정규화

무한 스크롤: "Discover More Content" 버튼 클릭 → pageRef.current++ → loadMoreEvents()
중복 제거: seq 기반 Set으로 필터링
요청 취소: AbortController (필터/검색 변경 시 이전 요청 abort)
검색 디바운스: 500ms
```

---

## 캘린더 페이지

- `date-fns`로 월 단위 날짜 그리드 생성
- 해당 월 전체 이벤트 100개 로드 (`numOfRows: 100`)
- 날짜별 이벤트 매칭: `startDate <= dayStr && endDate >= dayStr`
- 데스크탑: 날짜 셀에 최대 3개 이벤트 표시 + 더보기
- 모바일: 날짜 셀에 이벤트 개수만 표시
- Google Calendar 추가: `calendar.google.com/calendar/render` URL 생성

---

## 모달 시스템

- `?eventId={seq}` URL searchParam으로 모달 오픈 (scroll={false})
- `GlobalEventModal` → `layout.tsx`에 전역 등록
- `EventDetailContent`는 모달/페이지 양쪽에서 공용으로 사용 (`isModal` prop)

---

## 네이버 리뷰 섹션

```typescript
// blog + webkr 병렬 검색, 최근 1개월 필터
const [blogItems, webItems] = await Promise.all([
  fetchResults('blog'),
  fetchResults('webkr')
]);
// filterTitle로 제목 정규화 포함 여부 검증
```

---

## UI/UX 디자인 원칙

- **Apple Style Glassmorphism**: `backdrop-blur` + `bg-white/10` + `border border-white/10`
- **다크/라이트 테마**: CSS Custom Variables (`--foreground`, `--glass-card-bg`, `--surface-elevated` 등)로 테마 전환
- **CSS 클래스 관례**: `.glass`, `.glass-card`, `.glass-panel`, `.gradient-text`, `.animated-bg`
- **Framer Motion**: 카드 진입 `initial → whileInView`, 스크롤 고정 Navbar `AnimatePresence`
- **카드 이미지**: `<img>` 태그 직접 사용 (Next.js Image 미사용, Cafe24 정적 배포 호환)
- **HTML 엔티티 디코딩**: API 응답의 `&lt;`, `&amp;` 등을 디코딩하는 `decodeHtmlEntities` 헬퍼 필수

---

## 배포 설정

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  reactStrictMode: false,
  basePath: '/artfinder',
  trailingSlash: true,
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  images: { unoptimized: true },
};
```

- `npm run build` → `out/` 디렉토리 생성
- GitHub Actions에서 `out/` + `public/proxy.php` + `public/naver_proxy.php` → Cafe24 FTP 업로드
- 접속 URL: `https://bsjuuny2026.mycafe24.com/artfinder`

---

## 환경 변수

```env
NEXT_PUBLIC_CULTURE_API_KEY=        # 공공데이터포털 API 키 (URL 인코딩 상태)
NEXT_PUBLIC_CULTURE_API_BASE_URL=   # https://apis.data.go.kr/B553457/cultureinfo
NEXT_PUBLIC_NAVER_CLIENT_ID=        # 네이버 개발자센터 Client ID
NEXT_PUBLIC_NAVER_CLIENT_SECRET=    # 네이버 개발자센터 Client Secret
```

> API 키는 URL 인코딩 상태로 저장. PHP 프록시 전달 시 `decodeURIComponent()` 후 재인코딩.

---

## 주요 개발 주의사항

- `output: 'export'` 정적 빌드 → 서버 런타임 API 라우트 사용 불가, PHP 프록시 필수
- `reactStrictMode: false` → useEffect 이중 실행 방지 (API 비용 절감)
- Middleware는 `NODE_ENV === 'development'` 조건부 동작 (프로덕션 빌드 시 무시)
- ArtCard에서 `<img>` 태그 사용 시 `referrerPolicy` 설정 불필요 (문화포털 CDN은 허용)
- 캘린더 날짜 비교는 `YYYYMMDD` 문자열 사전순 비교로 처리 (Date 변환 없이)
