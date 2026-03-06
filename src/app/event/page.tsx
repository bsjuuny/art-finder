'use client';

import { useSearchParams } from 'next/navigation';
import EventDetailContent from '@/components/EventDetailContent';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';

function EventDetailPageContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    if (!id) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
                <h1 className="text-2xl font-bold">잘못된 접근입니다.</h1>
                <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors">
                    <ArrowLeft size={18} />
                    <span>메인으로 돌아가기</span>
                </Link>
            </div>
        );
    }

    return <EventDetailContent id={id} />;
}

export default function EventDetailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">로딩 중...</div>}>
            <EventDetailPageContent />
        </Suspense>
    );
}
