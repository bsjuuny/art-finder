
import { NextResponse, NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;

    if (process.env.NODE_ENV === 'development') {
        if (pathname.startsWith('/api/culture')) {
            console.log(`[Middleware] PROXY active for: ${pathname}`);

            const API_KEY = process.env.CULTURE_API_KEY || '';
            const BASE_URL = process.env.CULTURE_API_BASE_URL || 'https://apis.data.go.kr/B553457/cultureinfo';

            let targetUrl = '';
            let relativePath = pathname.replace('/api/culture', '');

            // Trim trailing slashes from the end of relativePath
            if (relativePath.endsWith('/')) {
                relativePath = relativePath.slice(0, -1);
            }

            if (relativePath === '' || relativePath === '/') {
                const url = new URL(`${BASE_URL}/period2`);
                searchParams.forEach((v, k) => url.searchParams.set(k, v));
                url.searchParams.set('serviceKey', API_KEY);
                targetUrl = url.toString();
            } else {
                // Detail API (relativePath starts with /)
                const id = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
                const url = new URL(`${BASE_URL}/detail2`);
                url.searchParams.append('serviceKey', API_KEY);
                url.searchParams.append('seq', id);
                targetUrl = url.toString();
            }

            console.log(`[Middleware] Fetching from API: ${targetUrl}`);

            try {
                const response = await fetch(targetUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': '*/*',
                    },
                    cache: 'no-store'
                });

                const data = await response.text();

                if (!response.ok) {
                    console.error(`[Middleware] API Error: ${response.status} - ${data.substring(0, 100)}`);
                } else {
                    console.log(`[Middleware] API Success snippet: ${data.substring(0, 100)}...`);
                }

                return new NextResponse(data, {
                    status: response.status,
                    headers: {
                        'Content-Type': 'application/xml; charset=utf-8',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            } catch (error) {
                console.error('[Middleware] Proxy Fetch Failed:', error);
                return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
            }
        } else if (pathname.startsWith('/naver-api')) {
            console.log(`[Middleware] Naver Proxy active for: ${pathname}`);

            const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || '';
            const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || '';

            const searchType = searchParams.get('type') || 'blog';
            const apiEndpoint = searchType === 'webkr' ? 'webkr' : 'blog';
            const url = new URL(`https://openapi.naver.com/v1/search/${apiEndpoint}.json`);
            
            searchParams.forEach((v, k) => {
                if (k !== 'type') url.searchParams.set(k, v);
            });

            try {
                const response = await fetch(url.toString(), {
                    headers: {
                        'X-Naver-Client-Id': NAVER_CLIENT_ID,
                        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
                    },
                    cache: 'no-store'
                });

                const text = await response.text();

                let data: unknown;
                try {
                    data = JSON.parse(text);
                } catch {
                    console.error('[Middleware] Naver API returned non-JSON:', text.substring(0, 200));
                    return NextResponse.json({ error: 'Naver API error', items: [] }, { status: response.status });
                }

                return NextResponse.json(data, {
                    status: response.status,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            } catch (error) {
                console.error('[Middleware] Naver Proxy Fetch Failed:', error);
                return NextResponse.json({ error: 'Naver Proxy failed', items: [] }, { status: 500 });
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/api/culture', '/api/culture/:path*', '/naver-api'],
};
