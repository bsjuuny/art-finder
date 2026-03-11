'use client';

import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

/**
 * useTheme — manages dark/light mode preference.
 * Persists to localStorage, falls back to OS preference.
 * Sets data-theme attribute on <html> element.
 */
export function useTheme() {
    const [theme, setThemeState] = useState<Theme>('dark');

    useEffect(() => {
        const saved = localStorage.getItem('theme') as Theme | null;
        const initial: Theme =
            saved === 'dark' || saved === 'light'
                ? saved
                : window.matchMedia('(prefers-color-scheme: light)').matches
                    ? 'light'
                    : 'dark';
        setThemeState(initial);
        document.documentElement.setAttribute('data-theme', initial);
    }, []);

    const toggleTheme = () => {
        setThemeState(prev => {
            const next: Theme = prev === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            return next;
        });
    };

    return { theme, toggleTheme };
}
