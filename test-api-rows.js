
const API_KEY = 'zE4YazSHyZ8cuyyEt/rxOg+Z8VhizXlJZUooFZC9xLEtIkMwQOX48QOvP+fXYGErE320897RAG+AEBwxNvw9Xg==';
const BASE_URL = 'https://apis.data.go.kr/B553457/cultureinfo/period2';

async function testRows(paramName, value) {
    const params = new URLSearchParams();
    params.append('serviceKey', API_KEY);
    params.append('pageNo', '1');
    params.append(paramName, value);
    // Add date to ensure data exists
    params.append('from', '20250101');
    params.append('to', '20251231');

    const url = `${BASE_URL}?${params.toString()}`;
    console.log(`Testing ${paramName}=${value}: ${url}`);

    try {
        const response = await fetch(url);
        const text = await response.text();

        // Extract numOfRows from XML response to verify
        const match = text.match(/<numOfrows>(\d+)<\/numOfrows>/i) || text.match(/<numOfRows>(\d+)<\/numOfRows>/i);
        const returnedRows = match ? match[1] : 'Unknown';

        console.log(`Status: ${response.status}, Returned Rows in XML: ${returnedRows}`);
    } catch (e) { console.error(e); }
}

async function run() {
    await testRows('numOfRows', '20');
    await testRows('numOfrows', '20'); // Lowercase r
    await testRows('rows', '20');
    await testRows('NumOfRows', '20');
}

run();
