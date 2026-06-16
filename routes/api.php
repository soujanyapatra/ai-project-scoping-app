<?php

use App\Http\Controllers\ScopeController;
use Illuminate\Support\Facades\Route;

Route::post('/scope', [ScopeController::class, 'initiate']);
Route::get('/scope/stream/{sessionId}', [ScopeController::class, 'stream']);

