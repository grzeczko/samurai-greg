<?php

use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\HighScoreController;
use Illuminate\Support\Facades\Route;

Route::post('/contact', ContactController::class)
    ->middleware('throttle:contact');

Route::post('/high-scores/session', [HighScoreController::class, 'createSession'])
    ->middleware('throttle:high-scores-session-create');
Route::post('/high-scores/session/{session}', [HighScoreController::class, 'updateSessionProgress'])
    ->middleware('throttle:high-scores-session-progress');

Route::get('/high-scores', [HighScoreController::class, 'index'])
    ->middleware('throttle:high-scores-read');

Route::post('/high-scores', [HighScoreController::class, 'store'])
    ->middleware('throttle:high-scores-submit');
