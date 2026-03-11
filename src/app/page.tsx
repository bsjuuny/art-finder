'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { CultureEvent } from '@/types';
import ArtCard from '@/components/ArtCard';
import { Search, Filter, Loader2, Palette, Music, Theater, Camera, Calendar as CalendarIcon, Sparkles, TrendingUp, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCultureEvents } from '@/utils/api';
import DonationPopup from '@/components/DonationPopup';

const CATEGORIES = [
  { id: '', name: '전체', icon: Palette, color: 'from-slate-500 to-slate-600' },
  { id: 'A', name: '공연/전시', icon: Theater, color: 'from-indigo-600 to-blue-600' },
  { id: 'B', name: '행사/축제', icon: Music, color: 'from-pink-600 to-rose-600' },
  { id: 'C', name: '교육/체험', icon: Camera, color: 'from-emerald-600 to-teal-600' },
];

const RECOMMENDATIONS = ['국립중앙박물관', '예술의전당', '세종문화회관', '서울시립미술관'];

// Hooks
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function Home() {
  // State
  const [events, setEvents] = useState<CultureEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isNavScrolled, setIsNavScrolled] = useState(false);

  // Refs
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsNavScrolled(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadMoreEvents = useCallback(async (isReset: boolean = false) => {
    if (loadingRef.current && !isReset) return;

    if (isReset && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    loadingRef.current = true;
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const currentPage = isReset ? 1 : pageRef.current;

    try {
      const data = await fetchCultureEvents({
        numOfRows: '20',
        pageNo: currentPage.toString(),
        keyword: debouncedSearchTerm,
        serviceTp: selectedCategory,
      }, controller.signal);

      const newEvents = data.events;
      const totalCount = data.totalCount;

      if (isReset) {
        setEvents(newEvents);
        setHasMore(newEvents.length < totalCount);
        pageRef.current = 2;
      } else {
        pageRef.current = currentPage + 1;

        setEvents((prev: CultureEvent[]) => {
          const existingSeqs = new Set(prev.map(e => e.seq));
          const uniqueNewEvents = newEvents.filter(e => !existingSeqs.has(e.seq));

          if (prev.length + uniqueNewEvents.length >= totalCount || (uniqueNewEvents.length === 0 && newEvents.length > 0)) {
            setHasMore(false);
          } else if (newEvents.length === 0) {
            setHasMore(false);
          }

          return [...prev, ...uniqueNewEvents];
        });
      }
    } catch (error: unknown) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        console.error('Failed to fetch events:', error);
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, [debouncedSearchTerm, selectedCategory]);

  useEffect(() => {
    setHasMore(true);
    pageRef.current = 1;
    loadMoreEvents(true);
  }, [debouncedSearchTerm, selectedCategory, loadMoreEvents]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <main className="min-h-screen pb-20 selection:bg-indigo-500/30">
      <div className="animated-bg" />

      {/* Hero & Navigation Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="w-full max-w-[1400px] mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-indigo-500/30 text-indigo-400 text-xs font-bold mb-8 tracking-widest uppercase"
          >
            <Sparkles size={14} />
            <span>Discover Your Next Inspiration</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-none"
          >
            ART <span className="gradient-text">FINDER</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed font-medium"
          >
            대한민국의 모든 공연, 전시, 문화 정보를 <br className="hidden md:block" />
            가장 직관적이고 세련된 플랫폼에서 발견하세요.
          </motion.p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-xl relative group"
            >
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="공연명, 예술가, 장소 등을 검색해보세요"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-24 py-5 rounded-3xl glass border-white/10 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all placeholder:text-slate-500 shadow-2xl text-lg font-medium"
                  style={{
                    background: 'var(--input-bg)',
                    color: 'var(--input-text)',
                  }}
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={24} />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-lg active:scale-95"
                >
                  검색
                </button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/calendar" className="flex items-center gap-3 px-8 py-5 rounded-3xl glass hover:bg-white/10 font-bold transition-all border border-white/10 hover:border-indigo-500/40 group" style={{ background: 'var(--glass-card-bg)', color: 'var(--foreground)' }}>
                <CalendarIcon size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>캘린더 뷰</span>
              </Link>
            </motion.div>
          </div>

          {/* Quick Recommendations Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto"
          >
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-2 flex items-center gap-1">
              <TrendingUp size={14} /> Recommended:
            </span>
            {RECOMMENDATIONS.map((rec) => (
              <button
                key={rec}
                onClick={() => setSearchTerm(rec)}
                className="px-4 py-1.5 rounded-full glass hover:bg-indigo-500/20 transition-all font-semibold border border-white/5 hover:border-indigo-500/30 text-xs"
                style={{ background: 'var(--glass-card-bg)', color: 'var(--text-secondary)' }}
              >
                #{rec}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {isNavScrolled && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[850px] px-6"
          >
            <div className="bg-slate-950/95 dark:bg-slate-950/95 backdrop-blur-3xl rounded-[2.5rem] p-2 border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_20px_rgba(99,102,241,0.15)] flex items-center justify-between gap-4" style={{ background: 'var(--surface-toggle)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide no-scrollbar p-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] whitespace-nowrap transition-all duration-300 ${selectedCategory === cat.id
                      ? `bg-gradient-to-r ${cat.color} text-white shadow-lg md:scale-105`
                      : 'md:hover:bg-white/10'
                      }`}
                    style={selectedCategory !== cat.id ? { color: 'var(--foreground)' } : {}}
                  >
                    <cat.icon size={18} className={selectedCategory === cat.id ? 'text-white' : 'text-indigo-400'} />
                    <span className="font-bold text-sm tracking-tight">{cat.name}</span>
                  </button>
                ))}
              </div>
              <div className="h-10 w-px bg-white/10 hidden sm:block"></div>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hidden sm:flex items-center gap-2 px-7 py-3 rounded-[1.5rem] bg-indigo-500/10 hover:bg-indigo-500/20 font-bold transition-all border border-indigo-500/30 text-sm whitespace-nowrap shadow-inner"
                style={{ color: 'var(--foreground)' }}
              >
                <Search size={16} />
                <span>Search</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Category Selection (Inline) */}
      {!isNavScrolled && (
        <section className="px-6 mb-16 relative z-10">
          <div className="w-full max-w-[1400px] mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex items-center gap-3 px-8 py-5 rounded-[2rem] transition-all transform md:hover:scale-105 md:active:scale-95 ${selectedCategory === cat.id
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-2xl shadow-indigo-500/20`
                    : 'glass md:hover:bg-white/10 border-white/10'
                    }`}
                  style={selectedCategory !== cat.id ? { background: 'var(--glass-card-bg)', color: 'var(--text-secondary)' } : {}}
                >
                  <cat.icon size={24} />
                  <span className="font-black text-lg tracking-tight">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Results Grid / Fallback Content */}
      <section className="px-6 min-h-[40vh] relative z-10">
        <div className="w-full max-w-[1600px] mx-auto">
          {events.length === 0 && loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-8">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-10 animate-pulse"></div>
              </div>
              <p className="text-slate-500 font-inter-bold tracking-[0.3em] text-xs uppercase animate-pulse">Synchronizing Cultural Assets</p>
            </div>
          ) : (
            <>
              {events.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 lg:gap-10">
                  {events.map((event, idx) => (
                    <motion.div
                      key={`${event.seq}-${idx}`}
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{
                        duration: 0.8,
                        ease: [0.23, 1, 0.32, 1],
                        delay: (idx % 5) * 0.05 // Subtle stagger for visible items on load
                      }}
                    >
                      <ArtCard event={event} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                !loading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                    className="max-w-4xl mx-auto"
                  >
                    <div className="text-center py-32 mb-12 glass border-white/5 rounded-[4rem] bg-indigo-500/[0.02] shadow-inner">
                      <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-8 border border-white/5">
                        <Filter className="text-indigo-500/20" size={40} />
                      </div>
                      <h3 className="text-4xl font-inter-black mb-6 tracking-tight" style={{ color: 'var(--foreground)' }}>지평선 끝까지 찾았습니다만...</h3>
                      <p className="text-lg mb-12 max-w-lg mx-auto font-inter-med leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        요청하신 보물을 아직 발견하지 못했습니다.<br />
                        다른 영감을 검색하거나 아래 추천 항목을 확인해보세요.
                      </p>

                      <div className="glass bg-slate-950/40 rounded-[2.5rem] p-10 border border-white/5 inline-block text-left max-w-xl w-full">
                        <h4 className="flex items-center gap-3 text-indigo-400 font-inter-bold mb-6 tracking-wider uppercase text-xs">
                          <TrendingUp size={16} /> Hot Cultural Trends
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {['국립중앙박물관', '예술의전당', '디뮤지엄', '세종문화회관', '서울숲 산책', '성수동 팝업'].map((item) => (
                            <button
                              key={item}
                              onClick={() => setSearchTerm(item)}
                              className="flex items-center gap-3 cursor-pointer text-slate-400 hover:text-white transition-all bg-white/[0.03] hover:bg-indigo-500/10 p-4 rounded-2xl border border-white/5 hover:border-indigo-500/30 group/rec text-sm font-inter-semi"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40 group-hover/rec:bg-indigo-400 group-hover/rec:scale-125 transition-all"></div>
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              )}

              {/* Load More Button */}
              {hasMore && events.length > 0 && (
                <div className="flex justify-center py-20 w-full">
                  <button
                    onClick={() => loadMoreEvents(false)}
                    disabled={loading}
                    className="px-12 py-4 rounded-2xl font-black tracking-widest transition-all border shadow-xl disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                    style={{ 
                      background: 'var(--surface-elevated)', 
                      color: 'var(--foreground)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-3">
                        <Loader2 className="animate-spin" size={20} />
                        Loading More...
                      </span>
                    ) : (
                      'Discover More Content'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer Reliability Info */}
      <footer className="mt-20 border-t border-white/5 pt-12 pb-20 px-6">
        <div className="w-full max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8 py-8 glass rounded-3xl border cursor-default" style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-6 px-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Info size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Data Reliability</p>
              <h4 className="font-bold" style={{ color: 'var(--foreground)' }}>Public Data Source: 문화포털 문화예술 정보 API</h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Last Synced: {new Date().toLocaleDateString()} (Daily Update)</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-8 md:border-l border-white/5" style={{ borderColor: 'var(--border-color)' }}>
            <div className="text-center md:text-right">
              <p className="font-black tracking-tight" style={{ color: 'var(--foreground)' }}>ART FINDER PLATFORM</p>
              <p className="text-xs uppercase font-bold tracking-[0.2em]" style={{ color: 'var(--text-secondary)' }}>Crafted For Perfection</p>
            </div>
          </div>
        </div>
      </footer>

      <DonationPopup />
    </main>
  );
}
