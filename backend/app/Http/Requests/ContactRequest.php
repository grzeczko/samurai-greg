<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class ContactRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['nullable', 'string', 'max:160'],
            'message' => ['required', 'string', 'max:5000'],
            'recaptcha_token' => ['required', 'string', 'max:4096'],
            'portfolio_url' => ['nullable', 'string', 'max:255'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => $this->sanitizeSingleLine($this->input('name')),
            'email' => $this->sanitizeSingleLine($this->input('email')),
            'subject' => $this->sanitizeSingleLine($this->input('subject')),
            'message' => $this->sanitizeMultiline($this->input('message')),
            'recaptcha_token' => trim((string) $this->input('recaptcha_token', '')),
            'portfolio_url' => $this->sanitizeSingleLine($this->input('portfolio_url')),
        ]);
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => $validator->errors()->first() ?: 'Please complete the required fields.',
            'errors' => $validator->errors(),
        ], 422));
    }

    public function honeypotTriggered(): bool
    {
        return filled($this->input('portfolio_url'));
    }

    /**
     * @return array{name: string, email: string, subject: ?string, message: string, recaptcha_token: string}
     */
    public function payload(): array
    {
        /** @var array{name: string, email: string, subject: ?string, message: string, recaptcha_token: string} $payload */
        $payload = $this->safe()->only(['name', 'email', 'subject', 'message', 'recaptcha_token']);

        return $payload;
    }

    private function sanitizeSingleLine(mixed $value): string
    {
        return trim(str_replace(["\r", "\n"], ' ', strip_tags((string) ($value ?? ''))));
    }

    private function sanitizeMultiline(mixed $value): string
    {
        return trim(strip_tags((string) ($value ?? '')));
    }
}
