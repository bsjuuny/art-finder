'use client';

import { useCallback, useEffect, useState } from 'react';
import { CultureEvent } from '@/types';

const STORAGE_KEY = 'artfinder_favorites';
const EVENT_NAME  = 'artfinder:favorites';

export interface FavoriteEvent extends CultureEvent {
    savedAt: string;
}

function readStorage(): FavoriteEvent[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

function writeStorage(data: FavoriteEvent[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event(EVENT_NAME));
}

export function useFavorites() {
    const [favorites, setFavorites] = useState<FavoriteEvent[]>([]);

    useEffect(() => {
        setFavorites(readStorage());
        const sync = () => setFavorites(readStorage());
        window.addEventListener(EVENT_NAME, sync);
        return () => window.removeEventListener(EVENT_NAME, sync);
    }, []);

    const isFavorite = useCallback(
        (seq: string) => favorites.some(f => f.seq === seq),
        [favorites],
    );

    const toggleFavorite = useCallback((event: CultureEvent) => {
        const current = readStorage();
        const exists  = current.some(f => f.seq === event.seq);
        const next    = exists
            ? current.filter(f => f.seq !== event.seq)
            : [{ ...event, savedAt: new Date().toISOString() }, ...current];
        writeStorage(next);
        setFavorites(next);
    }, []);

    return { favorites, isFavorite, toggleFavorite };
}
