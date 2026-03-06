"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Coffee, Heart } from "lucide-react";

export default function DonationPopup() {
    const [mounted, setMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [hasClosed, setHasClosed] = useState(false);

    const handleScroll = useCallback(() => {
        if (hasClosed || isVisible) return;

        if (window.scrollY > 500) {
            setIsVisible(true);
        }
    }, [hasClosed, isVisible]);

    useEffect(() => {
        setMounted(true);
        const closed = sessionStorage.getItem("donationPopupClosed") === "true";
        setHasClosed(closed);

        if (!closed) {
            window.addEventListener("scroll", handleScroll);
            return () => window.removeEventListener("scroll", handleScroll);
        }
    }, [handleScroll]);

    const closePopup = () => {
        setIsVisible(false);
        setHasClosed(true);
        sessionStorage.setItem("donationPopupClosed", "true");
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed bottom-8 right-8 z-[9999] w-[320px] glass rounded-[2.5rem] p-8 overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-white/10 group"
                >
                    <button
                        onClick={closePopup}
                        className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
                        aria-label="닫기"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-3xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform duration-500">
                            <Coffee size={40} strokeWidth={1.5} />
                        </div>

                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-inter-bold tracking-widest uppercase mb-4">
                            <Heart size={10} fill="currentColor" />
                            <span>Support Art Finder</span>
                        </div>

                        <p className="text-slate-200 font-inter-bold text-base leading-relaxed mb-6">
                            대한민국 구석구석의<br />
                            문화 예술 정보를 찾으셨나요? ☕
                        </p>

                        <p className="text-slate-500 font-inter-med text-xs leading-relaxed mb-8">
                            작은 응원이 플랫폼을 지속하고<br />
                            더 나은 정보를 제공하는 큰 힘이 됩니다.
                        </p>

                        <div className="w-full relative group/qr">
                            <div className="bg-white rounded-3xl p-4 inline-block shadow-inner">
                                <img
                                    src="/artfinder/donation-qr.png"
                                    alt="기부 QR 코드"
                                    className="w-40 h-40 object-contain"
                                />
                            </div>
                            <div className="mt-4 text-[10px] font-inter-bold text-slate-600 uppercase tracking-widest">
                                Scan to support
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
