
const API_KEY = 'zE4YazSHyZ8cuyyEt/rxOg+Z8VhizXlJZUooFZC9xLEtIkMwQOX48QOvP+fXYGErE320897RAG+AEBwxNvw9Xg==';
const BASE_URL = 'http://apis.data.go.kr/B553457/cultureinfo/period2';

async function testNoDate() {
    const params = new URLSearchParams();
    params.append('serviceKey', API_KEY);
    params.append('pageNo', '1');
    params.append('numOfRows', '10');

    const url = `${BASE_URL}?${params.toString()}`;
    console.log(`Testing No Date: ${url}`);

    try {
        const response = await fetch(url);
        const text = await response.text();
        console.log(`Status: ${response.status}`);
        console.log(`Response snippet: ${text.substring(0, 300)}`);
    } catch (e) { console.error(e); }
}

testNoDate();
