<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('high_scores', function (Blueprint $table) {
            $table->id();
            $table->string('player_name', 40);
            $table->string('location', 60);
            $table->unsignedInteger('completion_time_ms')->index();
            $table->string('completion_time_display', 16);
            $table->timestamp('completed_at')->index();
            $table->string('device_type', 16);
            $table->unsignedSmallInteger('death_count')->nullable();
            $table->unsignedSmallInteger('codexes_collected')->nullable();
            $table->unsignedSmallInteger('total_codexes')->nullable();
            $table->string('game_version', 40)->nullable();
            $table->string('user_agent_hash', 64)->nullable();
            $table->string('ip_hash', 64)->nullable();
            $table->boolean('is_verified')->default(true);
            $table->boolean('is_flagged')->default(false);
            $table->timestamps();

            $table->index(['completion_time_ms', 'completed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('high_scores');
    }
};
