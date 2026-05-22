<?php

declare(strict_types=1);

$publicRoot = dirname(__DIR__);
$candidateBackendIndexes = [
    dirname(__DIR__, 2).'/backend/public/index.php',
    dirname(__DIR__, 3).'/backend/public/index.php',
];

$backendPublicIndex = null;

foreach ($candidateBackendIndexes as $candidateBackendIndex) {
    if (is_file($candidateBackendIndex)) {
        $backendPublicIndex = $candidateBackendIndex;
        break;
    }
}

if ($backendPublicIndex === null) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Laravel backend entrypoint is not available.',
    ]);
    exit;
}

$apiPath = (string) ($_GET['__api_path'] ?? '');
$originalQueryString = $_SERVER['QUERY_STRING'] ?? '';

parse_str($originalQueryString, $queryParameters);
unset($queryParameters['__api_path']);

$rebuiltQueryString = http_build_query($queryParameters);
$originalRequestUri = '/api'.$apiPath;

if ($rebuiltQueryString !== '') {
    $originalRequestUri .= '?'.$rebuiltQueryString;
}

$_SERVER['SCRIPT_FILENAME'] = $backendPublicIndex;
$_SERVER['SCRIPT_NAME'] = '/api/index.php';
$_SERVER['PHP_SELF'] = '/api/index.php';
$_SERVER['DOCUMENT_ROOT'] = $publicRoot;
$_SERVER['REQUEST_URI'] = $originalRequestUri;
$_SERVER['QUERY_STRING'] = $rebuiltQueryString;

unset($_GET['__api_path']);

chdir(dirname($backendPublicIndex));

try {
    require $backendPublicIndex;
} catch (Throwable $exception) {
    error_log('[public api bridge] '.$exception->getMessage().' in '.$exception->getFile().':'.$exception->getLine());

    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json');
    }

    echo json_encode([
        'success' => false,
        'message' => 'Laravel failed to boot from the public API bridge.',
    ]);
}