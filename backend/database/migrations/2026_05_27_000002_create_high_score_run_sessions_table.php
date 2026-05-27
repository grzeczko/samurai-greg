<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('high_score_run_sessions', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->string('token_hash', 64);
            $table->string('status', 24)->default('active')->index();
            $table->timestamp('started_at');
            $table->timestamp('expires_at')->index();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('boss_defeated_at')->nullable();
            $table->unsignedSmallInteger('codexes_collected')->default(0);
            $table->unsignedSmallInteger('total_codexes')->default(0);
            $table->unsignedSmallInteger('death_count')->default(0);
            $table->string('ip_hash', 64)->nullable()->index();
            $table->string('user_agent_hash', 64)->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->unsignedTinyInteger('submission_attempts')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('high_score_run_sessions');
    }
};