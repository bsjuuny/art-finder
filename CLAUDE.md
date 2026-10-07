# 🎨 Art Finder (문화 예술 찾기) 개발자 가이드

안녕하세요! 이 프로젝트는 우리나라의 전시회, 축제, 미술 공연 정보를 한곳에 모아 **애플(Apple) 감성**의 깔끔한 디자인으로 보여주는 문화 생활 도우미 서비스입니다.

---

## 🏗 시스템 작동 방식

1.  **데이터 소스**: 공공데이터포털의 문화 정보 API를 사용합니다.
2.  **데이터 파싱**: API가 주는 '꼬여있는 XML' 데이터를 **xml2js** 라이브러리를 통해 우리가 쓰기 편한 JSON으로 깔끔하게 변환합니다.
3.  **디자인 컨셉**: 애플 앱스토어 느낌의 큼직한 카드와 여백, 그리고 부드러운 페이드인 효과를 최우선으로 고려하여 제작되었습니다.

---

## 🛠 주요 명령어 및 작업 안내

- `npm run dev`: 전시회 카드 레이아웃을 고치거나 검색 필터를 추가할 때 사용하세요.
- `npm run build:push`: 빌드 후 변경사항을 Git에 바로 올려서 배포까지 진행할 때 사용합니다.

---

## 💡 개발자를 위한 팁

### 부드러운 페이드인 효과 (Scroll Animation)
- 사용자가 스크롤을 내릴 때 카드가 스르륵 나타나는 효과는 `Intersection Observer` 기술을 사용했습니다. `src/hooks/` 폴더를 확인해 보세요.

### 날짜 계산 로직
- 이미 끝난 전시는 보여주지 않도록 `date-fns`를 활용해 오늘 날짜와 비교하는 로직이 들어 있습니다.

---

## 🚨 문제 해결 (Troubleshooting)

**Q: 전시회 정보가 아예 안 떠요.**
- A: 공공 API 키가 만료되었거나 서버가 점검 중일 수 있습니다. `src/utils/api.ts`에서 API 호출 결과를 로그로 찍어보세요. (`src/lib/api.ts`는 더 이상 존재하지 않습니다.)
- **로컬 개발**에서는 `src/middleware.ts`가 `NODE_ENV === 'development'`일 때만 `/api/culture*`를 프록시합니다. **프로덕션(Cafe24 정적 export)에서는 이 미들웨어가 빌드에 포함되지 않고**, Cafe24에 올라간 PHP 프록시(`public/proxy.php`, `public/naver_proxy.php` — 빌드 때 `out/`에 복사)가 실제 API 호출을 처리합니다 — `middleware.ts`를 고쳐도 배포본 동작은 바뀌지 않습니다.

**Q: XML 파싱 에러가 나요.**
- A: 공공 데이터의 응답 형식이 가끔 예고 없이 바뀔 때가 있습니다. `xml2js` 설정 옵션을 확인해야 합니다.

---

## 📁 주요 구성 요소
- `src/utils/api.ts`: 문화행사 API 호출 + XML 파싱 (구 `src/lib/api.ts`는 삭제됨).
- `src/middleware.ts`: dev 전용 CORS 프록시 — 프로덕션에서는 동작하지 않음(위 문제 해결 참고).
- `src/hooks/`: `useCultureEvents.ts`, `useDebounce.ts`, `useFavorites.ts`, `useTheme.ts` 등.
- `src/components/`: 카드/모달 등 UI 컴포넌트.
- `public/data/`는 더 이상 존재하지 않음 — 사전 가공 JSON 없이 매번 fetch합니다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
