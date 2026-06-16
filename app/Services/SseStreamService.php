<?php

namespace App\Services;

use Symfony\Component\HttpFoundation\StreamedResponse;

class SseStreamService
{
    /**
     * @param  callable  $writer  function(callable $send): void
     */
    public function stream(callable $writer): StreamedResponse
    {
        return response()->stream(function () use ($writer) {
            @ini_set('zlib.output_compression', '0');
            @ini_set('output_buffering', 'off');

            $send = function (array $payload): void {
                echo 'data: '.json_encode($payload, JSON_UNESCAPED_SLASHES)."\n\n";
                if (function_exists('ob_flush')) {
                    @ob_flush();
                }
                @flush();
            };

            $writer($send);
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-transform',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}

