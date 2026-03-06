import { CultureEvent } from '@/types';
import convert from 'xml-js';

const { xml2js } = convert;

// API Constants
const API_KEY = process.env.NEXT_PUBLIC_CULTURE_API_KEY || '';
if (!API_KEY) {
    console.warn('API Key is missing. Make sure NEXT_PUBLIC_CULTURE_API_KEY is set in .env');
}

// Development uses Next.js Middleware rewrite
// Production (static) uses PHP proxy
const IS_DEV = process.env.NODE_ENV === 'development';
const PROXY_URL = '/artfinder/proxy.php'; // Adjust path if deployed elsewhere

interface XmlResponse {
    response?: {
        header?: {
            resultCode?: { _text?: string };
            resultMsg?: { _text?: string };
        };
        body?: {
            items?: {
                item?: any;
            };
            totalCount?: { _text?: string } | number;
            [key: string]: any;
        };
        msgBody?: {
            perforInfo?: any;
            [key: string]: any;
        };
    };
}

/**
 * Fetches culture events from the API.
 * In development, it calls the local Next.js Middleware rewrite.
 * In production, it calls the PHP proxy on the server.
 */
export const fetchCultureEvents = async (params: {
    pageNo?: string;
    numOfRows?: string;
    keyword?: string;
    serviceTp?: string;
    from?: string; // YYYYMMDD
    to?: string;   // YYYYMMDD
}, signal?: AbortSignal): Promise<{ events: CultureEvent[], totalCount: number }> => {
    try {
        let url = '';
        const queryParams = new URLSearchParams();
        // Capitalized 'PageNo' as required by some endpoints of this API
        queryParams.append('PageNo', params.pageNo || '1');
        queryParams.append('numOfrows', params.numOfRows || '20');
        if (params.keyword) queryParams.append('keyword', params.keyword);
        if (params.serviceTp) queryParams.append('serviceTp', params.serviceTp);

        if (params.from) {
            queryParams.append('from', params.from);
        } else {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            queryParams.append('from', `${year}${month}${day}`);
        }

        if (params.to) {
            queryParams.append('to', params.to);
        } else {
            const today = new Date();
            const nextYear = new Date(today);
            nextYear.setFullYear(today.getFullYear() + 1);

            const year = nextYear.getFullYear();
            const month = String(nextYear.getMonth() + 1).padStart(2, '0');
            const day = String(nextYear.getDate()).padStart(2, '0');
            queryParams.append('to', `${year}${month}${day}`);
        }

        // DEV: Use Next.js Middleware rewrite (returns XML)
        if (IS_DEV) {
            // Added trailing slash to match next.config.ts trailingSlash: true
            url = `/artfinder/api/culture/?${queryParams.toString()}`;
        } else {
            // PROD: Use PHP Proxy
            const targetPath = '/period2';
            // Important: Decode API Key first because URLSearchParams will encode it.
            // If API_KEY is already encoded (e.g. contains %), decoding it first ensures
            // URLSearchParams re-encodes it back to the original string.
            // Then PHP receives the original string (decoded by $_GET) and re-encodes it (http_build_query)
            // resulting in the correct key sent to API.
            queryParams.append('serviceKey', decodeURIComponent(API_KEY));
            url = `${PROXY_URL}?path=${targetPath}&${queryParams.toString()}`;
        }

        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const xmlText = await response.text();
        const json = xml2js(xmlText, { compact: true }) as XmlResponse;

        const body = json.response?.body || json.response?.msgBody;
        if (!body) return { events: [], totalCount: 0 };

        const totalCountVal = body.totalCount;
        const totalCountRaw = (typeof totalCountVal === 'object' && totalCountVal !== null && '_text' in totalCountVal)
            ? totalCountVal._text
            : totalCountVal;

        const totalCount = Number(totalCountRaw || 0);

        const items = body.items?.item || body.perforInfo;

        if (!items) return { events: [], totalCount };

        const list = Array.isArray(items) ? items : [items];

        // Helper to safely extract text from XML-JSON object
        const getText = (val: any) => {
            if (val === null || val === undefined) return '';
            if (typeof val === 'string' || typeof val === 'number') return String(val);
            if (val._text) return val._text;
            if (val._cdata) return val._cdata;
            return ''; // Handle empty objects {} or other structures by returning empty string
        };

        // Normalize data structure
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const events = list.map((item: any) => ({
            seq: getText(item.seq),
            title: getText(item.title),
            startDate: getText(item.startDate),
            endDate: getText(item.endDate),
            place: getText(item.place),
            realmName: getText(item.realmName),
            area: getText(item.area),
            sigungu: getText(item.sigungu),
            thumbnail: getText(item.thumbnail),
            gpsX: getText(item.gpsX),
            gpsY: getText(item.gpsY),
            url: getText(item.url),
        }));

        return { events, totalCount };

    } catch (error) {
        console.error('Fetch Events Error:', error);
        return { events: [], totalCount: 0 };
    }
};

/**
 * Fetches culture event detail from the API.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchCultureEventDetail = async (id: string): Promise<any> => {
    try {
        let url = '';

        // DEV: Use Next.js Middleware rewrite (returns XML)
        if (IS_DEV) {
            url = `/artfinder/api/culture/${id}/`;
        } else {
            const queryParams = new URLSearchParams({
                serviceKey: API_KEY,
                seq: id,
            });
            url = `${PROXY_URL}?path=/detail2&${queryParams.toString()}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const xmlText = await response.text();
        const json = xml2js(xmlText, { compact: true }) as XmlResponse;

        const body = json.response?.msgBody?.perforInfo || json.response?.body?.items?.item;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getText = (obj: any, key: string) => {
            const val = obj?.[key];
            if (val === null || val === undefined) return '';
            if (typeof val === 'string' || typeof val === 'number') return String(val);
            if (val._text !== undefined) return val._text;
            if (val._cdata !== undefined) return val._cdata;
            // Handle empty objects produced by xml-js for empty tags
            if (typeof val === 'object' && Object.keys(val).length === 0) return '';
            return val;
        };

        if (!body) return null;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const flat: any = {};
        Object.keys(body).forEach(key => {
            flat[key] = getText(body, key);
        });

        return flat;

    } catch (error) {
        console.error('Fetch Event Detail Error:', error);
        return null;
    }
};
