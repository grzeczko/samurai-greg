<?php

namespace Tests\Feature;

use App\Models\HighScore;
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

        $response = $this
            ->withServerVariables(['REMOTE_ADDR' => '127.0.1.1'])
            ->withHeader('User-Agent', 'Samurai Test Browser')
            ->postJson('/api/high-scores', [
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

        $response = $this->postJson('/api/high-scores', [
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

        $slowResponse = $this->postJson('/api/high-scores', [
            'player_name' => 'Too Slow',
            'location' => 'Dojo',
            'completion_time_ms' => 61000,
            'device_type' => 'desktop',
        ]);

        $slowResponse
            ->assertOk()
            ->assertJsonPath('accepted', false)
            ->assertJsonPath('not_qualified', true);

        $fastResponse = $this->postJson('/api/high-scores', [
            'player_name' => 'Fast Enough',
            'location' => 'Dojo',
            'completion_time_ms' => 60010,
            'device_type' => 'mobile',
        ]);

        $fastResponse
            ->assertCreated()
            ->assertJsonPath('accepted', true);
    }
}
