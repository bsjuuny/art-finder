import { CultureEvent } from '@/types';
import { FavoriteEvent } from '@/hooks/useFavorites';

interface Profile {
    categories: Record<string, number>; // realmName → 찜 횟수
    regions:    Record<string, number>; // area     → 찜 횟수
}

/** 찜 목록에서 선호 패턴 추출 */
function buildProfile(favorites: FavoriteEvent[]): Profile {
    const categories: Record<string, number> = {};
    const regions:    Record<string, number> = {};

    for (const f of favorites) {
        if (f.realmName) categories[f.realmName] = (categories[f.realmName] || 0) + 1;
        if (f.area)      regions[f.area]          = (regions[f.area]          || 0) + 1;
    }
    return { categories, regions };
}

/** 단일 이벤트 추천 점수 계산 (0~100) */
function scoreEvent(event: CultureEvent, profile: Profile): number {
    let score = 0;

    const totalCat = Object.values(profile.categories).reduce((a, b) => a + b, 0);
    const totalReg = Object.values(profile.regions).reduce((a, b) => a + b, 0);

    // 카테고리 일치: 최대 60점
    if (totalCat > 0) {
        score += ((profile.categories[event.realmName] || 0) / totalCat) * 60;
    }

    // 지역 일치: 최대 30점
    if (totalReg > 0) {
        score += ((profile.regions[event.area] || 0) / totalReg) * 30;
    }

    // 썸네일 있으면 소량 가산 (카드 품질)
    if (event.thumbnail) score += 10;

    return score;
}

/**
 * 찜 목록 기반 개인화 추천 이벤트 반환
 * @param events   현재 로드된 이벤트 풀
 * @param favorites 찜 목록
 * @param limit    최대 반환 수
 */
export function getRecommendations(
    events:    CultureEvent[],
    favorites: FavoriteEvent[],
    limit = 6,
): CultureEvent[] {
    if (favorites.length === 0) return [];

    const profile  = buildProfile(favorites);
    const favSeqs  = new Set(favorites.map(f => f.seq));

    return events
        .filter(e => !favSeqs.has(e.seq))           // 이미 찜한 항목 제외
        .map(e => ({ event: e, score: scoreEvent(e, profile) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ event }) => event);
}

/** 찜 목록에서 선호 카테고리·지역 요약 (UI 표시용) */
export function getSummary(favorites: FavoriteEvent[]) {
    const profile = buildProfile(favorites);

    const topCategory = Object.entries(profile.categories)
        .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const topRegion = Object.entries(profile.regions)
        .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return { topCategory, topRegion };
}
