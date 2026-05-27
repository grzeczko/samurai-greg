<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('contact', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->ip())
                ->response(fn () => response()->json([
                    'success' => false,
                    'message' => 'Too many contact attempts. Please wait a minute and try again.',
                ], 429));
        });

        RateLimiter::for('high-scores-submit', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->ip())
                ->response(fn () => response()->json([
                    'success' => false,
                    'message' => 'Too many Hall of Fame submissions. Please wait a minute and try again.',
                ], 429));
        });

        RateLimiter::for('high-scores-session-create', function (Request $request) {
            return Limit::perMinute(10)
                ->by($request->ip())
                ->response(fn () => response()->json([
                    'success' => false,
                    'message' => 'Too many Hall of Fame session requests. Please wait a minute and try again.',
                ], 429));
        });

        RateLimiter::for('high-scores-session-progress', function (Request $request) {
            return Limit::perMinute(120)
                ->by($request->ip())
                ->response(fn () => response()->json([
                    'success' => false,
                    'message' => 'Too many Hall of Fame verification events. Please wait a minute and try again.',
                ], 429));
        });

        RateLimiter::for('high-scores-read', function (Request $request) {
            return Limit::perMinute(60)
                ->by($request->ip())
                ->response(fn () => response()->json([
                    'success' => false,
                    'message' => 'Too many Hall of Fame requests. Please wait a minute and try again.',
                ], 429));
        });
    }
}
