<?php

return [
    'base_url' => env('FASTAPI_BASE_URL', 'http://127.0.0.1:9000'),
    'run_path' => env('FASTAPI_RUN_PATH', '/api/v1/scope'),
    'mock' => env('FASTAPI_MOCK', false),
    'timeout_seconds' => (int) env('FASTAPI_TIMEOUT_SECONDS', 120),
];


