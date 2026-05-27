<?php

namespace Tests\Feature;

use App\Models\HighScore;
use App\Models\HighScoreRunSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class HighScoreApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_high_scores_index_returns_twenty_five_rows_with_placeholders(): void
    {
        HighScore::query()->create([
            'player_name' => 'Greg',
            'location' => 'Chicago',
            'completion_time_ms' => 72000,
            'completion_time_display' => '01:12.00',
            'completed_at' => now(),
            'device_type' => 'desktop',
        ]);

        $response = $this->getJson('/api/high-scores');

        $response
            ->assertOk()
            ->assertJsonPath('scores.0.rank', 1)
            ->assertJsonPath('scores.0.player_name', 'Greg')
            ->assertJsonPath('scores.1.rank', 2)
            ->assertJsonPath('scores.1.player_name', 'Awaiting Challenger')
            ->assertJsonPath('scores.1.is_placeholder', true);

        $this->assertCount(25, $response->json('scores'));
    }

    public function test_high_score_submission_is_accepted_when_board_has_room(): void
    {
        Config::set('high_scores.min_time_ms', 30000);

        [$sessionId, $submissionToken] = $this->createVerifiedRunSession(deathCount: 1);
        $this->travel(91)->seconds();

        $response = $this
            ->withServerVariables(['REMOTE_ADDR' => '127.0.1.1'])
            ->withHeader('User-Agent', 'Samurai Test Browser')
            ->postJson('/api/high-scores', [
                'session_id' => $sessionId,
                'submission_token' => $submissionToken,
                'player_name' => '  <b>Greg</b>  ',
                'location' => ' Chicago ',
                'completion_time_ms' => 90560,
                'device_type' => 'desktop',
                'death_count' => 1,
                'codexes_collected' => 18,
                'total_codexes' => 18,
                'game_version' => '1.0.0',
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('accepted', true)
            ->assertJsonPath('rank', 1)
            ->assertJsonPath('score.player_name', 'Greg')
            ->assertJsonPath('score.completion_time_display', '01:30.56');

        $this->assertDatabaseHas('high_scores', [
            'player_name' => 'Greg',
            'location' => 'Chicago',
            'completion_time_ms' => 90560,
            'device_type' => 'desktop',
        ]);
    }

    public function test_high_score_submission_rejects_impossible_times(): void
    {
        Config::set('high_scores.min_time_ms', 30000);

        [$sessionId, $submissionToken] = $this->createVerifiedRunSession();

        $response = $this->postJson('/api/high-scores', [
            'session_id' => $sessionId,
            'submission_token' => $submissionToken,
            'player_name' => 'Speedrunner',
            'location' => 'Nowhere',
            'completion_time_ms' => 2500,
            'device_type' => 'desktop',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors('completion_time_ms');
    }

    public function test_high_score_submission_must_beat_twenty_fifth_place(): void
    {
        Config::set('high_scores.min_time_ms', 1000);

        for ($index = 1; $index <= 25; $index++) {
            HighScore::query()->create([
                'player_name' => "Runner {$index}",
                'location' => 'Dojo',
                'completion_time_ms' => 60000 + $index,
                'completion_time_display' => '01:00.00',
                'completed_at' => now()->subMinutes(30 - $index),
                'device_type' => 'desktop',
            ]);
        }

        [$slowSessionId, $slowSubmissionToken] = $this->createVerifiedRunSession();
        $this->travel(62)->seconds();

        $slowResponse = $this->withServerVariables(['REMOTE_ADDR' => '127.0.1.1'])
            ->withHeader('User-Agent', 'Samurai Test Browser')
            ->postJson('/api/high-scores', [
            'session_id' => $slowSessionId,
            'submission_token' => $slowSubmissionToken,
            'player_name' => 'Too Slow',
            'location' => 'Dojo',
            'completion_time_ms' => 61000,
            'device_type' => 'desktop',
            'codexes_collected' => 18,
            'total_codexes' => 18,
            'death_count' => 0,
        ]);

        $slowResponse
            ->assertOk()
            ->assertJsonPath('accepted', false)
            ->assertJsonPath('not_qualified', true);

        [$fastSessionId, $fastSubmissionToken] = $this->createVerifiedRunSession();
        $this->travel(61)->seconds();

        $fastResponse = $this->withServerVariables(['REMOTE_ADDR' => '127.0.1.1'])
            ->withHeader('User-Agent', 'Samurai Test Browser')
            ->postJson('/api/high-scores', [
            'session_id' => $fastSessionId,
            'submission_token' => $fastSubmissionToken,
            'player_name' => 'Fast Enough',
            'location' => 'Dojo',
            'completion_time_ms' => 60010,
            'device_type' => 'mobile',
            'codexes_collected' => 18,
            'total_codexes' => 18,
            'death_count' => 0,
        ]);

        $fastResponse
            ->assertCreated()
            ->assertJsonPath('accepted', true);
    }

    public function test_high_score_submission_requires_a_verified_run_session(): void
    {
        $response = $this->postJson('/api/high-scores', [
            'player_name' => 'Intruder',
            'location' => 'Spoofed',
            'completion_time_ms' => 60000,
            'device_type' => 'desktop',
            'codexes_collected' => 18,
            'total_codexes' => 18,
            'death_count' => 0,
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['session_id', 'submission_token']);
    }

    private function createVerifiedRunSession(int $deathCount = 0): array
    {
        $sessionResponse = $this
            ->withServerVariables(['REMOTE_ADDR' => '127.0.1.1'])
            ->withHeader('User-Agent', 'Samurai Test Browser')
            ->postJson('/api/high-scores/session');

        $sessionResponse
            ->assertCreated()
            ->assertJsonPath('success', true);

        $sessionId = $sessionResponse->json('session_id');
        $submissionToken = $sessionResponse->json('submission_token');

        $this
            ->withServerVariables(['REMOTE_ADDR' => '127.0.1.1'])
            ->withHeader('User-Agent', 'Samurai Test Browser')
            ->postJson("/api/high-scores/session/{$sessionId}", [
                'submission_token' => $submissionToken,
                'event_type' => 'codex_collected',
                'codexes_collected' => 18,
                'total_codexes' => 18,
            ])
            ->assertOk();

        $this
            ->withServerVariables(['REMOTE_ADDR' => '127.0.1.1'])
            ->withHeader('User-Agent', 'Samurai Test Browser')
            ->postJson("/api/high-scores/session/{$sessionId}", [
                'submission_token' => $submissionToken,
                'event_type' => 'boss_defeated',
                'codexes_collected' => 18,
                'total_codexes' => 18,
            ])
            ->assertOk();

        if ($deathCount > 0) {
            $this
                ->withServerVariables(['REMOTE_ADDR' => '127.0.1.1'])
                ->withHeader('User-Agent', 'Samurai Test Browser')
                ->postJson("/api/high-scores/session/{$sessionId}", [
                    'submission_token' => $submissionToken,
                    'event_type' => 'player_died',
                    'death_count' => $deathCount,
                ])
                ->assertOk();
        }

        $session = HighScoreRunSession::query()->where('public_id', $sessionId)->firstOrFail();
        $session->forceFill([
            'death_count' => $deathCount,
        ])->save();

        return [$sessionId, $submissionToken];
    }
}
