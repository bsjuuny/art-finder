<?php
/**
 * Naver Search API Proxy for KOPIS / Art Finder
 * Place this file in your Cafe24 hosting (/artfinder/naver_proxy.php)
 */

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// -------------------------------------------------------------
// [중요] 네이버 API 키는 naver_proxy_config.php(git 제외, prebuild 가 .env 에서 생성)에 있다.
// 서버 환경변수 NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 가 있으면 그쪽을 먼저 쓴다(2026-10-07).
// -------------------------------------------------------------
$__configFile = __DIR__ . '/naver_proxy_config.php';
if (file_exists($__configFile)) {
    require $__configFile;
}
$CLIENT_ID = getenv('NAVER_CLIENT_ID') ?: (defined('NAVER_CLIENT_ID') ? NAVER_CLIENT_ID : '');
$CLIENT_SECRET = getenv('NAVER_CLIENT_SECRET') ?: (defined('NAVER_CLIENT_SECRET') ? NAVER_CLIENT_SECRET : '');

if (empty($CLIENT_ID) || empty($CLIENT_SECRET)) {
    http_response_code(500);
    echo json_encode(['error' => 'Naver API credentials are not configured', 'items' => []]);
    exit();
}

$query   = isset($_GET['query'])   ? $_GET['query']        : '';
$display = isset($_GET['display']) ? (int) $_GET['display'] : 10;
$sort    = isset($_GET['sort'])    ? $_GET['sort']          : 'sim';
$type    = isset($_GET['type'])    ? $_GET['type']          : 'blog';

if (empty($query)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing query parameter', 'items' => []]);
    exit();
}

$allowedTypes = ['blog', 'webkr'];
if (!in_array($type, $allowedTypes, true)) {
    $type = 'blog';
}

// Build the full Naver API URL
$baseUrl = 'https://openapi.naver.com/v1/search/' . $type . '.json';
$params  = ['query' => $query, 'display' => $display];
if ($type === 'blog') {
    $params['sort'] = $sort;
}
$fullUrl = $baseUrl . '?' . http_build_query($params);

// Make the request to Naver API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $fullUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

// Set Naver specific headers
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'X-Naver-Client-Id: ' . $CLIENT_ID,
    'X-Naver-Client-Secret: ' . $CLIENT_SECRET
));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Check for errors
if ($error) {
    http_response_code(500);
    echo json_encode(['error' => $error]);
    exit();
}

// Return the response as JSON
http_response_code($httpCode);
header('Content-Type: application/json; charset=utf-8');
echo $response;
?>