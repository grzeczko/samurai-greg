<?php

return [
    'limit' => (int) env('HIGH_SCORE_LIMIT', 25),
    'min_time_ms' => (int) env('HIGH_SCORE_MIN_TIME_MS', 30000),
    'max_time_ms' => env('HIGH_SCORE_MAX_TIME_MS') !== null
        ? (int) env('HIGH_SCORE_MAX_TIME_MS')
        : null,
    'run_session_ttl_seconds' => (int) env('HIGH_SCORE_RUN_SESSION_TTL_SECONDS', 3600),
];
