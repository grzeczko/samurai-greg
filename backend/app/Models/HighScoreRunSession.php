<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HighScoreRunSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'public_id',
        'token_hash',
        'status',
        'started_at',
        'expires_at',
        'completed_at',
        'boss_defeated_at',
        'codexes_collected',
        'total_codexes',
        'death_count',
        'ip_hash',
        'user_agent_hash',
        'last_seen_at',
        'submission_attempts',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'expires_at' => 'datetime',
            'completed_at' => 'datetime',
            'boss_defeated_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'codexes_collected' => 'integer',
            'total_codexes' => 'integer',
            'death_count' => 'integer',
            'submission_attempts' => 'integer',
        ];
    }
}