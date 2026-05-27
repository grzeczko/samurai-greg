<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HighScore extends Model
{
    /** @use HasFactory<\Database\Factories\HighScoreFactory> */
    use HasFactory;

    protected $fillable = [
        'player_name',
        'location',
        'completion_time_ms',
        'completion_time_display',
        'completed_at',
        'device_type',
        'death_count',
        'codexes_collected',
        'total_codexes',
        'game_version',
        'user_agent_hash',
        'ip_hash',
        'is_verified',
        'is_flagged',
    ];

    protected function casts(): array
    {
        return [
            'completion_time_ms' => 'integer',
            'completed_at' => 'datetime',
            'death_count' => 'integer',
            'codexes_collected' => 'integer',
            'total_codexes' => 'integer',
            'is_verified' => 'boolean',
            'is_flagged' => 'boolean',
        ];
    }
}
