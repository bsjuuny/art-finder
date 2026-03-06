
const API_KEY = 'zE4YazSHyZ8cuyyEt/rxOg+Z8VhizXlJZUooFZC9xLEtIkMwQOX48QOvP+fXYGErE320897RAG+AEBwxNvw9Xg==';
const BASE_URL = 'https://apis.data.go.kr/B553457/cultureinfo';

async function test(name) {
    const params = new URLSearchParams();
    params.append('serviceKey', API_KEY);
    params.append('seq', '246265');
    const url = `${BASE_URL}/${name}?${params.toString()}`;
    console.log(`Testing ${name}: ${url}`);
    try {
        const response = await fetch(url);
        const text = await response.text();
        console.log(`Status: ${response.status}`);
        if (response.ok) {
            console.log(`Result: ${text.substring(0, 200)}`);
        }
    } catch (e) { }
}

async function run() {
    await test('detail');
    await test('detail2');
    await test('perforInfo');
    await test('d_perforInfo');
}
run();
