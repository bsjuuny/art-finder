
const API_KEY = 'zE4YazSHyZ8cuyyEt/rxOg+Z8VhizXlJZUooFZC9xLEtIkMwQOX48QOvP+fXYGErE320897RAG+AEBwxNvw9Xg==';
const BASE_URL = 'https://apis.data.go.kr/B553457/cultureinfo/period2';

async function testPagination() {
    console.log('--- Testing Page 1 ---');
    const params1 = new URLSearchParams();
    params1.append('serviceKey', API_KEY);
    params1.append('pageNo', '1'); // Lowercase p
    params1.append('numOfrows', '5'); // Lowercase r
    // 2026 data
    params1.append('from', '20260101');
    params1.append('to', '20261231');

    const url1 = `${BASE_URL}?${params1.toString()}`;
    const res1 = await fetch(url1);
    const text1 = await res1.text();
    const match1 = text1.match(/<seq>(\d+)<\/seq>/g);
    console.log('Page 1 Seqs:', match1 ? match1.slice(0, 3) : 'None');

    console.log('\n--- Testing Page 2 ---');
    const params2 = new URLSearchParams();
    params2.append('serviceKey', API_KEY);
    params2.append('pageNo', '2'); // Lowercase p
    params2.append('numOfrows', '5'); // Lowercase r
    params2.append('from', '20260101');
    params2.append('to', '20261231');

    const url2 = `${BASE_URL}?${params2.toString()}`;
    const res2 = await fetch(url2);
    const text2 = await res2.text();
    const match2 = text2.match(/<seq>(\d+)<\/seq>/g);
    console.log('Page 2 Seqs:', match2 ? match2.slice(0, 3) : 'None');

    if (match1 && match2 && match1[0] === match2[0]) {
        console.log('\nFAIL: Page 1 and Page 2 are IDENTICAL. Pagination is broken with these parameters.');
    } else {
        console.log('\nSUCCESS: Page 1 and Page 2 are DIFFERENT.');
    }

    // Test with Capital P if failed
    if (match1 && match2 && match1[0] === match2[0]) {
        console.log('\n--- Retrying with Capital PageNo ---');
        // ... implementation for retest ...
    }
}

testPagination();
