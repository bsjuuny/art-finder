'use client';

import Link from 'next/link';
import { CultureEvent } from '@/types';
import { Calendar, MapPin, Map, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import FavoriteButton from '@/components/FavoriteButton';

interface ArtCardProps {
    event: CultureEvent;
}

export default function ArtCard({ event }: ArtCardProps) {
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

    const getCategoryStyles = (realm: string) => {
        switch (realm) {
            case '공연/전시': return { border: 'border-indigo-500/30', bg: 'from-indigo-600 to-blue-600', text: 'text-indigo-500 dark:text-indigo-400' };
            case '행사/축제': return { border: 'border-pink-500/30', bg: 'from-pink-600 to-rose-600', text: 'text-pink-500 dark:text-pink-400' };
            case '교육/체험': return { border: 'border-emerald-500/30', bg: 'from-emerald-600 to-teal-600', text: 'text-emerald-500 dark:text-emerald-400' };
            default: return { border: 'border-slate-500/20', bg: 'from-slate-600 to-slate-700', text: 'text-slate-500 dark:text-slate-400' };
        }
    };

    const styles = getCategoryStyles(event.realmName);

    return (
        <motion.div
            className={`glass-card rounded-[2rem] overflow-hidden flex flex-col h-full border ${styles.border} group`}
            style={{
                background: 'var(--glass-card-bg)',
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'translate3d(0,0,0)'
            }}
        >
            {/* Image Section */}
            <div className="relative w-full aspect-[1/1.2] overflow-hidden shrink-0">
                {event.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={event.thumbnail}
                        alt={`${event.title} - ${event.realmName} 썸네일`}
                        className="w-full h-full object-cover transition-transform duration-1000 md:group-hover:scale-110"
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-inter-med" style={{ background: 'var(--surface-elevated)', color: 'var(--text-meta, #94a3b8)' }}>
                        COMING SOON
                    </div>
                )}

                {/* 카테고리 배지 */}
                {event.realmName && (
                    <div className="absolute top-4 left-4">
                        <span className="px-4 py-1.5 text-[10px] font-inter-bold rounded-full bg-slate-950/40 backdrop-blur-md text-white border border-white/10 shadow-lg tracking-widest uppercase">
                            {event.realmName}
                        </span>
                    </div>
                )}

                {/* 찜 버튼 */}
                <FavoriteButton
                    event={event}
                    size={18}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 transition-colors"
                />
            </div>

            {/* Content Section */}
            <div className="p-7 flex flex-col flex-grow justify-between">
                <div>
                    <h3 className="text-xl font-inter-bold mb-5 line-clamp-2 leading-[1.3] transition-colors duration-500 group-hover:text-indigo-400" style={{ color: 'var(--foreground)' }}>
                        {decodeHtmlEntities(event.title)}
                    </h3>

                    <div className="space-y-3">
                        {(event.startDate || event.endDate) && (
                            <div className="flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
                                <Calendar size={14} className={styles.text + " shrink-0"} aria-hidden="true" />
                                <span className="font-inter-med text-[0.825rem]">
                                    {event.startDate ? formatDate(event.startDate) : '미정'} — {event.endDate ? formatDate(event.endDate) : '미정'}
                                </span>
                            </div>
                        )}
                        {(event.area || event.sigungu) && (
                            <div className="flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
                                <Map size={14} className="text-slate-500 shrink-0" aria-hidden="true" />
                                <span className="font-inter-med truncate text-[0.825rem]">
                                    {[event.area, event.sigungu].filter(Boolean).join(' ')}
                                </span>
                            </div>
                        )}
                        {event.place && (
                            <div className="flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
                                <MapPin size={14} className="text-slate-500 shrink-0" aria-hidden="true" />
                                <span className="font-inter-med truncate text-[0.825rem]">{event.place}</span>
                            </div>
                        )}
                    </div>
                </div>

                <Link
                    href={`?eventId=${event.seq}`}
                    scroll={false}
                    className="mt-8 w-full py-4 rounded-2xl flex items-center justify-center gap-2 border md:active:scale-[0.98] text-xs font-inter-bold transition-all shadow-xl group/btn"
                    style={{
                        background: 'var(--surface-elevated)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--foreground)',
                    }}
                    aria-label={`${event.title} 상세 정보 보기`}
                >
                    View Details <ExternalLink size={14} aria-hidden="true" className="text-indigo-400 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </Link>
            </div>
        </motion.div>
    );
}
