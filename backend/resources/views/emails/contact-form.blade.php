<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Samurai Greg Portfolio Contact</title>
  </head>
  <body style="margin: 0; padding: 24px; background: #0f172a; color: #e2e8f0; font-family: Arial, sans-serif;">
    <div style="margin: 0 auto; max-width: 680px; border: 1px solid #1e293b; border-radius: 16px; background: #111827; overflow: hidden;">
      <div style="padding: 22px 24px; border-bottom: 1px solid #1e293b; background: linear-gradient(135deg, #0f172a 0%, #111827 48%, #2a1111 100%);">
        <p style="margin: 0 0 8px; color: #fbbf24; font-size: 12px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;">Samurai Greg Portfolio</p>
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; line-height: 1.2;">New contact form message</h1>
      </div>

      <div style="padding: 24px;">
        <p style="margin: 0 0 12px;"><strong>Name:</strong> {{ $senderName }}</p>
        <p style="margin: 0 0 12px;"><strong>Email:</strong> {{ $senderEmail }}</p>
        <p style="margin: 0 0 12px;"><strong>Subject:</strong> {{ filled($messageSubject) ? $messageSubject : 'No subject provided' }}</p>
        <p style="margin: 0 0 12px;"><strong>Submitted:</strong> {{ $submittedAt->format('F j, Y g:i A T') }}</p>
        @if (filled($ipAddress))
          <p style="margin: 0 0 20px;"><strong>IP:</strong> {{ $ipAddress }}</p>
        @endif

        <div style="padding: 16px; border-radius: 12px; background: #0f172a; border: 1px solid #1e293b;">
          <p style="margin: 0 0 10px; color: #f8fafc; font-weight: 700;">Message</p>
          <div style="white-space: pre-line; line-height: 1.7; color: #cbd5e1;">{!! nl2br(e($senderMessage)) !!}</div>
        </div>
      </div>
    </div>
  </body>
</html>
