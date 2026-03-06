
const API_KEY = 'zE4YazSHyZ8cuyyEt/rxOg+Z8VhizXlJZUooFZC9xLEtIkMwQOX48QOvP+fXYGErE320897RAG+AEBwxNvw9Xg==';
const BASE_URL = 'http://apis.data.go.kr/B553457/cultureinfo/period2';

async function testParams(pageKey, rowsKey) {
    const params = new URLSearchParams();
    params.append('serviceKey', API_KEY); // native fetch will encode this
    params.append(pageKey, '1');
    params.append(rowsKey, '10');
    params.append('from', '20240401');
    params.append('to', '20240430');

    console.log(`\nTesting with ${pageKey}, ${rowsKey}`);
    const url = `${BASE_URL}?${params.toString()}`;
    console.log(`URL: ${url}`);

    try {
        const response = await fetch(url);
        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log(`Response snippet: ${text.substring(0, 300)}`);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function run() {
    await testParams('pageNo', 'numOfRows'); // Common standard
    await testParams('PageNo', 'numOfRows'); // Used in some parts
    await testParams('pageNo', 'numOfrows'); // Another possibility
}

run();
