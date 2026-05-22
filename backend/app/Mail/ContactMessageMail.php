<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Symfony\Component\Mime\Address;

class ContactMessageMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public readonly string $senderName,
        public readonly string $senderEmail,
        public readonly string $senderMessage,
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Portfolio contact from {$this->senderName}",
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
            view: 'emails.contact-message',
            with: [
                'senderName' => $this->senderName,
                'senderEmail' => $this->senderEmail,
                'senderMessage' => $this->senderMessage,
                'submittedAt' => now(),
            ],
        );
    }
}
