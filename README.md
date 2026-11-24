# WeCodee

## Run the site

Use Node.js 24 or later. Install the dependencies with `npm ci` and start the site with `npm run dev`.

The landing page works on its own. The authentication routes need the settings in `.env.example`. Copy that file to `.env.local`, then generate a secret with:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

- Set `BETTER_AUTH_SECRET` to the generated value. Keep it stable across restarts.
- Set `BETTER_AUTH_URL` to the public origin, including the port when running locally. Non-local origins use HTTPS.
- Set `AUTH_SMTP_URL` and `AUTH_MAIL_FROM` for your mail relay and verified sender. For local development, a local SMTP inbox can accept the messages without delivering them. Non-local relays use implicit TLS with `smtps://` or STARTTLS with `smtp://`.
- Set `AUTH_DB_PATH` to a writable, persistent filesystem location. WeCodee opens the SQLite database and applies the Better Auth schema on the first auth request. Run one Node deployment against that disk. A deployment that uses ephemeral filesystems or independent replicas needs a shared database adapter.

The browser calls the Better Auth endpoints under `/api/auth`. Those endpoints return HTTP 503 when auth configuration is missing. Signup and recovery use generic responses to avoid revealing which addresses belong to accounts. Authentication email is queued through the configured SMTP relay. The workspace is gated by a server-side session check and a verified email address. Sessions live up to seven days and password resets revoke existing sessions.

Verification links expire after one hour. Reset links expire after 30 minutes and can be used once. WeCodee puts new email tokens in URL fragments and sends them in request bodies to keep them out of ordinary URL access logs. Reopening a verified email link is idempotent. Recovery and verification cooldowns are enforced at the auth API as well as reflected in the form. In production, configure the reverse proxy to overwrite forwarding headers with the actual client address so the rate limiter can distinguish visitors.

[Better Auth email and password guide](https://better-auth.com/docs/authentication/email-password) · [Better Auth SQLite adapter](https://better-auth.com/docs/adapters/sqlite)

## Artwork

Authentication videos are the supplied files in `public/`. The WebP posters in `public/posters/auth/` use selected frames from those videos. The static illustrations in `public/illustrations/` were generated with the built-in image generation tool, using `public/posters/path-start.webp` as the original mascot reference.

The shared prompt asked for the same full-body sheep with white cloud-shaped hair, black oval eyes, pink ears, red-and-black headphones, a red varsity jacket, black gloves and shorts, and red-and-white sneakers. It specified the original proportions, outlines, subtle shading, compact props, ample white margin, and a pure white backdrop.

| Asset | Requested scene |
| --- | --- |
| verify-email.webp | Holding a white envelope with a red seal |
| account-created.webp | Presenting a red builder’s badge |
| email-verified.webp | Smiling beside a verification medallion |
| password-changed.webp | Holding an engineered security lock |
| expired-link.webp | Examining a red-and-white hourglass |
| 400.webp | Examining two precision components that do not fit |
| 401.webp | Standing beside a locked red door |
| 403.webp | Standing at a restricted-access barrier |
| 404.webp | Looking at an upside-down folded map |
| 429.webp | Managing incoming digital envelopes |
| 500.webp | Repairing a miniature device |
| 503.webp | Placing a maintenance indicator beside a workstation |
| offline.webp | Reconnecting a disconnected cable |

## Checks

`npm run lint` checks source style. `npm run build` checks types and produces a production build.
