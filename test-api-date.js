
const API_KEY = 'zE4YazSHyZ8cuyyEt/rxOg+Z8VhizXlJZUooFZC9xLEtIkMwQOX48QOvP+fXYGErE320897RAG+AEBwxNvw9Xg==';
const BASE_URL = 'http://apis.data.go.kr/B553457/cultureinfo/period2';

async function testDate() {
    const params = new URLSearchParams();
    params.append('serviceKey', API_KEY);
    params.append('PageNo', '1');
    params.append('numOfRows', '10');
    // Test 2026
    params.append('from', '20260215');
    params.append('to', '20270215');

    const url = `${BASE_URL}?${params.toString()}`;
    console.log(`Testing 2026: ${url}`);

    try {
        const response = await fetch(url);
        const text = await response.text();
        console.log(`Response snippet: ${text.substring(0, 300)}`);
    } catch (e) { console.error(e); }
}

testDate();
