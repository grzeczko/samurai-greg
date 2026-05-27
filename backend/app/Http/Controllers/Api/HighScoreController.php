<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HighScore;
use App\Models\HighScoreRunSession;
use App\Http\Requests\StoreHighScoreRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class HighScoreController extends Controller
{
    public function createSession(): JsonResponse
    {
        $plainToken = Str::random(64);
        $session = HighScoreRunSession::query()->create([
            'public_id' => (string) Str::uuid(),
            'token_hash' => hash_hmac('sha256', $plainToken, (string) config('app.key')),
            'status' => 'active',
            'started_at' => now(),
            'expires_at' => now()->addSeconds(max(300, (int) config('high_scores.run_session_ttl_seconds', 3600))),
            'last_seen_at' => now(),
            'ip_hash' => $this->hashNullable(request()->ip()),
            'user_agent_hash' => $this->hashNullable(request()->userAgent()),
        ]);

        return response()->json([
            'success' => true,
            'session_id' => $session->public_id,
            'submission_token' => $plainToken,
            'expires_at' => $session->expires_at?->toIso8601String(),
        ], 201);
    }


    public function updateSessionProgress(Request $request, string $publicId): JsonResponse
    {
        $validated = $request->validate([
            'submission_token' => ['required', 'string', 'min:32', 'max:255'],
            'event_type' => ['required', 'in:codex_collected,player_died,boss_defeated'],
            'codexes_collected' => ['nullable', 'integer', 'min:0', 'max:65535'],
            'total_codexes' => ['nullable', 'integer', 'min:0', 'max:65535'],
            'death_count' => ['nullable', 'integer', 'min:0', 'max:65535'],
        ]);

        $session = $this->resolveRunSession($publicId, (string) $validated['submission_token'], $request);

        if (! $session) {
            return response()->json([
                'success' => false,
                'message' => 'The run session could not be verified.',
            ], 422);
        }

        if ((int) $session->submission_attempts > 0 || $session->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This run session is no longer active.',
            ], 409);
        }

        $eventType = (string) $validated['event_type'];

        if ($eventType === 'codex_collected') {
            $session->codexes_collected = max(
                (int) $session->codexes_collected,
                (int) ($validated['codexes_collected'] ?? ((int) $session->codexes_collected + 1))
            );
            $session->total_codexes = max((int) $session->total_codexes, (int) ($validated['total_codexes'] ?? 0));
        }

        if ($eventType === 'player_died') {
            $session->death_count = max(
                (int) $session->death_count,
                (int) ($validated['death_count'] ?? ((int) $session->death_count + 1))
            );
        }

        if ($eventType === 'boss_defeated') {
            $session->boss_defeated_at = now();
            $session->codexes_collected = max((int) $session->codexes_collected, (int) ($validated['codexes_collected'] ?? 0));
            $session->total_codexes = max((int) $session->total_codexes, (int) ($validated['total_codexes'] ?? 0));
        }

        $session->last_seen_at = now();
        $session->save();

        return response()->json([
            'success' => true,
        ]);
    }

    public function index(): JsonResponse
    {
        $limit = $this->leaderboardLimit();
        $scores = $this->topScores($limit);

        return response()->json([
            'success' => true,
            'scores' => $this->withPlaceholderRows($scores, $limit),
        ]);
    }

    public function store(StoreHighScoreRequest $request): JsonResponse
    {
        $limit = $this->leaderboardLimit();
        $payload = $request->payload();
        $session = $this->resolveRunSession(
            (string) $payload['session_id'],
            (string) $payload['submission_token'],
            $request,
        );

        if (! $session) {
            return response()->json([
                'success' => false,
                'message' => 'The run session could not be verified.',
            ], 422);
        }

        if ((int) $session->submission_attempts > 0 || $session->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This run session has already been used.',
            ], 409);
        }

        $completionTimeMs = (int) $payload['completion_time_ms'];

        if (! $session->boss_defeated_at) {
            return response()->json([
                'success' => false,
                'message' => 'The run must defeat the boss before entering the Hall of Fame.',
            ], 422);
        }

        $sessionCodexesCollected = (int) $session->codexes_collected;
        $sessionTotalCodexes = (int) $session->total_codexes;

        if ($sessionTotalCodexes < 1 || $sessionCodexesCollected < $sessionTotalCodexes) {
            return response()->json([
                'success' => false,
                'message' => 'The run must collect every codex before it can be verified.',
            ], 422);
        }

        if ((int) $payload['codexes_collected'] !== $sessionCodexesCollected || (int) $payload['total_codexes'] !== $sessionTotalCodexes) {
            return response()->json([
                'success' => false,
                'message' => 'The submitted run details did not match the verified session.',
            ], 422);
        }

        if (array_key_exists('death_count', $payload) && $payload['death_count'] !== null && (int) $payload['death_count'] !== (int) $session->death_count) {
            return response()->json([
                'success' => false,
                'message' => 'The submitted death count did not match the verified session.',
            ], 422);
        }

        $accepted = DB::transaction(function () use ($request, $payload, $completionTimeMs, $limit) {
            $cutoff = $this->cutoffScore($limit);
            $scoreCount = HighScore::query()->count();
            $qualifies = $scoreCount < $limit
                || $cutoff === null
                || $completionTimeMs < $cutoff->completion_time_ms;

            if (! $qualifies) {
                return null;
            }

            $score = HighScore::query()->create([
                ...$payload,
                'completion_time_display' => $this->formatCompletionTime($completionTimeMs),
                'completed_at' => now(),
                'user_agent_hash' => $this->hashNullable($request->userAgent()),
                'ip_hash' => $this->hashNullable($request->ip()),
                'is_verified' => true,
                'is_flagged' => false,
            ]);

            return [
                'score' => $score,
                'rank' => $this->rankForScore($score),
            ];
        });

        if ($accepted === null) {
            $session->forceFill([
                'status' => 'completed',
                'completed_at' => now(),
                'last_seen_at' => now(),
                'submission_attempts' => (int) $session->submission_attempts + 1,
            ])->save();

            return response()->json([
                'success' => true,
                'accepted' => false,
                'not_qualified' => true,
                'message' => 'That time did not qualify for the Samurai Greg Hall of Fame.',
            ]);
        }

        $session->forceFill([
            'status' => 'completed',
            'completed_at' => now(),
            'last_seen_at' => now(),
            'submission_attempts' => (int) $session->submission_attempts + 1,
        ])->save();

        return response()->json([
            'success' => true,
            'accepted' => true,
            'rank' => $accepted['rank'],
            'score' => $this->serializeScore($accepted['score'], $accepted['rank']),
            'message' => 'Your legend has been recorded.',
        ], 201);
    }

    private function leaderboardLimit(): int
    {
        return max(1, (int) config('high_scores.limit', 25));
    }

    /**
     * @return Collection<int, HighScore>
     */
    private function topScores(int $limit): Collection
    {
        return HighScore::query()
            ->orderBy('completion_time_ms')
            ->orderBy('completed_at')
            ->limit($limit)
            ->get();
    }

    private function cutoffScore(int $limit): ?HighScore
    {
        return HighScore::query()
            ->orderBy('completion_time_ms')
            ->orderBy('completed_at')
            ->skip($limit - 1)
            ->first();
    }

    private function rankForScore(HighScore $score): int
    {
        return HighScore::query()
            ->where(function ($query) use ($score) {
                $query
                    ->where('completion_time_ms', '<', $score->completion_time_ms)
                    ->orWhere(function ($tieQuery) use ($score) {
                        $tieQuery
                            ->where('completion_time_ms', $score->completion_time_ms)
                            ->where(function ($completedAtQuery) use ($score) {
                                $completedAtQuery
                                    ->where('completed_at', '<', $score->completed_at)
                                    ->orWhere(function ($idQuery) use ($score) {
                                        $idQuery
                                            ->where('completed_at', $score->completed_at)
                                            ->where('id', '<', $score->id);
                                    });
                            });
                    });
            })
            ->count() + 1;
    }

    /**
     * @param Collection<int, HighScore> $scores
     * @return array<int, array<string, mixed>>
     */
    private function withPlaceholderRows(Collection $scores, int $limit): array
    {
        $rows = $scores
            ->values()
            ->map(fn (HighScore $score, int $index): array => $this->serializeScore($score, $index + 1))
            ->all();

        for ($rank = count($rows) + 1; $rank <= $limit; $rank++) {
            $rows[] = [
                'rank' => $rank,
                'player_name' => 'Awaiting Challenger',
                'location' => '',
                'completion_time_ms' => null,
                'completion_time_display' => '--:--.--',
                'completed_at' => null,
                'device_type' => '',
                'death_count' => null,
                'codexes_collected' => null,
                'total_codexes' => null,
                'game_version' => null,
                'is_placeholder' => true,
            ];
        }

        return $rows;
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeScore(HighScore $score, int $rank): array
    {
        return [
            'rank' => $rank,
            'player_name' => $score->player_name,
            'location' => $score->location,
            'completion_time_ms' => $score->completion_time_ms,
            'completion_time_display' => $score->completion_time_display,
            'completed_at' => $score->completed_at?->toIso8601String(),
            'device_type' => $score->device_type,
            'death_count' => $score->death_count,
            'codexes_collected' => $score->codexes_collected,
            'total_codexes' => $score->total_codexes,
            'game_version' => $score->game_version,
            'is_placeholder' => false,
        ];
    }

    private function formatCompletionTime(int $milliseconds): string
    {
        $totalCentiseconds = intdiv($milliseconds, 10);
        $centiseconds = $totalCentiseconds % 100;
        $totalSeconds = intdiv($totalCentiseconds, 100);
        $seconds = $totalSeconds % 60;
        $minutes = intdiv($totalSeconds, 60);

        return sprintf('%02d:%02d.%02d', $minutes, $seconds, $centiseconds);
    }

    private function hashNullable(?string $value): ?string
    {
        if (! filled($value)) {
            return null;
        }

        return hash_hmac('sha256', $value, (string) config('app.key'));
    }

    private function resolveRunSession(string $publicId, string $plainToken, Request $request): ?HighScoreRunSession
    {
        $session = HighScoreRunSession::query()
            ->where('public_id', $publicId)
            ->first();

        if (! $session) {
            return null;
        }

        $expectedHash = hash_hmac('sha256', $plainToken, (string) config('app.key'));

        if (! hash_equals((string) $session->token_hash, $expectedHash)) {
            return null;
        }

        if ($session->expires_at && $session->expires_at->isPast()) {
            return null;
        }

        if ($session->ip_hash !== null && ! hash_equals($session->ip_hash, (string) $this->hashNullable($request->ip()))) {
            return null;
        }

        if ($session->user_agent_hash !== null && ! hash_equals($session->user_agent_hash, (string) $this->hashNullable($request->userAgent()))) {
            return null;
        }

        return $session;
    }
}
