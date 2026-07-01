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

        if (config('fastapi.mock')) {
            return response()->json([
                'sessionId' => $sessionId,
                'streamUrl' => url("/api/scope/stream/{$sessionId}"),
            ]);
        }

        try {
            $baseUrl = rtrim((string) config('fastapi.base_url'), '/');
            $client = new \GuzzleHttp\Client();
            $client->request('POST', $baseUrl . '/api/v1/scope/initiate', [
                'json' => [
                    'session_id' => $sessionId,
                    'payload' => $payload,
                ],
                'timeout' => 4.0,
            ]);

            return response()->json([
                'sessionId' => $sessionId,
                'streamUrl' => $baseUrl . "/api/v1/scope/stream/{$sessionId}",
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('FastAPI session initiate failed. Falling back to local proxy.', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'sessionId' => $sessionId,
                'streamUrl' => url("/api/scope/stream/{$sessionId}"),
            ]);
        }
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

