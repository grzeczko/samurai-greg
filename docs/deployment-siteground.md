# SiteGround Deployment

This project deploys `main` to the SiteGround production account for `rzeczko.com`.

## Target Layout

```text
/home/customer/www/rzeczko.com
├── public_html/   # React/Vite build output
└── backend/       # Laravel application
```

The frontend is built in GitHub Actions and synced into `public_html`. The Laravel app is synced into `backend`, while Composer dependencies are installed on SiteGround.

## Required GitHub Secrets

Create these secrets in the GitHub repository or production environment:

| Secret | Value |
| --- | --- |
| `SSH_HOST` | SiteGround SSH host |
| `SSH_USER` | SiteGround SSH user |
| `SSH_KEY` | Private SSH key with access to the SiteGround account |
| `SSH_PORT` | SiteGround SSH port |
| `SITE_ROOT` | `/home/customer/www/rzeczko.com` |
| `FRONTEND_ENV_FILE` | Full contents of `frontend/.env` for production |
| `LARAVEL_ENV_FILE` | Full contents of `backend/.env` for production |

Do not commit production `.env` files. Store the complete file contents in the two environment-file secrets.

## Frontend Environment

Use the clean API URL when the SiteGround rewrite is enabled:

```env
VITE_CONTACT_API_URL=https://rzeczko.com/api/contact
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

The workflow writes this secret to `frontend/.env` only inside the GitHub Actions runner before `npm run build`.

## Laravel Environment

The backend secret should contain a production Laravel `.env`, including:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://rzeczko.com
FRONTEND_URL=https://rzeczko.com
FRONTEND_URLS=https://rzeczko.com,https://www.rzeczko.com
RECAPTCHA_SECRET_KEY=your_recaptcha_secret
MAIL_MAILER=smtp
CONTACT_TO_EMAIL=you@example.com
```

Make sure `APP_KEY` is set before the first deployment. Generate one locally with:

```bash
cd backend
php artisan key:generate --show
```

The workflow uploads the Laravel env secret as a temporary seed file and creates `$SITE_ROOT/backend/.env` only when that file does not already exist. Existing server `.env` files are preserved.

## What The Workflow Does

`.github/workflows/deploy-siteground.yml` runs on pushes to `main` and through `workflow_dispatch`.

1. Checks out the repository.
2. Sets up Node 22.
3. Installs frontend dependencies with `npm ci`.
4. Writes `frontend/.env` from `FRONTEND_ENV_FILE`.
5. Builds the frontend with `npm run build`.
6. Adds `frontend/dist/.htaccess` for `/api` and React Router fallback handling.
7. Sets up PHP 8.3 and Composer for validation.
8. Writes `backend/.env` from `LARAVEL_ENV_FILE` in the runner.
9. Uses rsync over SSH to deploy `frontend/dist/` to `$SITE_ROOT/public_html`.
10. Uses rsync over SSH to deploy `backend/` to `$SITE_ROOT/backend`.
11. SSHes into SiteGround and runs Composer, cache clears, migrations, and cache rebuilds.

## Preserved Server Files

The backend rsync excludes these runtime paths:

- `.env`
- `.env.*`
- `vendor/`
- `node_modules/`
- `storage/`
- `public/storage`
- `database/*.sqlite`

This keeps the server environment file, uploaded files, logs, generated storage content, and Composer dependencies from being deleted by deploys. The workflow recreates required Laravel storage/cache directories if they are missing.

The frontend rsync uses `--delete` so old hashed Vite assets are removed from `public_html`, while preserving `.well-known/` and `cgi-bin/`.

## Routing

The generated `public_html/.htaccess` handles two concerns:

- `/api/*` requests are internally routed to `../backend/public/index.php`.
- All non-file, non-directory requests fall back to `index.html` so React Router routes work after refresh.

The frontend contact service defaults to `/api/contact`, so production can use:

```env
VITE_CONTACT_API_URL=https://rzeczko.com/api/contact
```

If SiteGround does not allow the cross-directory rewrite from `public_html` to `../backend/public/index.php`, use one of these fallback hosting shapes:

- Ask SiteGround to point a subdomain such as `api.rzeczko.com` at `$SITE_ROOT/backend/public`, then set `VITE_CONTACT_API_URL=https://api.rzeczko.com/api/contact`.
- Create a supported Apache alias or document-root mapping for Laravel's `public` directory.

Do not expose the full Laravel app directory as a public document root. Only `backend/public` should be web-accessible.

## Manual Deploy

Open the GitHub Actions tab, choose **Deploy to SiteGround**, and run the workflow manually. The same workflow also runs automatically after pushes to `main`.
