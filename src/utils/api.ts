import { CultureEvent } from '@/types';
import convert from 'xml-js';

const { xml2js } = convert;

// Development uses Next.js Middleware rewrite (API key injected server-side)
// Production (static) uses PHP proxy (API key stored server-side in proxy.php)
const IS_DEV  = process.env.NODE_ENV === 'development';
const PROXY_URL = '/artfinder/proxy.php';

// ─── XML 파싱 타입 ────────────────────────────────────────────
interface XmlTextNode { _text?: string }
interface XmlCdataNode { _cdata?: string }
type XmlScalar = XmlTextNode | XmlCdataNode | string | number | null | undefined;

interface XmlItem {
  seq?:       XmlScalar;
  title?:     XmlScalar;
  startDate?: XmlScalar;
  endDate?:   XmlScalar;
  place?:     XmlScalar;
  realmName?: XmlScalar;
  area?:      XmlScalar;
  sigungu?:   XmlScalar;
  thumbnail?: XmlScalar;
  gpsX?:      XmlScalar;
  gpsY?:      XmlScalar;
  url?:       XmlScalar;
  [key: string]: XmlScalar | Record<string, XmlScalar> | undefined;
}

interface XmlBody {
  items?:      { item?: XmlItem | XmlItem[] };
  perforInfo?: XmlItem | XmlItem[];
  totalCount?: XmlTextNode | number;
  [key: string]: unknown;
}

interface XmlResponse {
  response?: {
    header?:  { resultCode?: XmlTextNode; resultMsg?: XmlTextNode };
    body?:    XmlBody;
    msgBody?: XmlBody;
  };
}

// ─── 공통 헬퍼 ───────────────────────────────────────────────
function getText(val: XmlScalar): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    if ('_text'  in val && val._text  !== undefined) return String(val._text);
    if ('_cdata' in val && val._cdata !== undefined) return String(val._cdata);
  }
  return '';
}

function getDetailText(obj: XmlItem, key: string): string {
  const val = obj[key];
  if (val === null || val === undefined) return '';
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'object' && !Array.isArray(val)) {
    if ('_text'  in val) return String((val as XmlTextNode)._text  ?? '');
    if ('_cdata' in val) return String((val as XmlCdataNode)._cdata ?? '');
    if (Object.keys(val).length === 0) return '';
  }
  return '';
}

function toDate(date: Date): string {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
}

// ─── 이벤트 목록 파라미터 ─────────────────────────────────────
export interface FetchEventsParams {
  pageNo?:    string;
  numOfRows?: string;
  keyword?:   string;
  serviceTp?: string;
  sido?:      string; // 지역 필터 (예: '서울', '경기')
  from?:      string; // YYYYMMDD
  to?:        string; // YYYYMMDD
}

export interface FetchEventsResult {
  events:     CultureEvent[];
  totalCount: number;
}

/**
 * 문화 행사 목록 조회
 * - DEV:  Next.js Middleware가 서버사이드에서 API 키를 주입
 * - PROD: proxy.php가 서버사이드에서 API 키를 주입 (클라이언트에 키 불노출)
 */
export async function fetchCultureEvents(
  params: FetchEventsParams,
  signal?: AbortSignal,
): Promise<FetchEventsResult> {
  try {
    const today    = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);

    const queryParams = new URLSearchParams({
      PageNo:     params.pageNo    ?? '1',
      numOfrows:  params.numOfRows ?? '20',
      from:       params.from      ?? toDate(today),
      to:         params.to        ?? toDate(nextYear),
    });
    if (params.keyword)   queryParams.set('keyword',   params.keyword);
    if (params.serviceTp) queryParams.set('serviceTp', params.serviceTp);
    if (params.sido)      queryParams.set('sido',      params.sido);

    const url = IS_DEV
      ? `/artfinder/api/culture/?${queryParams}`
      : `${PROXY_URL}?path=/period2&${queryParams}`;

    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`API ${response.status}: ${response.statusText}`);

    const json       = xml2js(await response.text(), { compact: true }) as XmlResponse;
    const body       = json.response?.body ?? json.response?.msgBody;
    if (!body) return { events: [], totalCount: 0 };

    const totalRaw   = body.totalCount;
    const totalCount = Number(
      typeof totalRaw === 'object' && totalRaw !== null && '_text' in totalRaw
        ? totalRaw._text
        : totalRaw ?? 0,
    );

    const rawItems = body.items?.item ?? body.perforInfo;
    if (!rawItems) return { events: [], totalCount };

    const list: XmlItem[] = Array.isArray(rawItems) ? rawItems : [rawItems];
    const events: CultureEvent[] = list.map(item => ({
      seq:       getText(item.seq),
      title:     getText(item.title),
      startDate: getText(item.startDate),
      endDate:   getText(item.endDate),
      place:     getText(item.place),
      realmName: getText(item.realmName),
      area:      getText(item.area),
      sigungu:   getText(item.sigungu),
      thumbnail: getText(item.thumbnail),
      gpsX:      getText(item.gpsX),
      gpsY:      getText(item.gpsY),
      url:       getText(item.url),
    }));

    return { events, totalCount };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    console.error('[fetchCultureEvents]', error);
    return { events: [], totalCount: 0 };
  }
}

/**
 * 문화 행사 상세 조회
 * 반환 타입은 API 응답 필드가 가변적이므로 Record 사용
 */
export async function fetchCultureEventDetail(
  id: string,
): Promise<Record<string, string> | null> {
  try {
    const url = IS_DEV
      ? `/artfinder/api/culture/${encodeURIComponent(id)}/`
      : `${PROXY_URL}?path=/detail2&seq=${encodeURIComponent(id)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`API ${response.status}: ${response.statusText}`);

    const json = xml2js(await response.text(), { compact: true }) as XmlResponse;
    const body = json.response?.msgBody?.perforInfo ?? json.response?.body?.items?.item;
    if (!body || Array.isArray(body)) return null;

    const flat: Record<string, string> = {};
    for (const key of Object.keys(body)) {
      flat[key] = getDetailText(body as XmlItem, key);
    }
    return flat;
  } catch (error) {
    console.error('[fetchCultureEventDetail]', error);
    return null;
  }
}
