<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;

class ContactFormMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public readonly string $senderName,
        public readonly string $senderEmail,
        public readonly ?string $messageSubject,
        public readonly string $senderMessage,
        public readonly Carbon $submittedAt,
        public readonly ?string $ipAddress = null,
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = filled($this->messageSubject)
            ? "Portfolio contact: {$this->messageSubject}"
            : "Portfolio contact from {$this->senderName}";

        return new Envelope(
            subject: $subject,
            replyTo: [
                new Address($this->senderEmail, $this->senderName),
            ],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.contact-form',
            with: [
                'senderName' => $this->senderName,
                'senderEmail' => $this->senderEmail,
                'messageSubject' => $this->messageSubject,
                'senderMessage' => $this->senderMessage,
                'submittedAt' => $this->submittedAt,
                'ipAddress' => $this->ipAddress,
            ],
        );
    }
}
