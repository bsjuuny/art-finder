
const API_KEY = 'zE4YazSHyZ8cuyyEt/rxOg+Z8VhizXlJZUooFZC9xLEtIkMwQOX48QOvP+fXYGErE320897RAG+AEBwxNvw9Xg==';
const BASE_URL = 'https://apis.data.go.kr/B553457/cultureinfo/detail';

async function testDetail() {
    const params = new URLSearchParams();
    params.append('serviceKey', API_KEY);
    params.append('seq', '246265');

    const url = `${BASE_URL}?${params.toString()}`;
    console.log(`Testing Detail: ${url}`);

    try {
        const response = await fetch(url);
        const text = await response.text();
        console.log(`Status: ${response.status}`);
        console.log(`Response: ${text.substring(0, 500)}`);
    } catch (e) { console.error(e); }
}

testDetail();
