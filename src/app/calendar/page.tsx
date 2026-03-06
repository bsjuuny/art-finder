'use client';

import { useState, useEffect, useCallback } from 'react';
import { CultureEvent } from '@/types';
import { fetchCultureEvents } from '@/utils/api';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CultureEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CultureEvent | null>(null);

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    useEffect(() => {
        const fetchMonthEvents = async () => {
            // Calculate dates inside effect relying on stable currentDate or props
            setLoading(true);
            try {
                const start = startOfMonth(currentDate);
                const end = endOfMonth(start);
                const from = format(start, 'yyyyMMdd');
                const to = format(end, 'yyyyMMdd');

                const data = await fetchCultureEvents({
                    numOfRows: '100',
                    pageNo: '1',
                    from: from,
                    to: to,
                });

                setEvents(data.events);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMonthEvents();
    }, [currentDate]); // Only re-run if currentDate changes.

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const getEventsForDay = (day: Date) => {
        const dayStr = format(day, 'yyyyMMdd');
        return events.filter(event => {
            // Check if day is within event start/end range
            // Simple check: start <= day <= end
            return event.startDate <= dayStr && event.endDate >= dayStr;
        });
    };

    const addToGoogleCalendar = (event: CultureEvent) => {
        // start variable unused removed
        // Add 1 day to end date for Google Calendar exclusive end
        // But since we have YYYYMMDD string, we need to parse and add 1 day
        // Or just use YYYYMMDD if it means "inclusive". Google Calendar "dates" is YYYYMMDD/YYYYMMDD+1
        // Actually for all-day events:
        // 20230101/20230102 cover Jan 1.
        // So for range 20230101-20230103, we need 20230104 as end.

        // Parse end date string YYYYMMDD to Date
        const y = parseInt(event.endDate.substring(0, 4));
        const m = parseInt(event.endDate.substring(4, 6)) - 1;
        const d = parseInt(event.endDate.substring(6, 8));
        const endDateObj = new Date(y, m, d);

        // Add 1 day
        endDateObj.setDate(endDateObj.getDate() + 1);

        const endStr = format(endDateObj, 'yyyyMMdd');

        const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.startDate}/${endStr}&details=${encodeURIComponent(event.url || '')}&location=${encodeURIComponent(event.place)}`;
        window.open(googleUrl, '_blank');
    };

    const decodeHtmlEntities = (str: string) => {
        if (!str) return '';
        return str.replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&');
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white pb-20">
            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                        <span>메인으로</span>
                    </Link>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarIcon className="text-indigo-500" />
                        문화 캘린더
                    </h1>
                    <div className="w-[100px]"></div> {/* Spacer */}
                </div>

                {/* Calendar Controls */}
                <div className="flex items-center justify-center gap-6 mb-8">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <span className="text-xl font-semibold w-40 text-center">
                        {format(currentDate, 'yyyy년 M월', { locale: ko })}
                    </span>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b border-white/10 text-center py-3 bg-white/5 font-semibold text-slate-300">
                        {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                            <div key={day} className={i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : ''}>{day}</div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] text-sm">
                        {calendarDays.map((day, idx) => {
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isToday = isSameDay(day, new Date());
                            const dayEvents = getEventsForDay(day);

                            return (
                                <div
                                    key={day.toISOString()}
                                    className={`
                                border-b border-r border-white/5 p-2 min-h-[120px] relative hover:bg-white/5 transition-colors
                                ${!isCurrentMonth ? 'text-slate-600 bg-black/20' : ''}
                                ${idx % 7 === 6 ? 'border-r-0' : ''} // Remove right border for last col
                            `}
                                >
                                    <div className={`
                                mb-2 font-medium w-7 h-7 flex items-center justify-center rounded-full
                                ${isToday ? 'bg-indigo-600 text-white' : ''}
                                ${idx % 7 === 0 && isCurrentMonth ? 'text-red-400' : ''}
                                ${idx % 7 === 6 && isCurrentMonth ? 'text-blue-400' : ''}
                            `}>
                                        {format(day, 'd')}
                                    </div>

                                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] scrollbar-hide">
                                        {/* Desktop: Show events */}
                                        {dayEvents.slice(0, 3).map((event, i) => (
                                            <button
                                                key={`${event.seq}-${i}`}
                                                onClick={() => setSelectedEvent(event)}
                                                className="hidden sm:block text-left text-xs truncate px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/40 transition-colors border-l-2 border-indigo-500"
                                            >
                                                {decodeHtmlEntities(event.title)}
                                            </button>
                                        ))}

                                        {/* Mobile: Show only count */}
                                        {dayEvents.length > 0 && (
                                            <button
                                                onClick={() => setSelectedDate(day)}
                                                className="sm:hidden w-full text-center text-xs font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded py-1"
                                            >
                                                {dayEvents.length}개
                                            </button>
                                        )}

                                        {/* Desktop: Show 'more' if > 3 */}
                                        {dayEvents.length > 3 && (
                                            <button
                                                onClick={() => setSelectedDate(day)}
                                                className="text-xs text-slate-500 pl-1 hover:text-white hover:underline text-left hidden sm:block"
                                            >
                                                + {dayEvents.length - 3}개 더보기
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Event Details Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}>
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-2 pr-8">{decodeHtmlEntities(selectedEvent.title)}</h3>
                        <div className="text-sm text-slate-400 mb-6 space-y-1">
                            <p>{format(selectedEvent.startDate.substring(0, 4) + '-' + selectedEvent.startDate.substring(4, 6) + '-' + selectedEvent.startDate.substring(6, 8), 'yyyy.MM.dd')} ~ {format(selectedEvent.endDate.substring(0, 4) + '-' + selectedEvent.endDate.substring(4, 6) + '-' + selectedEvent.endDate.substring(6, 8), 'yyyy.MM.dd')}</p>
                            <p>{selectedEvent.place}</p>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href={`?eventId=${selectedEvent.seq}`}
                                scroll={false}
                                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-center font-medium transition-colors"
                            >
                                상세보기
                            </Link>
                            <button
                                onClick={() => addToGoogleCalendar(selectedEvent)}
                                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-center font-medium transition-colors"
                            >
                                구글 캘린더 추가
                            </button>
                        </div>
                        <button
                            onClick={() => setSelectedEvent(null)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Daily Events List Modal */}
            {selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedDate(null)}>
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">
                                {format(selectedDate, 'yyyy년 M월 d일', { locale: ko })} 일정
                            </h3>
                            <button
                                onClick={() => setSelectedDate(null)}
                                className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-full"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-grow space-y-2 pr-2 custom-scrollbar">
                            {getEventsForDay(selectedDate).map((event, idx) => (
                                <button
                                    key={`${event.seq}-${idx}`}
                                    onClick={() => {
                                        // setSelectedDate(null); // Keep daily list open? No, maybe close detail opens
                                        // Let's open detail modal ON TOP of this, or close this and open detail.
                                        // Better UX: Open detail modal.
                                        setSelectedEvent(event);
                                    }}
                                    className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-indigo-500/50 group"
                                >
                                    <div className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                                        {decodeHtmlEntities(event.title)}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1 flex justify-between">
                                        <span>{event.place}</span>
                                        <span className="text-indigo-400/70">{event.realmName}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 pointer-events-none">
                    <div className="bg-slate-900/80 p-4 rounded-xl backdrop-blur-md flex items-center gap-3 border border-white/10">
                        <Loader2 className="animate-spin text-indigo-500" />
                        <span>일정을 불러오는 중입니다...</span>
                    </div>
                </div>
            )}
        </main>
    );
}
