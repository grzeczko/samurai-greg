<?php

declare(strict_types=1);

$backendPublicIndex = dirname(__DIR__, 3).'/backend/public/index.php';

if (!is_file($backendPublicIndex)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Laravel backend entrypoint is not available.',
    ]);
    exit;
}

require $backendPublicIndex;