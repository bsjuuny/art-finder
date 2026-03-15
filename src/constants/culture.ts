import { Palette, Music, Theater, Camera, type LucideIcon } from 'lucide-react';

// ─── 카테고리 ────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
}

export const CATEGORIES: readonly Category[] = [
  { id: '',  name: '전체',    icon: Palette, color: 'from-slate-500 to-slate-600' },
  { id: 'A', name: '공연/전시', icon: Theater,  color: 'from-indigo-600 to-blue-600' },
  { id: 'B', name: '행사/축제', icon: Music,    color: 'from-pink-600 to-rose-600' },
  { id: 'C', name: '교육/체험', icon: Camera,   color: 'from-emerald-600 to-teal-600' },
] as const;

export const CATEGORY_STYLES: Record<string, { border: string; text: string }> = {
  '공연/전시': { border: 'border-indigo-500/20', text: 'text-indigo-400' },
  '행사/축제': { border: 'border-pink-500/20',   text: 'text-pink-400' },
  '교육/체험': { border: 'border-emerald-500/20', text: 'text-emerald-400' },
};

export const DEFAULT_CATEGORY_STYLE = { border: 'border-white/5', text: 'text-slate-400' };

// ─── 추천 검색어 ─────────────────────────────────────────────
export const RECOMMENDATIONS = [
  '국립중앙박물관',
  '예술의전당',
  '세종문화회관',
  '서울시립미술관',
] as const;

// ─── 지역 ────────────────────────────────────────────────────
export interface Region {
  id: string;   // API sido 파라미터 값 (빈 문자열 = 전국)
  name: string;
}

export const REGIONS: readonly Region[] = [
  { id: '',   name: '전국' },
  { id: '서울', name: '서울' },
  { id: '경기', name: '경기' },
  { id: '인천', name: '인천' },
  { id: '강원', name: '강원' },
  { id: '충북', name: '충북' },
  { id: '충남', name: '충남' },
  { id: '대전', name: '대전' },
  { id: '세종', name: '세종' },
  { id: '전북', name: '전북' },
  { id: '전남', name: '전남' },
  { id: '광주', name: '광주' },
  { id: '경북', name: '경북' },
  { id: '경남', name: '경남' },
  { id: '대구', name: '대구' },
  { id: '부산', name: '부산' },
  { id: '울산', name: '울산' },
  { id: '제주', name: '제주' },
] as const;

// ─── 페이지네이션 ─────────────────────────────────────────────
export const PAGE_SIZE = 40;

// ─── API 경로 ─────────────────────────────────────────────────
export const API_PATHS = {
  LIST:   '/period2',
  DETAIL: '/detail2',
} as const;
