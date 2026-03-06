import React, { useState, useEffect } from 'react';
import { fetchReviews, BlogReview } from '@/utils/reviewApi';
import { MessageSquare, ExternalLink, Calendar, User } from 'lucide-react';

interface ReviewSectionProps {
    title: string | null;
}

export default function ReviewSection({ title }: ReviewSectionProps) {
    const [reviews, setReviews] = useState<BlogReview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getReviews = async () => {
            setLoading(true);
            if (title) {
                const query = `"${title}" 전시 미술관 관람 후기 -영화 -드라마 -넷플릭스`;
                const data = await fetchReviews(query, 4, title);
                setReviews(data);
            }
            setLoading(false);
        };

        getReviews();
    }, [title]);

    if (!title) return null;

    return (
        <section className="mt-20 border-t border-white/5 pt-16">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-white tracking-tight uppercase">
                            Cultural <span className="text-indigo-400">Reviews</span>
                        </h3>
                        <p className="text-slate-500 text-sm font-medium">관람객들의 생생한 블로그 후기</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold tracking-widest text-xs uppercase animate-pulse">Loading Feedback...</p>
                </div>
            ) : reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {reviews.map((review, index) => (
                        <a
                            key={index}
                            href={review.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative p-8 rounded-[2rem] glass bg-white/2 hover:bg-white/5 border-white/5 hover:border-indigo-500/30 transition-all shadow-xl hover:-translate-y-2"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2 text-slate-400 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                                    <User size={12} className="text-indigo-400" />
                                    <span className="text-xs font-bold tracking-tight">
                                        {review.blogger}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Calendar size={12} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">
                                        {review.date}
                                    </span>
                                </div>
                            </div>
                            <h4
                                className="text-xl font-black text-slate-100 mb-4 line-clamp-1 group-hover:text-indigo-400 transition-colors leading-tight"
                                dangerouslySetInnerHTML={{ __html: review.title }}
                            />
                            <p
                                className="text-sm text-slate-400 line-clamp-3 leading-relaxed font-medium mb-6"
                                dangerouslySetInnerHTML={{ __html: review.description }}
                            />
                            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
                                Read Full Review <ExternalLink size={14} />
                            </div>
                        </a>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 glass bg-white/2 rounded-[3rem] border-white/5 border-dashed">
                    <MessageSquare className="mx-auto text-slate-700 mb-4" size={48} />
                    <p className="text-slate-400 text-lg font-bold">등록된 관람 후기가 없습니다.</p>
                    <p className="text-slate-600 text-sm">첫 번째 후기의 주인공이 되어보세요!</p>
                </div>
            )}
        </section>
    );
}
