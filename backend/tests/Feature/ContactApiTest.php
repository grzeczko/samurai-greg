<?php

namespace Tests\Feature;

use App\Mail\ContactFormMail;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactApiTest extends TestCase
{
    /**
     * The contact endpoint sends a mail for valid submissions.
     */
    public function test_contact_request_sends_an_email(): void
    {
        Config::set('mail.contact_to.address', 'owner@example.com');
        Config::set('services.recaptcha.secret', 'test-secret');
        Http::fake([
            '*' => Http::response(['success' => true], 200),
        ]);
        Mail::fake();

        $response = $this
            ->withServerVariables(['REMOTE_ADDR' => '127.0.0.10'])
            ->postJson('/api/contact', [
                'name' => 'Gregory Rzeczko',
                'email' => 'greg@example.com',
                'subject' => 'Architect role',
                'message' => 'I would like to talk about a role.',
                'recaptcha_token' => 'valid-token',
                'portfolio_url' => '',
            ]);

        $response
            ->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Thanks, your message has been sent.',
            ]);

        Mail::assertSent(ContactFormMail::class, function (ContactFormMail $mail): bool {
            return $mail->hasTo('owner@example.com')
                && $mail->messageSubject === 'Architect role'
                && $mail->ipAddress === '127.0.0.10';
        });
    }

    public function test_contact_preflight_request_returns_cors_headers(): void
    {
        $response = $this
            ->withHeaders([
                'Origin' => 'http://localhost:4173',
                'Access-Control-Request-Method' => 'POST',
                'Access-Control-Request-Headers' => 'content-type,accept',
            ])
            ->options('/api/contact');

        $response->assertNoContent();
        $response->assertHeader('Access-Control-Allow-Origin', 'http://localhost:4173');
        $response->assertHeader('Access-Control-Allow-Methods');
    }

    public function test_contact_request_requires_name_email_and_message(): void
    {
        Config::set('mail.contact_to.address', 'owner@example.com');
        Config::set('services.recaptcha.secret', 'test-secret');
        Http::fake([
            '*' => Http::response(['success' => true], 200),
        ]);
        Mail::fake();

        $response = $this
            ->withServerVariables(['REMOTE_ADDR' => '127.0.0.11'])
            ->postJson('/api/contact', []);

        $response
            ->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'The name field is required.',
            ]);

        Mail::assertNothingSent();
    }

    public function test_contact_request_rejects_invalid_recaptcha(): void
    {
        Config::set('mail.contact_to.address', 'owner@example.com');
        Config::set('services.recaptcha.secret', 'test-secret');
        Http::fake([
            '*' => Http::response(['success' => false], 200),
        ]);
        Mail::fake();

        $response = $this
            ->withServerVariables(['REMOTE_ADDR' => '127.0.0.14'])
            ->postJson('/api/contact', [
                'name' => 'Gregory Rzeczko',
                'email' => 'greg@example.com',
                'subject' => 'Architect role',
                'message' => 'I would like to talk about a role.',
                'recaptcha_token' => 'invalid-token',
                'portfolio_url' => '',
            ]);

        $response
            ->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'reCAPTCHA verification failed. Please try again.',
            ]);

        Mail::assertNothingSent();
    }

    public function test_contact_request_ignores_honeypot_submissions(): void
    {
        Config::set('mail.contact_to.address', 'owner@example.com');
        Config::set('services.recaptcha.secret', 'test-secret');
        Http::fake([
            '*' => Http::response(['success' => true], 200),
        ]);
        Mail::fake();

        $response = $this
            ->withServerVariables(['REMOTE_ADDR' => '127.0.0.12'])
            ->postJson('/api/contact', [
                'name' => 'Spam Bot',
                'email' => 'spam@example.com',
                'subject' => 'Spam',
                'message' => 'Spam message',
                'recaptcha_token' => 'valid-token',
                'portfolio_url' => 'https://spam.example.com',
            ]);

        $response
            ->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Thanks, your message has been sent.',
            ]);

        Mail::assertNothingSent();
    }

    public function test_contact_route_is_rate_limited(): void
    {
        Config::set('mail.contact_to.address', 'owner@example.com');
        Config::set('services.recaptcha.secret', 'test-secret');
        Http::fake([
            '*' => Http::response(['success' => true], 200),
        ]);
        Mail::fake();

        $ipAddress = '127.0.0.13';

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this
                ->withServerVariables(['REMOTE_ADDR' => $ipAddress])
                ->postJson('/api/contact', [
                    'name' => 'Gregory Rzeczko',
                    'email' => "greg{$attempt}@example.com",
                    'subject' => 'Rate limit check',
                    'message' => 'Checking the contact rate limiter.',
                    'recaptcha_token' => 'valid-token',
                    'portfolio_url' => '',
                ])
                ->assertOk();
        }

        $response = $this
            ->withServerVariables(['REMOTE_ADDR' => $ipAddress])
            ->postJson('/api/contact', [
                'name' => 'Gregory Rzeczko',
                'email' => 'greg-limit@example.com',
                'subject' => 'Rate limit check',
                'message' => 'This request should be throttled.',
                'recaptcha_token' => 'valid-token',
                'portfolio_url' => '',
            ]);

        $response
            ->assertStatus(429)
            ->assertJson([
                'success' => false,
                'message' => 'Too many contact attempts. Please wait a minute and try again.',
            ]);
    }
}
