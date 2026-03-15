<?php
/**
 * Simple CORS Proxy for Art Finder API
 * Place this file in your Cafe24 hosting (/artfinder/proxy.php)
 */

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the target URL from query parameter
$path = isset($_GET['path']) ? $_GET['path'] : '';

if (empty($path)) {
    http_response_code(400);
    echo 'Error: Missing path parameter';
    exit();
}

// ─── 서버사이드 API 키 ─── 클라이언트가 전달한 serviceKey는 무시
$API_KEY = 'zE4YazSHyZ8cuyyEt/rxOg+Z8VhizXlJZUooFZC9xLEtIkMwQOX48QOvP+fXYGErE320897RAG+AEBwxNvw9Xg==';

// 허용된 path 목록 (Path traversal 방지)
$allowedPaths = ['/period2', '/detail2'];
if (!in_array($path, $allowedPaths, true)) {
    http_response_code(400);
    echo 'Error: Invalid path';
    exit();
}

// Build the full API URL
$baseUrl = 'https://apis.data.go.kr/B553457/cultureinfo';
$fullUrl = $baseUrl . $path;

// 클라이언트 파라미터 복사 (path, serviceKey 제외 — 키는 서버에서만 주입)
$queryParams = $_GET;
unset($queryParams['path']);
unset($queryParams['serviceKey']); // 클라이언트 공급 키 무시 (보안)

// 서버에서 API 키 주입
$queryParams['serviceKey'] = $API_KEY;

$fullUrl .= '?' . http_build_query($queryParams);

// Make the request to API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $fullUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

// Set headers
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Check for errors
if ($error) {
    http_response_code(500);
    echo 'Error: ' . $error;
    exit();
}

// Return the response
http_response_code($httpCode);
// The API returns XML usually
header('Content-Type: application/xml; charset=utf-8');
echo $response;
?>
