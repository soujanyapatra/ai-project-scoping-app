<?php

// Manually define SCRIPT_NAME to prevent Symfony/Laravel from stripping the /api prefix
$_SERVER['SCRIPT_NAME'] = '/index.php';

// Forward requests to the main public/index.php entry point
require __DIR__ . '/../public/index.php';
