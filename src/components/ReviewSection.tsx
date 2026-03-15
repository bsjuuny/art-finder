'use client';

import React, { useState, useEffect, useRef } from 'react';
import { fetchReviews, BlogReview } from '@/utils/reviewApi';
import { MessageSquare, ExternalLink, Calendar, User, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';

interface ReviewSectionProps {
    title: string | null;
}

export default function ReviewSection({ title }: ReviewSectionProps) {
    const [reviews, setReviews] = useState<BlogReview[]>([]);
    const [loading, setLoading] = useState(true);
    const swiperRef = useRef<SwiperType | null>(null);

    useEffect(() => {
        if (!title) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);

        const getReviews = async () => {
            const data = await fetchReviews(title, 10);
            if (!cancelled) {
                setReviews(data);
                setLoading(false);
            }
        };

        getReviews();

        return () => {
            cancelled = true;
        };
    }, [title]);

    if (!title) return null;

    return (
        <section className="border-t border-white/5 pt-10 md:pt-16">
            <div className="flex items-center justify-between mb-6 md:mb-10 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 md:w-12 md:h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                        <MessageSquare size={18} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-lg md:text-3xl font-black tracking-tight uppercase" style={{ color: 'var(--foreground)' }}>
                            Cultural <span className="text-indigo-400">Reviews</span>
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>관람객 블로그 후기</p>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                                <Clock size={9} />
                                최근 3개월
                            </span>
                        </div>
                    </div>
                </div>

                {!loading && reviews.length > 1 && (
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => swiperRef.current?.slidePrev()}
                            className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors hover:bg-indigo-500/20 hover:border-indigo-500/40"
                            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                            aria-label="이전 후기"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => swiperRef.current?.slideNext()}
                            className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors hover:bg-indigo-500/20 hover:border-indigo-500/40"
                            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                            aria-label="다음 후기"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="font-bold tracking-widest text-xs uppercase animate-pulse" style={{ color: 'var(--text-secondary)' }}>Loading Feedback...</p>
                </div>
            ) : reviews.length > 0 ? (
                <div className="overflow-hidden">
                <Swiper
                    modules={[Navigation, Pagination, A11y]}
                    spaceBetween={16}
                    slidesPerView={1}
                    breakpoints={{
                        640: { slidesPerView: 1.2, spaceBetween: 20 },
                        768: { slidesPerView: 2, spaceBetween: 24 },
                    }}
                    pagination={{ clickable: true, dynamicBullets: true }}
                    onSwiper={(swiper) => { swiperRef.current = swiper; }}
                    className="review-swiper !pb-10"
                >
                    {reviews.map((review, index) => (
                        <SwiperSlide key={index} className="!h-auto">
                            <a
                                href={review.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative p-5 md:p-8 rounded-2xl md:rounded-[2rem] glass transition-all shadow-xl border flex flex-col h-full"
                                style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border-color)' }}
                            >
                                <div className="flex justify-between items-center mb-4 gap-2">
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border min-w-0" style={{ background: 'var(--background)', borderColor: 'var(--border-color)' }}>
                                        <User size={11} className="text-indigo-400 shrink-0" />
                                        <span className="text-xs font-bold tracking-tight truncate" style={{ color: 'var(--text-secondary)' }}>
                                            {review.blogger}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0" style={{ color: 'var(--text-muted)' }}>
                                        <Calendar size={11} />
                                        <span className="text-[10px] font-bold">
                                            {review.date}
                                        </span>
                                    </div>
                                </div>
                                <h4
                                    className="text-base md:text-xl font-black mb-3 line-clamp-2 group-hover:text-indigo-400 transition-colors leading-snug"
                                    style={{ color: 'var(--foreground)' }}
                                    dangerouslySetInnerHTML={{ __html: review.title }}
                                />
                                <p
                                    className="text-sm line-clamp-3 leading-relaxed font-medium mb-5 flex-1"
                                    style={{ color: 'var(--text-secondary)' }}
                                    dangerouslySetInnerHTML={{ __html: review.description }}
                                />
                                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
                                    Read Full Review <ExternalLink size={13} />
                                </div>
                            </a>
                        </SwiperSlide>
                    ))}
                </Swiper>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3 py-10 px-6 rounded-2xl border border-dashed" style={{ borderColor: 'var(--border-color)' }}>
                    <MessageSquare size={28} className="opacity-20" style={{ color: 'var(--foreground)' }} />
                    <p className="text-sm font-bold text-center" style={{ color: 'var(--text-secondary)' }}>
                        최근 3개월 이내 블로그 후기가 없습니다
                    </p>
                    <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                        네이버 블로그에서 직접 검색해보세요
                    </p>
                </div>
            )}

            <style>{`
                .review-swiper .swiper-pagination-bullet {
                    background: var(--text-muted);
                    opacity: 0.4;
                }
                .review-swiper .swiper-pagination-bullet-active {
                    background: #818cf8;
                    opacity: 1;
                }
            `}</style>
        </section>
    );
}
