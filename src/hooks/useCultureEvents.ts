'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CultureEvent } from '@/types';
import { fetchCultureEvents } from '@/utils/api';
import { PAGE_SIZE } from '@/constants/culture';

interface Options {
  keyword:   string;
  serviceTp: string;
  sido?:     string;
}

interface Result {
  events: CultureEvent[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
}

export function useCultureEvents({ keyword, serviceTp, sido }: Options): Result {
  const [events, setEvents]   = useState<CultureEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const pageRef              = useRef(1);
  const loadingRef           = useRef(false);
  const abortControllerRef   = useRef<AbortController | null>(null);

  const load = useCallback(async (reset: boolean) => {
    if (loadingRef.current && !reset) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    loadingRef.current = true;
    setLoading(true);
    if (reset) setError(null);

    const page = reset ? 1 : pageRef.current;

    try {
      const { events: incoming, totalCount } = await fetchCultureEvents(
        { numOfRows: String(PAGE_SIZE), pageNo: String(page), keyword, serviceTp, sido },
        controller.signal,
      );

      // API가 sido 파라미터를 지원하지 않을 경우 클라이언트 사이드로 보정
      const filtered = sido
        ? incoming.filter(e => e.area && e.area.includes(sido))
        : incoming;

      // 지역 필터 활성 시 hasMore는 API 페이지가 가득 찼는지로 판단
      const computeHasMore = (added: CultureEvent[], total: number) =>
        sido ? incoming.length === PAGE_SIZE : added.length < total;

      if (reset) {
        setEvents(filtered);
        setHasMore(computeHasMore(filtered, totalCount));
        pageRef.current = 2;
      } else {
        pageRef.current = page + 1;
        setEvents(prev => {
          const seen   = new Set(prev.map(e => e.seq));
          const unique = filtered.filter(e => !seen.has(e.seq));
          const next   = [...prev, ...unique];
          setHasMore(computeHasMore(next, totalCount) && incoming.length > 0);
          return next;
        });
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      console.error('[useCultureEvents]', err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, [keyword, serviceTp, sido]);

  // 키워드·카테고리 변경 시 초기화
  useEffect(() => {
    setHasMore(true);
    pageRef.current = 1;
    load(true);
  }, [load]);

  const loadMore = useCallback(() => load(false), [load]);

  return { events, loading, error, hasMore, loadMore };
}
