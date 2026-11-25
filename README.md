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

## Workspace

The signed-in dashboards follow `WeCodee_SRS.docx` (§2.2 user roles). Each role has its own route:

| Route | Who | What's there |
| --- | --- | --- |
| `/learner` | Learners, including team leaders | Overview, Hot Topics, articles, live events, the skills quiz, team, daily reports, the 8-milestone project, portfolio and certificates. Team leaders get their tools (group link, roles, report tracking, inactive flags) on `/learner/team`. |
| `/supervisor` | Supervisors (and admins) | Queues, the review queue with checklist reviews, and supervised teams with report grids. |
| `/admin` | Admins | Reports and CSV exports, users and roles, team formation, certificates, Hot Topics, articles, quiz bank, milestone templates, events, platform settings and the audit log. |
| `/notifications`, `/settings` | Everyone signed in | Shown inside the viewer's own dashboard. Supervisors and admins see account settings only. |
| `/verify`, `/verify/[code]`, `/u/[username]` | Anyone, no sign-in | Certificate check (FR-51) and public portfolios (FR-78). Private portfolios answer like unknown ones. |

Sign-in lands on `/workspace`, which sends each person to their dashboard. Old `/workspace/...` links redirect to the new routes. Visitors who aren't signed in keep the public site.

The pages live in `app/(dashboard)/`. Each dashboard's layout (`components/workspace/RoleGate.tsx`) sends anyone outside its roles to their own dashboard, and each Server Action in `lib/workspace/actions.ts` checks the role again. A learner's WhatsApp number is shown only to their team leader and supervisor. Check-question answers never reach the browser.

### Roles

Accounts get a `role` field (`learner` by default; users can't set it themselves). Emails listed in `WECODEE_ADMIN_EMAILS` (comma-separated) are treated as admins. Role edits under Admin › Users affect sample records only.

### Sample data and the backend boundary

The learning backend (Hot Topics, teams, projects, reports and so on) isn't built yet. `lib/workspace/data.ts` is the single integration point: `loadWorkspace()` returns the viewer plus the workspace data, and reports `source: "sample"` while it serves the in-memory sample adapter in `lib/workspace/sample/`. The sample state is kept per viewer in server memory and resets when the server restarts. A strip at the top of every page says so and offers a **Reset** button.

To connect a real backend, implement the same `WorkspaceData` shape in `loadWorkspace()` and replace the sample mutations in `actions.ts`. Pure SRS rules (readiness, quiz levels, team formation, hours, CSV) are in `lib/workspace/rules.ts`. Persistent learning records, email delivery, scheduled reminders, file storage, web push and Background Sync are still pending. The dashboard never reports these as done: actions say where the change is visible in WeCodee instead. Public pages read a fixed sample directory from `lib/workspace/public.ts`. Use sample information when exploring the dashboard.

`docs/srs-traceability.md` maps every SRS requirement to its page, component and status, and lists the backend dependencies.

### PWA

`app/manifest.ts`, the icons in `public/icons/` and `public/sw.js` make WeCodee installable (FR-83). The service worker is registered in production builds only. It caches the build files and brand art, and keeps the last copy of each page you open so it works offline (FR-84). Auth, API and Server Action requests are never cached. The account menu offers **Install WeCodee** where the browser supports it, and Add to Home Screen steps on iPhone.

### Preview mode

When auth isn't configured and `NODE_ENV` is `development`, the dashboards open with a preview account so the dashboard can be explored without a mail relay. The sample strip then also switches the journey (*New builder* or *In a team*) and the role (*Learner*, *Supervisor* or *Admin*). Production never uses the preview account.

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

- `npm run lint` checks source style.
- `npm run typecheck` checks types.
- `npm test` runs the SRS rule tests with Node's built-in test runner.
- `npm run build` produces a production build.

On Windows machines that block Next.js's native SWC binary, Turbopack can't start. Use `npx next dev --webpack` and `npx next build --webpack` instead; `next.config.ts` runs the Tailwind loader under webpack too, so the landing and auth pages keep their styles.
