'use client';

import { useEffect, useState } from 'react';

import { Calendar, MapPin, Map, ExternalLink, ArrowLeft, Info, Phone, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';

import { fetchCultureEventDetail } from '@/utils/api';
import ReviewSection from '@/components/ReviewSection';

// ...

export default function EventDetailContent({ id, isModal = false }: { id: string, isModal?: boolean }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const from = searchParams.get('from');

    // Logic for back button
    // If modal, we don't render a specialized back link, but a close button or use router.back()
    // If standalone, we use the `from` parameter or default to home.

    const backLink = from || '/';
    const backText = from === '/calendar' ? '달력으로' : '목록으로';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [event, setEvent] = useState<any>(null); // Using any temporarily as detail structure might differ
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEventDetail = async () => {
            try {
                const detailData = await fetchCultureEventDetail(id);

                if (!detailData) {
                    throw new Error('Event not found');
                }

                setEvent(detailData);
            } catch (err: unknown) {
                console.error(err);
                if (err instanceof Error) {
                    setError(err.message || 'Failed to load event details');
                } else {
                    setError('Failed to load event details');
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchEventDetail();
        }
    }, [id]);

    // Scroll Lock when modal is open
    useEffect(() => {
        if (isModal) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isModal]);

    const formatDate = (dateStr: string) => {
        if (!dateStr || dateStr.length !== 8) return dateStr;
        return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`;
    };

    const decodeHtmlEntities = (str: string) => {
        if (!str) return '';
        return str.replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&');
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="font-bold animate-pulse text-black dark:text-white">상세 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
                <p className="text-lg font-bold" style={{ color: 'var(--accent)' }}>{error || '정보를 찾을 수 없습니다.'}</p>
                {!isModal && (
                    <Link href="/" className="px-6 py-2 bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors">
                        메인으로 돌아가기
                    </Link>
                )}
            </div>
        );
    }

    const containerClass = isModal
        ? "rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl transition-colors duration-300"
        : "min-h-screen pb-20 transition-colors duration-300";

    const containerStyle = {
        background: isModal ? 'var(--surface)' : 'var(--background)',
        color: 'var(--foreground)'
    };

    return (
        <main className={containerClass} style={containerStyle}>
            {/* Header Image Background */}
            <div className={`relative w-full overflow-hidden ${isModal ? 'h-[15vh]' : 'h-[25vh] md:h-[35vh]'}`}>
                <div
                    className="absolute inset-0 z-10"
                    style={{ background: 'linear-gradient(to top, var(--surface) 0%, transparent 100%)' }}
                />
                {event.imgUrl ? (
                    <img
                        src={event.imgUrl}
                        alt={event.title}
                        className="w-full h-full object-cover blur-sm opacity-50 scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-900" />
                )}

                <div className="absolute top-6 left-6 z-20">
                    {isModal ? (
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-4 py-2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full text-white transition-all border border-white/10"
                        >
                            <ArrowLeft size={18} />
                            <span className="text-sm font-medium">뒤로가기</span>
                        </button>
                    ) : (
                        <Link
                            href={backLink}
                            className="flex items-center gap-2 px-4 py-2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full text-white transition-all border border-white/10"
                        >
                            <ArrowLeft size={18} />
                            <span className="text-sm font-medium">{backText}</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Content Container */}
            <div className={`max-w-4xl mx-auto px-6 relative z-20 ${isModal ? '-mt-24' : '-mt-48'}`}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card border rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl mb-10"
                    style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border-color)' }}
                >
                    <div className="flex flex-col md:flex-row">
                        {/* Poster Image */}
                        <div className="md:w-1/3 p-6 md:p-8 flex justify-center md:block bg-black/20">
                            <div className="relative w-48 md:w-full aspect-[3/4] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                                {event.imgUrl ? (
                                    <img
                                        src={event.imgUrl}
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                                        No Image
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="md:w-2/3 p-6 md:p-8 flex flex-col">
                            <div className="mb-2">
                                <span
                                    className="px-3 py-1 text-xs font-bold rounded-full border"
                                    style={{
                                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                                        color: 'var(--accent-primary)',
                                        borderColor: 'rgba(99, 102, 241, 0.3)'
                                    }}
                                >
                                    {event.realmName}
                                </span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-black mb-6 leading-tight" style={{ color: 'var(--foreground)' }}>
                                {decodeHtmlEntities(event.title)}
                            </h1>

                            <div className="space-y-4 mb-8 max-w-lg">
                                <div className="flex items-start gap-4">
                                    <Calendar className="text-indigo-400 shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="font-semibold" style={{ color: 'var(--foreground)' }}>기간</p>
                                        <p style={{ color: 'var(--text-secondary)' }}>{formatDate(event.startDate)} ~ {formatDate(event.endDate)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Map className="text-sky-400 shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="font-semibold" style={{ color: 'var(--foreground)' }}>지역</p>
                                        <p style={{ color: 'var(--text-secondary)' }}>{event.area}{event.sigungu ? ` - ${event.sigungu}` : ''}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <MapPin className="text-pink-400 shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="font-semibold" style={{ color: 'var(--foreground)' }}>장소</p>
                                        <p style={{ color: 'var(--text-secondary)' }}>{event.place}</p>
                                        {event.placeAddr && <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{event.placeAddr}</p>}
                                    </div>
                                </div>
                                {(event.price || event.priceAddr) && (
                                    <div className="flex items-start gap-4">
                                        <CreditCard className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                                        <div>
                                            <p className="font-semibold" style={{ color: 'var(--foreground)' }}>가격</p>
                                            <p style={{ color: 'var(--text-secondary)' }}>{event.price || event.priceAddr}</p>
                                        </div>
                                    </div>
                                )}
                                {(event.phone || event.phoneAddr) && (
                                    <div className="flex items-start gap-4">
                                        <Phone className="text-amber-400 shrink-0 mt-0.5" size={20} />
                                        <div>
                                            <p className="font-semibold" style={{ color: 'var(--foreground)' }}>문의</p>
                                            <p style={{ color: 'var(--text-secondary)' }}>{event.phone || event.phoneAddr}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto pt-6 border-t border-white/5 flex flex-wrap gap-4">
                                {event.url && (
                                    <a
                                        href={event.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 min-w-[140px] py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
                                    >
                                        <ExternalLink size={18} />
                                        공식 홈페이지
                                    </a>
                                )}
                                {event.placeUrl && (
                                    <a
                                        href={event.placeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 min-w-[140px] py-3 rounded-xl glass hover:bg-white/10 font-semibold flex items-center justify-center gap-2 transition-all border"
                                        style={{ background: 'var(--surface)', color: 'var(--foreground)', borderColor: 'var(--border-color)' }}
                                    >
                                        <MapPin size={18} />
                                        공연장 안내
                                    </a>
                                )}
                            </div>
                        </div>
                    </div >

                    {/* Description Section if available */}
                    {
                        typeof event.contents1 === 'string' && event.contents1.trim() && (
                            <div className="p-8 border-t border-white/5 bg-black/10">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Info size={20} className="text-slate-400" />
                                    <span className="font-semibold" style={{ color: 'var(--foreground)' }}>상세 내용</span>
                                </h3>
                                <div className="prose prose-invert prose-slate max-w-none" style={{ color: 'var(--text-secondary)' }}>
                                    {/* Ideally we would render HTML here if it's safe, often it's plain text or basic HTML */}
                                    <div dangerouslySetInnerHTML={{ __html: event.contents1 }} />
                                </div>
                            </div>
                        )
                    }

                    {/* Blog Reviews Section */}
                    <div className="p-8 border-t border-white/5 bg-black/5">
                        <ReviewSection title={event.title} />
                    </div>
                </motion.div >
            </div >
        </main >
    );
}
