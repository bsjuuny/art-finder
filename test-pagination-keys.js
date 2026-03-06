
const API_KEY = 'zE4YazSHyZ8cuyyEt/rxOg+Z8VhizXlJZUooFZC9xLEtIkMwQOX48QOvP+fXYGErE320897RAG+AEBwxNvw9Xg==';
const BASE_URL = 'https://apis.data.go.kr/B553457/cultureinfo/period2';

async function testPagination(pageKey, pageVal1, pageVal2) {
    console.log(`\n--- Testing ${pageKey} ---`);

    // Page 1
    const params1 = new URLSearchParams();
    params1.append('serviceKey', API_KEY);
    params1.append(pageKey, pageVal1);
    params1.append('numOfrows', '5'); // We know this works
    params1.append('from', '20260101');
    params1.append('to', '20261231');

    const res1 = await fetch(`${BASE_URL}?${params1.toString()}`);
    const text1 = await res1.text();
    const match1 = text1.match(/<seq>(\d+)<\/seq>/g);
    const firstSeq1 = match1 ? match1[0] : 'None';

    // Page 2
    const params2 = new URLSearchParams();
    params2.append('serviceKey', API_KEY);
    params2.append(pageKey, pageVal2);
    params2.append('numOfrows', '5');
    params2.append('from', '20260101');
    params2.append('to', '20261231');

    const res2 = await fetch(`${BASE_URL}?${params2.toString()}`);
    const text2 = await res2.text();
    const match2 = text2.match(/<seq>(\d+)<\/seq>/g);
    const firstSeq2 = match2 ? match2[0] : 'None';

    console.log(`Page 1 First Seq: ${firstSeq1}`);
    console.log(`Page 2 First Seq: ${firstSeq2}`);

    if (firstSeq1 === firstSeq2) {
        console.log(`FAIL: ${pageKey} is likely ignored.`);
    } else {
        console.log(`SUCCESS: ${pageKey} works correctly!`);
    }
}

async function run() {
    await testPagination('pageNo', '1', '2'); // lowercase
    await testPagination('PageNo', '1', '2'); // Capital P
    await testPagination('page_no', '1', '2'); // Snake case
    await testPagination('cPage', '1', '2'); // Another standard
}

run();
