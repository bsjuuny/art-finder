'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import ArtCard from '@/components/ArtCard';
import { Search, Filter, Loader2, Calendar as CalendarIcon, Sparkles, TrendingUp, Info, MapPin, ArrowUp, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import { useDebounce } from '@/hooks/useDebounce';
import { useCultureEvents } from '@/hooks/useCultureEvents';
import { useFavorites } from '@/hooks/useFavorites';
import { getRecommendations } from '@/utils/recommendations';
import { CATEGORIES, RECOMMENDATIONS, REGIONS } from '@/constants/culture';
import DonationPopup from '@/components/DonationPopup';
import { cn } from '@/lib/utils';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);
  const forYouRef = useRef<HTMLElement>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const { favorites } = useFavorites();
  const { events, loading, error, hasMore, loadMore } = useCultureEvents({
    keyword: debouncedSearch,
    serviceTp: selectedCategory,
    sido: selectedRegion,
  });
  const recommendations = useMemo(
    () => getRecommendations(events, favorites, 6),
    [events, favorites],
  );

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsNavScrolled(true);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const onScroll = () => {
      if (window.innerWidth >= 768) {
        setIsNavScrolled(window.scrollY > 400);
      } else {
        setIsNavScrolled(true);
      }
      setIsRegionOpen(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const scrollToResults = () => {
    const target = (recommendations.length > 0 && favorites.length > 0) ? forYouRef.current : resultsRef.current;
    if (target) {
      const offset = isMobile ? 120 : 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    scrollToResults();
  };

  const handleRegionChange = (regionId: string) => {
    setSelectedRegion(regionId);
    setIsRegionOpen(false);
    scrollToResults();
  };

  const handleSearch = (e: React.FormEvent) => e.preventDefault();

  return (
    <main className={cn(
      "min-h-screen pb-20 selection:bg-indigo-500/30 transition-all duration-300",
      isNavScrolled && isMobile ? "pt-32" : "pt-0"
    )}>
      <div className="animated-bg" />

      {/* Hero & Navigation Section */}
      <section className={cn("relative pt-20 md:pt-32 pb-20 px-6 overflow-hidden", isMobile && "hidden")}>
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
                <label htmlFor="main-search" className="sr-only">공연, 전시, 행사 검색</label>
                <input
                  id="main-search"
                  type="search"
                  placeholder="공연명, 예술가, 장소 등을 검색해보세요"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-24 py-5 rounded-3xl glass focus:outline-none focus:ring-4 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all placeholder:text-slate-500 shadow-2xl text-lg font-medium"
                  style={{
                    background: 'var(--input-bg)',
                    color: 'var(--input-text)',
                  }}
                />
                <Search aria-hidden="true" className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={24} />
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
            className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto mb-8"
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

          {/* Category + Region Filter Pills — sticky nav 없을 때만 표시 */}
          <AnimatePresence>
            {!isNavScrolled && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3 w-full"
              >
                {/* 카테고리 */}
                <Swiper
                  modules={[FreeMode]}
                  slidesPerView="auto"
                  freeMode
                  spaceBetween={8}
                  slidesOffsetBefore={24}
                  slidesOffsetAfter={24}
                  className="w-full !overflow-visible [&_.swiper-wrapper]:items-center"
                >
                  {CATEGORIES.map((cat) => (
                    <SwiperSlide key={cat.id} style={{ width: 'auto' }}>
                      <button
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl whitespace-nowrap transition-all duration-200 font-bold text-sm leading-none ${selectedCategory === cat.id
                          ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                          : 'glass border border-white/5 hover:bg-white/10'
                          }`}
                        style={selectedCategory !== cat.id ? { color: 'var(--text-secondary)' } : {}}
                      >
                        <cat.icon size={15} className={selectedCategory === cat.id ? 'text-white' : 'text-indigo-400'} />
                        {cat.name}
                      </button>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* 지역 */}
                <Swiper
                  modules={[FreeMode]}
                  slidesPerView="auto"
                  freeMode
                  spaceBetween={8}
                  slidesOffsetBefore={24}
                  slidesOffsetAfter={24}
                  className="w-full !overflow-visible [&_.swiper-wrapper]:items-center"
                >
                  <SwiperSlide style={{ width: 'auto' }}>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-500 select-none px-1 leading-none">
                      <MapPin size={12} className="shrink-0" /> 지역
                    </div>
                  </SwiperSlide>
                  {REGIONS.map((region) => (
                    <SwiperSlide key={region.id} style={{ width: 'auto' }}>
                      <button
                        onClick={() => handleRegionChange(region.id)}
                        className={`px-4 py-2 rounded-2xl whitespace-nowrap transition-all duration-200 font-bold text-xs leading-none ${selectedRegion === region.id
                          ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                          : 'glass border border-white/5 hover:bg-white/10'
                          }`}
                        style={selectedRegion !== region.id ? { color: 'var(--text-secondary)' } : {}}
                      >
                        {region.name}
                      </button>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <AnimatePresence>
        {isNavScrolled && (
          <motion.div
            initial={isMobile ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={isMobile ? { opacity: 1 } : { y: -100, opacity: 0 }}
            className={cn(
              "fixed left-1/2 -translate-x-1/2 z-50 w-full px-4 sm:px-6 transition-all duration-300",
              isMobile ? "top-0 pt-4 pb-2 glass border-b shadow-2xl" : "top-6 max-w-[850px]"
            )}
          >
            <div className={cn(
              "flex flex-col transition-all duration-300",
              isMobile ? "gap-2" : "backdrop-blur-3xl rounded-[2.5rem] p-2 border shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_20px_rgba(99,102,241,0.15)] flex-row items-center gap-2"
            )}
              style={!isMobile ? { background: 'var(--surface-toggle)', borderColor: 'var(--border-color)' } : {}}
            >
              {/* Search Bar on Mobile Sticky */}
              {isMobile && (
                <form onSubmit={handleSearch} className="relative w-full px-2">
                  <input
                    type="search"
                    placeholder="공연명, 예술가, 장소 검색"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass focus:outline-none text-sm font-medium"
                    style={{ background: 'var(--input-bg)', color: 'var(--input-text)' }}
                  />
                  <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                </form>
              )}

              <div className={cn(
                "flex items-center gap-2 min-w-0 flex-1",
                isMobile ? "px-1" : ""
              )}>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide no-scrollbar flex-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-[1.5rem] whitespace-nowrap transition-all duration-300",
                        isMobile ? "px-4 py-2 text-xs" : "px-6 py-3 text-sm",
                        selectedCategory === cat.id
                          ? `bg-gradient-to-r ${cat.color} text-white shadow-lg md:scale-105`
                          : "hover:bg-indigo-500/10"
                      )}
                      style={selectedCategory !== cat.id ? { color: 'var(--text-secondary)' } : {}}
                    >
                      <cat.icon size={isMobile ? 14 : 18} className={selectedCategory === cat.id ? 'text-white' : 'text-indigo-400'} />
                      <span className="font-bold tracking-tight">{cat.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                  <Link
                    href="/favorites"
                    aria-label={`찜 목록 (${favorites.length}개)`}
                    className={cn(
                      "relative shrink-0 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors",
                      isMobile ? "w-8 h-8 bg-white/5" : "w-10 h-10 rounded-[1.5rem]"
                    )}
                    style={{ color: favorites.length > 0 ? '#f43f5e' : 'var(--text-secondary)' }}
                  >
                    <Heart size={isMobile ? 16 : 18} aria-hidden="true" className={favorites.length > 0 ? 'fill-rose-500' : ''} />
                    {favorites.length > 0 && (
                      <span className={cn(
                        "absolute rounded-full bg-rose-500 text-white font-black flex items-center justify-center",
                        isMobile ? "-top-1 -right-1 w-3.5 h-3.5 text-[8px]" : "-top-0.5 -right-0.5 w-4 h-4 text-[9px]"
                      )}>
                        {favorites.length > 9 ? '9+' : favorites.length}
                      </span>
                    )}
                  </Link>

                  <div className="hidden sm:block h-8 w-px bg-white/10 shrink-0 mx-1"></div>

                  <div className="relative shrink-0">
                    <button
                      onClick={() => setIsRegionOpen(prev => !prev)}
                      className={cn(
                        "flex items-center gap-1 font-bold transition-all text-xs whitespace-nowrap",
                        isMobile ? "px-2.5 py-2 glass rounded-full" : "px-3 py-2.5 rounded-[1.5rem] hover:bg-white/10",
                        selectedRegion ? 'text-indigo-400' : 'text-[var(--text-secondary)]'
                      )}
                    >
                      <MapPin size={isMobile ? 12 : 14} aria-hidden="true" className="shrink-0" />
                      <span>{selectedRegion || '전국'}</span>
                    </button>

                    <AnimatePresence>
                      {isRegionOpen && (
                        <>
                          <div className="fixed inset-0 z-[60]" onClick={() => setIsRegionOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.96 }}
                            transition={{ duration: 0.15 }}
                            className={cn(
                              "absolute z-[70] w-64 rounded-2xl border shadow-2xl p-3 flex flex-wrap gap-1.5",
                              isMobile ? "top-full right-0 mt-2" : "top-full mt-2 right-0"
                            )}
                            style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border-color)' }}
                          >
                            {REGIONS.map((region) => (
                              <button
                                key={region.id}
                                onClick={() => handleRegionChange(region.id)}
                                className={cn(
                                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                                  selectedRegion === region.id
                                    ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                                    : 'border border-white/5 hover:bg-white/10'
                                )}
                                style={selectedRegion !== region.id ? { color: 'var(--text-secondary)' } : {}}
                              >
                                {region.name}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 개인화 추천 섹션 — 찜 1개 이상, 추천 결과 있을 때 표시 */}
      <AnimatePresence>
        {favorites.length >= 1 && recommendations.length > 0 && (
          <motion.section
            ref={forYouRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            aria-label="맞춤 추천 공연"
            className="relative z-10 mx-4 my-6 rounded-3xl border-2 overflow-hidden scroll-mt-32"
            style={{ background: 'var(--surface)', borderColor: 'rgba(244,63,94,0.4)' }}
          >
            {/* 상단 헤더 바 */}
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.10)' }}>
              <span className="flex items-center gap-2 text-xs font-black tracking-widest uppercase text-rose-400">
                <Heart size={12} aria-hidden="true" className="fill-rose-400" />
                For You · 맞춤 추천
              </span>
              <Link
                href="/favorites"
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl border transition-colors hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400"
                style={{ borderColor: 'rgba(244,63,94,0.25)', color: 'var(--text-muted)' }}
              >
                <Heart size={10} aria-hidden="true" />
                찜 {favorites.length}개
              </Link>
            </div>

            <div className="p-5">
              <div>
                <h2 className="text-lg md:text-2xl font-black tracking-tight mb-0.5">
                  찜 기반 <span className="text-rose-400">맞춤 추천</span>
                </h2>
                <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
                  찜한 공연의 장르·지역을 분석했어요
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-5">
                  {recommendations.map((event, idx) => (
                    <motion.div
                      key={event.seq}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                    >
                      <ArtCard event={event} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Results Grid / Fallback Content */}
      <section ref={resultsRef} className="px-6 pt-12 min-h-[40vh] relative z-10 scroll-mt-32">
        <div className="w-full max-w-[1600px] mx-auto">
          {error ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
              <p className="text-rose-400 font-bold">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all text-sm font-bold"
              >
                다시 시도
              </button>
            </div>
          ) : events.length === 0 && loading ? (
            <div role="status" aria-live="polite" aria-label="문화 행사 목록 로드 중" className="flex flex-col items-center justify-center py-40 gap-8">
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
                    onClick={loadMore}
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

      <AnimatePresence>
        {isNavScrolled && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToResults}
            className="sm:hidden fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl border border-white/20"
            style={{ background: 'var(--surface-elevated)', color: 'var(--text-secondary)' }}
            aria-label="리스트 상단으로"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      <DonationPopup />
    </main>
  );
}
