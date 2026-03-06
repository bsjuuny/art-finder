// Development: Proxy via Next.js rewrites to avoid CORS
// Production: Use the PHP proxy located in the public directory
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
 * Fetch reviews from Naver Blog Search API via Proxy
 * @param keyword Search query (e.g., Exhibition Title + " 후기")
 * @param display Number of results (default 5)
 */
export const fetchReviews = async (keyword: string, display: number = 5, filterTitle: string = ''): Promise<BlogReview[]> => {
    if (!keyword) return [];

    try {
        const queryParams = new URLSearchParams({
            query: keyword,
            display: '50', // Fetch more to ensure we have enough after filtering
            sort: 'sim' // 'sim' for relevance, 'date' for recent
        });

        const response = await fetch(`${PROXY_URL}?${queryParams.toString()}`);
        if (!response.ok) throw new Error(`Failed to fetch reviews: ${response.status}`);

        const data = await response.json();

        if (data && data.items) {
            // Get date 1 month ago
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const filteredAndMapped = data.items.filter((item: any) => {
                const dateRaw = item.postdate || '';
                if (dateRaw.length === 8) {
                    const postDate = new Date(`${dateRaw.slice(0, 4)}-${dateRaw.slice(4, 6)}-${dateRaw.slice(6, 8)}`);
                    if (postDate < oneMonthAgo) return false;
                }

                if (filterTitle) {
                    const strippedTitle = item.title.replace(/<[^>]+>/g, '');
                    const normalizedFilterTitle = filterTitle.replace(/\s+/g, '').toLowerCase();
                    const normalizedBlogTitle = strippedTitle.replace(/\s+/g, '').toLowerCase();
                    if (!normalizedBlogTitle.includes(normalizedFilterTitle)) return false;
                }

                return true;
            }).map((item: any) => {
                const dateRaw = item.postdate || '';
                const formattedDate = dateRaw.length === 8
                    ? `${dateRaw.slice(0, 4)}.${dateRaw.slice(4, 6)}.${dateRaw.slice(6, 8)}`
                    : dateRaw;

                return {
                    title: item.title.replace(/<[^>]+>/g, ''),
                    description: item.description.replace(/<[^>]+>/g, ''),
                    link: item.link,
                    blogger: item.bloggername,
                    date: formattedDate
                };
            });

            return filteredAndMapped.slice(0, display);
        }
        return [];
    } catch (error) {
        console.error("Failed to fetch reviews:", error);
        return [];
    }
};
