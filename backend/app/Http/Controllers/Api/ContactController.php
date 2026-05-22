<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactRequest;
use App\Mail\ContactFormMail;
use App\Services\RecaptchaVerifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use RuntimeException;
use Throwable;

class ContactController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(ContactRequest $request, RecaptchaVerifier $recaptcha): JsonResponse
    {
        $payload = $request->payload();

        Log::info('Contact form request received.', [
            'email' => $payload['email'],
            'subject' => $payload['subject'] ?: null,
            'ip' => $request->ip(),
            'honeypot' => $request->honeypotTriggered(),
        ]);

        if ($request->honeypotTriggered()) {
            return response()->json([
                'success' => true,
                'message' => 'Thanks, your message has been sent.',
            ]);
        }

        $recaptchaResult = $recaptcha->verify($payload['recaptcha_token'], $request->ip());

        if (! $recaptchaResult['passed']) {
            Log::warning('Contact form reCAPTCHA blocked the request.', [
                'email' => $payload['email'],
                'ip' => $request->ip(),
                'reason' => $recaptchaResult['reason'],
                'error_codes' => $recaptchaResult['error_codes'],
            ]);

            $response = [
                'success' => false,
                'message' => 'reCAPTCHA verification failed. Please try again.',
            ];

            if (app()->isLocal()) {
                $response['debug'] = [
                    'step' => 'recaptcha',
                    'reason' => $recaptchaResult['reason'],
                    'error_codes' => $recaptchaResult['error_codes'],
                ];
            }

            return response()->json($response, 422);
        }

        $recipient = config('mail.contact_to.address');

        if (! filled($recipient)) {
            report(new RuntimeException('CONTACT_TO_EMAIL is not configured.'));

            return response()->json([
                'success' => false,
                'message' => 'The contact service is not configured right now. Please try again later.',
            ], 500);
        }

        try {
            Mail::to($recipient)->send(new ContactFormMail(
                senderName: $payload['name'],
                senderEmail: $payload['email'],
                messageSubject: $payload['subject'] ?: null,
                senderMessage: $payload['message'],
                submittedAt: now(),
                ipAddress: $request->ip(),
            ));

            Log::info('Contact form mail sent.', [
                'email' => $payload['email'],
                'recipient' => $recipient,
                'ip' => $request->ip(),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            Log::error('Contact form mail send failed.', [
                'email' => $payload['email'],
                'recipient' => $recipient,
                'ip' => $request->ip(),
                'exception' => $exception->getMessage(),
            ]);

            $response = [
                'success' => false,
                'message' => 'Sorry, something went wrong while sending your message. Please try again later.',
            ];

            if (app()->isLocal()) {
                $response['debug'] = [
                    'step' => 'mail',
                    'exception' => $exception->getMessage(),
                ];
            }

            return response()->json($response, 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Thanks, your message has been sent.',
        ]);
    }
}
