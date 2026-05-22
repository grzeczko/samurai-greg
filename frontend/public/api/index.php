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

$originalRequestUri = $_SERVER['REQUEST_URI'] ?? '/api';
$originalQueryString = $_SERVER['QUERY_STRING'] ?? '';

$_SERVER['SCRIPT_FILENAME'] = $backendPublicIndex;
$_SERVER['SCRIPT_NAME'] = '/api/index.php';
$_SERVER['PHP_SELF'] = '/api/index.php';
$_SERVER['DOCUMENT_ROOT'] = $publicRoot;
$_SERVER['REQUEST_URI'] = $originalRequestUri;
$_SERVER['QUERY_STRING'] = $originalQueryString;

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