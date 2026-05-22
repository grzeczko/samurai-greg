# Rzeczko Portfolio / Resume Quest

This repository contains the React and Phaser frontend for the portfolio site plus a Laravel backend dedicated to contact form delivery.

## Structure

- `frontend/` contains the React and Phaser frontend.
- `backend/` contains the Laravel application.
- `backend/routes/api.php` exposes the contact endpoint.
- `backend/resources/views/emails/contact-message.blade.php` is the outgoing email template.

## Frontend local development

1. Change into `frontend/`.
2. Copy `frontend/.env.example` to `frontend/.env`.
3. Set `VITE_CONTACT_API_URL=http://127.0.0.1:8000/api/contact` for local Laravel development.
4. Run `npm install`.
5. Run `npm run dev`.

## Backend local development

1. Change into `backend/`.
2. Copy `backend/.env.example` to `backend/.env`.
3. Run `composer install` if dependencies are not already present.
4. Run `php artisan key:generate`.
5. Fill in the mail settings in `backend/.env`.
6. Run `php artisan serve`.

Required backend environment variables:

- `MAIL_MAILER=smtp`
- `MAIL_HOST=`
- `MAIL_PORT=`
- `MAIL_USERNAME=`
- `MAIL_PASSWORD=`
- `MAIL_ENCRYPTION=`
- `MAIL_FROM_ADDRESS=`
- `MAIL_FROM_NAME="Rzeczko Portfolio"`
- `CONTACT_TO_EMAIL=`
- `FRONTEND_URL=https://rzeczko.com`

## Contact API

Endpoint: `POST /api/contact`

Expected JSON payload:

- `name` required
- `email` required and valid
- `message` required
- `company` optional honeypot field and should stay blank

Response shape:

- `success` boolean
- `message` string

Security behavior:

- Request validation happens server-side.
- Honeypot submissions are accepted with a success response but no mail is sent.
- The route is limited to 5 requests per minute per IP.
- The outgoing mail uses `MAIL_FROM_ADDRESS` and sets `Reply-To` to the submitter email.

## Validation

- Frontend: `cd frontend && npm run build`
- Backend: `cd backend && php artisan test --filter=ContactApiTest`

## SiteGround deployment

- Build the frontend with `cd frontend && npm run build` and deploy the `frontend/dist/` contents to `public_html`.
- Deploy the Laravel app to `backend`.
- Keep only `backend/public` web-accessible. Do not expose `backend/app`, `backend/storage`, or `backend/vendor` directly.
- Recommended public endpoint: `https://rzeczko.com/api/contact`
- Fallback endpoint if you cannot add a rewrite or proxy rule yet: `https://rzeczko.com/backend/public/api/contact`

Recommendation:

- Prefer `https://rzeczko.com/api/contact`.
- It keeps the frontend same-origin, avoids leaking the Laravel `public` path, and is easier to keep stable if the backend layout changes.
- Use a host rewrite or proxy rule that forwards `/api/*` requests to `backend/public/index.php`.

Production environment settings:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://rzeczko.com`
- `FRONTEND_URL=https://rzeczko.com`

If you must use the fallback endpoint, update the frontend env value to:

- `VITE_CONTACT_API_URL=https://rzeczko.com/backend/public/api/contact`
