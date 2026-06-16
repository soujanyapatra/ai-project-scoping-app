<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;

class FastApiService
{
    public function __construct(
        private readonly Client $client = new Client(),
    ) {
    }

    /**
     * Streams events from the FastAPI chain runner (or mock mode).
     *
     * @param  array  $payload
     * @param  callable  $emit  function(array $event): void
     */
    public function streamChain(array $payload, callable $emit): void
    {
        if (config('fastapi.mock')) {
            $this->mockStream($payload, $emit);
            return;
        }

        $baseUrl = rtrim((string) config('fastapi.base_url'), '/');
        $runPath = (string) config('fastapi.run_path');
        $timeoutSeconds = (int) config('fastapi.timeout_seconds');

        try {
            $response = $this->client->request('POST', $baseUrl.$runPath, [
                'headers' => [
                    'Accept' => 'text/event-stream, application/json',
                    'Content-Type' => 'application/json',
                ],
                'json' => $payload,
                'stream' => true,
                'timeout' => $timeoutSeconds,
                'read_timeout' => $timeoutSeconds,
            ]);

            $body = $response->getBody();
            $buffer = '';

            while (! $body->eof()) {
                $buffer .= $body->read(4096);

                while (($pos = strpos($buffer, "\n\n")) !== false) {
                    $rawEvent = substr($buffer, 0, $pos);
                    $buffer = substr($buffer, $pos + 2);

                    $dataLines = [];
                    foreach (preg_split("/\r?\n/", $rawEvent) as $line) {
                        if (str_starts_with($line, 'data:')) {
                            $dataLines[] = trim(substr($line, 5));
                        }
                    }

                    if (count($dataLines) === 0) {
                        continue;
                    }

                    $data = implode("\n", $dataLines);
                    $decoded = json_decode($data, true);

                    if (is_array($decoded)) {
                        $emit($decoded);
                    } else {
                        $emit(['type' => 'section', 'step' => 3, 'section' => 'output', 'content' => $data]);
                    }
                }
            }
        } catch (GuzzleException $e) {
            Log::warning('FastAPI request failed', ['message' => $e->getMessage()]);
            $emit(['type' => 'error', 'message' => 'FastAPI unavailable.']);
        }
    }

    /**
     * Mocked 3-step stream until the Python repo exists.
     */
    private function mockStream(array $payload, callable $emit): void
    {
        $projectType = (string) ($payload['projectType'] ?? 'unknown');
        $industry = (string) ($payload['industry'] ?? 'unknown');
        $budget = $payload['budgetUsd'] ?? null;
        $features = is_array($payload['features'] ?? null) ? $payload['features'] : [];

        $emit(['type' => 'step_start', 'step' => 1]);
        usleep(150_000);
        $emit([
            'type' => 'section',
            'step' => 1,
            'section' => 'Complexity classification',
            'content' => "Project type: {$projectType}\nIndustry: {$industry}\nBudget: ".($budget ?? 'n/a')."\n\nClassification: Medium\nRationale: Multi-surface build with integrations and a defined timeline.",
        ]);

        usleep(200_000);
        $emit(['type' => 'step_start', 'step' => 2]);
        usleep(150_000);
        $emit([
            'type' => 'section',
            'step' => 2,
            'section' => 'Feature risks',
            'content' => "Top risks:\n- Scope creep across features (".count($features)." listed)\n- Integration unknowns\n- Timeline compression\n\nMitigations:\n- Lock MVP deliverables\n- Spike integrations early\n- Phase rollout",
        ]);

        usleep(200_000);
        $emit(['type' => 'step_start', 'step' => 3]);
        usleep(150_000);
        $emit([
            'type' => 'section',
            'step' => 3,
            'section' => 'Scope document',
            'content' => "## Deliverables\n- Discovery + scope sign-off\n- UI implementation\n- Backend API gateway\n\n## Suggested stack\n- Vue 3 + PrimeVue + Pinia\n- Laravel API + SSE\n- FastAPI + LangChain (next repo)\n\n## Timeline (example)\n- Week 1: Discovery + wireframes + API contract\n- Week 2-3: MVP build\n- Week 4: Hardening + handover\n\n## Out of scope\n- Custom ML model training\n- Non-essential integrations",
        ]);

        usleep(100_000);
        $emit(['type' => 'done']);
    }
}

