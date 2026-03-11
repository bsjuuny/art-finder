'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            className="fixed top-4 right-4 z-50 flex items-center justify-center w-10 h-10 rounded-full border backdrop-blur-xl transition-all duration-200 hover:scale-110 active:scale-95 shadow-md"
            style={{
                background: 'var(--surface-toggle)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)',
            }}
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
            ) : (
                <Moon className="w-5 h-5 text-violet-500" />
            )}
        </button>
    );
}
