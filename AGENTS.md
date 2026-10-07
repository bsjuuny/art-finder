# Art Finder

한국 전시회/축제/공연 정보를 애플 스타일 UI로 보여주는 문화 생활 서비스.

## Tech Stack
- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- Framer Motion, date-fns (종료된 전시 필터링), react-intersection-observer (스크롤 페이드인), xml2js/xml-js (공공데이터 XML 파싱)
- 데이터: 공공데이터포털 문화정보 API (`CULTURE_API_KEY`, `CULTURE_API_BASE_URL`), Naver 검색 API (`NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`)

## Commands
- `npm run dev`
- `npm run build` — `NODE_ENV=production`일 때만 정적 export (`next.config.ts`의 `output: IS_PROD ? 'export' : undefined`)
- `npm run build:push` — build 후 git add/commit/push
- `npm run lint`, `npm start`

## Key Files
- `src/middleware.ts` — `/api/culture*`, `/naver-api` 요청을 프록시
- `src/hooks/useCultureEvents.ts`, `useDebounce.ts`, `useFavorites.ts`, `useTheme.ts`
- `src/components/ArtCard.tsx` 등 카드/모달 컴포넌트
- `src/lib/utils.ts`

## Gotchas
- **`src/middleware.ts`의 프록시는 `NODE_ENV === 'development'`일 때만 동작함.** 프로덕션(Cafe24 정적 호스팅, `output: 'export'`)에서는 이 미들웨어가 빌드에 포함되지 않으므로, `CULTURE_API_KEY`/Naver 키를 쓰는 실제 API 호출은 Cafe24에 올라간 PHP 프록시(`public/proxy.php`, `public/naver_proxy.php` — 빌드 때 `out/`에 복사돼 함께 배포)가 처리함. 즉 middleware.ts를 고쳐도 배포본 동작은 바뀌지 않음.
- 키는 `.env`가 원본(`CULTURE_API_KEY`는 공공데이터포털 Decoding 형태, `NAVER_CLIENT_*`). `npm run build`의 prebuild(`scripts/write-proxy-config.mjs`)가 `.env`에서 `public/culture_proxy_config.php`·`public/naver_proxy_config.php`(git 제외)를 만들고, `proxy.php`·`naver_proxy.php`가 그 파일을 읽는다. PHP만 따로 올리면 설정 파일이 없어 500 — 짝으로 함께 올릴 것. PHP 파일에 키를 직접 쓰지 말 것(공개 저장소).
- `src/lib/api.ts`, `public/data/`는 현재 존재하지 않음(과거 CLAUDE.md에 언급되었으나 삭제됨). 데이터는 미들웨어/훅을 통해 그때그때 fetch하며, 사전 가공된 JSON을 두지 않음.
- 루트에 있던 수동 디버그용 `test-api-*.js`·`test-pagination*.js` 8개는 공공데이터 키가 박혀 있어 2026-10-07 삭제했다. 임시 테스트 스크립트에도 키를 직접 쓰지 말고 `.env`에서 읽을 것(전역 git hook이 루트의 `test-*` 커밋을 막는다).
- `next.config.ts`: `basePath: '/artfinder'`.
