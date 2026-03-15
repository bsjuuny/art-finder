'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowLeft, Trash2, MapPin, Calendar, Sparkles } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { getSummary } from '@/utils/recommendations';
import ArtCard from '@/components/ArtCard';

export default function FavoritesPage() {
    const { favorites, toggleFavorite } = useFavorites();

    const summary = useMemo(() => getSummary(favorites), [favorites]);

    const formatDate = (dateStr: string) => {
        if (!dateStr || dateStr.length !== 8) return '';
        return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`;
    };

    return (
        <main className="min-h-screen pb-20 selection:bg-indigo-500/30" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            <div className="animated-bg" />

            {/* Header */}
            <div className="sticky top-0 z-40 border-b backdrop-blur-xl" style={{ background: 'var(--surface-toggle)', borderColor: 'var(--border-color)' }}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 font-bold text-sm transition-colors hover:text-indigo-400" style={{ color: 'var(--text-secondary)' }}>
                        <ArrowLeft size={18} aria-hidden="true" />
                        <span className="hidden sm:inline">메인으로</span>
                    </Link>
                    <div className="flex items-center gap-2 flex-1">
                        <Heart size={20} className="text-rose-500 fill-rose-500" aria-hidden="true" />
                        <h1 className="text-xl font-black tracking-tight">내 찜 목록</h1>
                    </div>
                    <span className="text-sm font-bold px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {favorites.length}개
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-10">

                {/* 선호 패턴 요약 카드 — 찜 3개 이상일 때 */}
                <AnimatePresence>
                    {favorites.length >= 3 && (
                        <motion.div
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            className="mb-10 p-6 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center gap-4"
                            style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border-color)' }}
                        >
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                                <Sparkles size={22} className="text-indigo-400" aria-hidden="true" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>내 취향 분석</p>
                                <div className="flex flex-wrap gap-3">
                                    {summary.topCategory && (
                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                                            선호 장르: {summary.topCategory}
                                        </span>
                                    )}
                                    {summary.topRegion && (
                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-sky-500/15 text-sky-400 border border-sky-500/20">
                                            <MapPin size={12} aria-hidden="true" /> 선호 지역: {summary.topRegion}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                메인 화면에서 맞춤 추천을 확인하세요
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 빈 상태 */}
                {favorites.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-40 gap-6 text-center"
                    >
                        <div className="w-24 h-24 rounded-full flex items-center justify-center border-2 border-dashed" style={{ borderColor: 'var(--border-color)' }}>
                            <Heart size={36} className="opacity-20" aria-hidden="true" />
                        </div>
                        <div>
                            <p className="text-xl font-black mb-2">아직 찜한 공연이 없어요</p>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                공연 카드의 하트 버튼을 눌러 찜해보세요
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm hover:opacity-90 transition-opacity"
                        >
                            공연 둘러보기
                        </Link>
                    </motion.div>
                )}

                {/* 찜 목록 그리드 */}
                {favorites.length > 0 && (
                    <>
                        <p className="text-sm font-bold mb-6" style={{ color: 'var(--text-muted)' }}>
                            저장된 순서대로 표시됩니다
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            <AnimatePresence>
                                {favorites.map((fav, idx) => (
                                    <motion.div
                                        key={fav.seq}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                                        className="relative"
                                    >
                                        <ArtCard event={fav} />
                                        {/* 찜 해제 오버레이 버튼 */}
                                        <button
                                            onClick={() => toggleFavorite(fav)}
                                            aria-label={`${fav.title} 찜 해제`}
                                            className="absolute bottom-[4.5rem] right-7 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-400"
                                            style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
                                        >
                                            <Trash2 size={12} aria-hidden="true" />
                                            찜 해제
                                        </button>
                                        {/* 저장 날짜 */}
                                        <div className="absolute top-[calc(75%+1rem)] left-7 flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                            <Calendar size={10} aria-hidden="true" />
                                            {formatDate(fav.savedAt.slice(0, 10).replace(/-/g, ''))} 저장
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
