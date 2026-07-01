<?php

namespace App\Http\Controllers;

use App\Http\Requests\ScopeInitiateRequest;
use App\Services\FastApiService;
use App\Services\SseStreamService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ScopeController extends Controller
{
    public function initiate(ScopeInitiateRequest $request): JsonResponse
    {
        $sessionId = (string) Str::uuid();
        $payload = $request->validated();

        Cache::put($this->cacheKey($sessionId), $payload, now()->addHour());

        return response()->json([
            'sessionId' => $sessionId,
            'streamUrl' => url("/api/scope/stream/{$sessionId}"),
        ]);
    }

    public function stream(
        Request $request,
        string $sessionId,
        SseStreamService $sse,
        FastApiService $fastApi,
    ) {
        $payload = Cache::get($this->cacheKey($sessionId));

        if (! is_array($payload)) {
            return response()->json(['message' => 'Session not found or expired.'], 404);
        }

        return $sse->stream(function (callable $send) use ($fastApi, $payload) {
            $send(['type' => 'step_start', 'step' => 0, 'section' => 'init', 'content' => 'Starting…']);

            try {
                $fastApi->streamChain($payload, function (array $event) use ($send) {
                    $send($event);
                });
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('Stream chain failed', ['exception' => $e]);
                $send(['type' => 'error', 'message' => 'An internal server error occurred while streaming.']);
            }
        });
    }

    private function cacheKey(string $sessionId): string
    {
        return "scope_session:{$sessionId}";
    }
}

