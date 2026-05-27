<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHighScoreRequest;
use App\Models\HighScore;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class HighScoreController extends Controller
{
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
        $completionTimeMs = (int) $payload['completion_time_ms'];

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
            return response()->json([
                'success' => true,
                'accepted' => false,
                'not_qualified' => true,
                'message' => 'That time did not qualify for the Samurai Greg Hall of Fame.',
            ]);
        }

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
}
