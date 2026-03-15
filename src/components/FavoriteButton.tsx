'use client';

import { Heart } from 'lucide-react';
import { CultureEvent } from '@/types';
import { useFavorites } from '@/hooks/useFavorites';

interface Props {
    event: CultureEvent;
    size?: number;
    className?: string;
}

export default function FavoriteButton({ event, size = 18, className = '' }: Props) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const active = isFavorite(event.seq);

    return (
        <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(event); }}
            aria-label={active ? '찜 취소' : '찜하기'}
            aria-pressed={active}
            className={`flex items-center justify-center transition-all active:scale-90 ${className}`}
        >
            <Heart
                size={size}
                aria-hidden="true"
                className={`transition-all duration-200 ${
                    active
                        ? 'fill-rose-500 text-rose-500 scale-110'
                        : 'text-white/70 hover:text-rose-400'
                }`}
            />
        </button>
    );
}
