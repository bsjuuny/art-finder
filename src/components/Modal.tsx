'use client';

import { useRouter } from 'next/navigation';
import { useRef, useEffect, useCallback } from 'react';

export default function Modal({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const dialogRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    const onDismiss = useCallback(() => {
        router.back();
    }, [router]);

    const onClick = (e: React.MouseEvent) => {
        if (e.target === dialogRef.current || e.target === e.currentTarget) {
            onDismiss();
        }
    };

    useEffect(() => {
        // 모달 열릴 때 닫기 버튼으로 포커스 이동
        closeButtonRef.current?.focus();

        // Escape 키 닫기
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onDismiss();
        };

        // 포커스 트랩: Tab 키가 모달 내부에서만 순환
        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab' || !dialogRef.current) return;
            const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
            );
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
            }
        };

        document.addEventListener('keydown', handleEsc);
        document.addEventListener('keydown', handleTab);
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.removeEventListener('keydown', handleTab);
        };
    }, [onDismiss]);

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="공연 상세 정보"
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={onClick}
        >
            <div ref={dialogRef} className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                {children}
                <button
                    ref={closeButtonRef}
                    onClick={onDismiss}
                    aria-label="모달 닫기"
                    className="absolute top-4 right-4 z-[60] p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors border border-white/10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        </div>
    );
}
