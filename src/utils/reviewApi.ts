const IS_DEV = process.env.NODE_ENV === 'development';
const PROXY_URL = IS_DEV ? '/artfinder/naver-api' : '/artfinder/naver_proxy.php';

export interface BlogReview {
    title: string;
    description: string;
    link: string;
    blogger: string;
    date: string;
}

/**
 * 제목에서 네이버 검색에 효과적인 핵심 키워드를 추출합니다.
 *
 * 처리 예시:
 *  "《현대도예-오디세이》전시연계 상시 무료 교육 프로그램" → "현대도예-오디세이"
 *  "센과 치히로의 행방불명 오리지널 투어 (SPIRITED AWAY)"  → "센과 치히로의 행방불명"
 *  "2025 국립국악원 정기공연"                              → "2025 국립국악원 정기공연"
 */
function extractSearchKeyword(title: string): string {
    // 0. 앞의 [지역] 태그 제거 (예: "[서울] 센과 치히로...")
    const withoutRegion = title.replace(/^\[[^\]]*\]\s*/, '').trim();
    const base = withoutRegion || title;

    // 1. 《》 안 내용이 있으면 그것을 우선 사용
    const bookTitle = base.match(/[《「『〈](.*?)[》」』〉]/)?.[1]?.trim();
    if (bookTitle && bookTitle.length >= 2) return bookTitle;

    // 2. 장식 괄호 제거 후 일반 괄호 앞 부분 추출
    const cleaned = base.replace(/[《》「」『』〈〉]/g, '').trim();
    const beforeParen = cleaned.split(/[([\u3010\uff08]/)[0].trim();
    const keyword = beforeParen || cleaned;

    // 3. 20자 이내면 그대로 사용
    if (keyword.length <= 20) return keyword;

    // 4. 공백 기준으로 18자 이내로 자름
    const words = keyword.split(' ');
    let result = '';
    for (const word of words) {
        if ((result + ' ' + word).trim().length > 18) break;
        result = (result + ' ' + word).trim();
    }
    return result || keyword.slice(0, 18);
}


export const fetchReviews = async (title: string, display: number = 10): Promise<BlogReview[]> => {
    if (!title) return [];

    try {
        const keyword = extractSearchKeyword(title);
        // 따옴표 없이 검색 — 띄어쓰기 변형("공룡 AR 트릭아트전" 등)도 매칭
        const query = `${keyword} 후기`;
        // 필터링 후 display개가 남도록 넉넉하게 fetch
        const fetchCount = Math.min(display * 4, 100);
        const params = new URLSearchParams({ query, display: String(fetchCount), sort: 'date' });

        const response = await fetch(`${PROXY_URL}?${params.toString()}`);
        if (!response.ok) return [];

        const text = await response.text();
        let data: { items?: unknown[] };
        try {
            data = JSON.parse(text);
        } catch {
            console.error('[reviewApi] Non-JSON response:', text.substring(0, 100));
            return [];
        }

        const items: unknown[] = data.items || [];
        if (!items.length) return [];

        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - 3); // 3개월 이내

        const normalize = (s: string) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, '').toLowerCase();
        const normKeyword = normalize(keyword);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const decodeHtml = (s: string) =>
            s.replace(/<[^>]+>/g, '')
             .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
             .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'").replace(/&apos;/g, "'");

        return (items as any[])
            .filter((item) => {
                const dateRaw: string = item.postdate || '';
                if (dateRaw.length === 8) {
                    const postDate = new Date(`${dateRaw.slice(0, 4)}-${dateRaw.slice(4, 6)}-${dateRaw.slice(6, 8)}`);
                    if (postDate < cutoff) return false;
                }
                const normTitle = normalize(item.title || '');
                const normDesc  = normalize(item.description || '');
                return normTitle.includes(normKeyword) || normDesc.includes(normKeyword);
            })
            .map((item) => {
                const dateRaw: string = item.postdate || '';
                return {
                    title: decodeHtml(item.title || ''),
                    description: decodeHtml(item.description || ''),
                    link: item.link,
                    blogger: item.bloggername || 'Naver Blog',
                    date: dateRaw.length === 8
                        ? `${dateRaw.slice(0, 4)}.${dateRaw.slice(4, 6)}.${dateRaw.slice(6, 8)}`
                        : '',
                };
            })
            .slice(0, display);
    } catch (error) {
        console.error('[reviewApi] Failed to fetch reviews:', error);
        return [];
    }
};
