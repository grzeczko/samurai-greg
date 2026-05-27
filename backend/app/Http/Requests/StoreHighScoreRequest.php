<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreHighScoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'player_name' => $this->sanitizeSingleLine($this->input('player_name')),
            'location' => $this->sanitizeSingleLine($this->input('location')),
            'device_type' => strtolower($this->sanitizeSingleLine($this->input('device_type'))),
            'game_version' => $this->sanitizeSingleLine($this->input('game_version')),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'session_id' => ['required', 'string', 'uuid'],
            'submission_token' => ['required', 'string', 'min:32', 'max:255'],
            'player_name' => ['required', 'string', 'max:40'],
            'location' => ['required', 'string', 'max:60'],
            'completion_time_ms' => ['required', 'integer'],
            'device_type' => ['required', 'in:desktop,mobile,tablet'],
            'death_count' => ['nullable', 'integer', 'min:0', 'max:65535'],
            'codexes_collected' => ['nullable', 'integer', 'min:0', 'max:65535'],
            'total_codexes' => ['nullable', 'integer', 'min:0', 'max:65535'],
            'game_version' => ['nullable', 'string', 'max:40'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->has('completion_time_ms')) {
                return;
            }

            $completionTimeMs = (int) $this->input('completion_time_ms');
            $minimumTimeMs = (int) config('high_scores.min_time_ms', 30000);
            $maximumTimeMs = config('high_scores.max_time_ms');

            if ($completionTimeMs < $minimumTimeMs) {
                $validator->errors()->add(
                    'completion_time_ms',
                    'The completion time is not plausible for a verified run.'
                );
            }

            if ($maximumTimeMs !== null && $completionTimeMs > (int) $maximumTimeMs) {
                $validator->errors()->add(
                    'completion_time_ms',
                    'The completion time is too long for the leaderboard.'
                );
            }
        });
    }

    /**
     * Get a sanitized payload for score creation.
     *
     * @return array<string, mixed>
     */
    public function payload(): array
    {
        return $this->safe()->only([
            'session_id',
            'submission_token',
            'player_name',
            'location',
            'completion_time_ms',
            'device_type',
            'death_count',
            'codexes_collected',
            'total_codexes',
            'game_version',
        ]);
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'session_id.required' => 'A verified run session is required.',
            'submission_token.required' => 'A verified run token is required.',
            'player_name.required' => 'Enter your name to record your run.',
            'location.required' => 'Enter your location to record your run.',
            'completion_time_ms.required' => 'A completion time is required.',
            'device_type.in' => 'The device type must be desktop, mobile, or tablet.',
        ];
    }

    private function sanitizeSingleLine(mixed $value): string
    {
        $normalized = preg_replace('/\s+/', ' ', strip_tags((string) $value)) ?? '';

        return trim($normalized);
    }
}
