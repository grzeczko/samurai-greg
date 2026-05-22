<?php

namespace App\Services;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;

class RecaptchaVerifier
{
    /**
     * @return array{passed: bool, reason: string, error_codes: array<int, string>}
     */
    public function verify(string $token, ?string $ipAddress = null): array
    {
        $secret = config('services.recaptcha.secret');

        if (! filled($secret)) {
            report(new RuntimeException('RECAPTCHA_SECRET_KEY is not configured.'));

            Log::warning('Contact form reCAPTCHA secret is missing.', [
                'ip' => $ipAddress,
            ]);

            return [
                'passed' => false,
                'reason' => 'missing-secret',
                'error_codes' => [],
            ];
        }

        try {
            $response = Http::asForm()
                ->timeout(5)
                ->post(config('services.recaptcha.verify_url'), array_filter([
                    'secret' => $secret,
                    'response' => $token,
                    'remoteip' => $ipAddress,
                ]));
        } catch (Throwable $exception) {
            report($exception);

            Log::warning('Contact form reCAPTCHA HTTP request failed.', [
                'ip' => $ipAddress,
                'exception' => $exception->getMessage(),
            ]);

            return [
                'passed' => false,
                'reason' => 'request-failed',
                'error_codes' => [],
            ];
        }

        if (! $response->ok()) {
            report(new RuntimeException('Google reCAPTCHA verification request failed.'));

            Log::warning('Contact form reCAPTCHA endpoint returned a non-OK status.', [
                'ip' => $ipAddress,
                'status' => $response->status(),
            ]);

            return [
                'passed' => false,
                'reason' => 'http-error',
                'error_codes' => [],
            ];
        }

        $payload = $response->json();
        $passed = (bool) data_get($payload, 'success', false);
        $errorCodes = array_values(Arr::wrap(data_get($payload, 'error-codes', [])));

        Log::info('Contact form reCAPTCHA verification completed.', [
            'ip' => $ipAddress,
            'passed' => $passed,
            'error_codes' => $errorCodes,
        ]);

        return [
            'passed' => $passed,
            'reason' => $passed ? 'ok' : 'verification-failed',
            'error_codes' => $errorCodes,
        ];
    }
}
