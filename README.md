# Lawadvisory Client Portal

A secure client portal for a law firm: clients sign in to see their own
matters, upload case evidence, view invoices and retainer balance, and
message staff. Staff sign in to manage matters, create client accounts,
control what's visible to clients, and adjust retainer balances.

## Origin

Built from scratch on a modern stack rather than forking an existing
project directly, after evaluating [OpenLawOffice](https://github.com/NodineLegal/OpenLawOffice)
(Apache-2.0): its Matters/Contacts/Documents/Billing domain model was a
useful reference, but the codebase itself is unmaintained since 2016
(.NET Framework 4.5) and has no client-facing portal at all. The Prisma
schema here (`prisma/schema.prisma`) is informed by that domain model,
redesigned client-portal-first — matter access is opt-in per contact,
and documents/tasks/events each carry an explicit `visibleToClient` flag.

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **Prisma 7** + PostgreSQL (via `@prisma/adapter-pg`)
- **Auth**: custom stateless sessions (signed JWT cookie via `jose`),
  following the official Next.js authentication guide — no third-party
  auth library. Matter access enforced in a Data Access Layer
  (`src/lib/dal.ts`); `src/proxy.ts` only does a cheap optimistic
  redirect (Next 16 renamed `middleware.ts` to `proxy.ts`).
- **Tailwind CSS 4**
- Local filesystem document storage (`src/lib/storage.ts`, path
  configurable via `STORAGE_DIR`) — swap for S3/R2 before handling
  real client documents at scale.

## Features

- **Staff**: create client accounts (auto-generated password), create
  matters (auto-grants the client portal access), upload documents with
  a client-visibility toggle, grant/revoke portal access per client,
  adjust retainer balance, message clients.
- **Clients**: sign in (or self-signup, auto-generated password) to see
  only matters they've been granted access to; per-matter Documents /
  Invoices / Messages tabs; upload their own case evidence; see their
  retainer balance due (top-right in the portal header, and per-matter).
- **Forgot password**: emails a new auto-generated password via Resend
  if `RESEND_API_KEY` is set, otherwise logs it server-side. Never
  returns the password in the HTTP response — that would let anyone
  reset anyone else's password just by knowing their email.

## Local development

```bash
npm install

# Postgres running locally, then:
cp .env.example .env   # fill in DATABASE_URL, SESSION_SECRET, ADMIN_*
npx prisma migrate dev
npx prisma db seed          # creates your admin account from ADMIN_* env vars
npx tsx prisma/seed-demo.ts # optional: demo firm + clients + matters for testing

npm run dev
```

Generate a real `SESSION_SECRET` with `openssl rand -base64 32`.

`npx prisma db seed` is production-safe — it only creates the one admin
account from `ADMIN_EMAIL`/`ADMIN_PASSWORD`/`ADMIN_NAME`. The demo data
(fake clients, matters, documents) lives in `prisma/seed-demo.ts` and is
never wired to run automatically — run it manually for local testing only.

## Deploying to Railway

1. **Create the project**: New Project → Deploy from GitHub repo → pick
   this repo (push it to GitHub first if you haven't).
2. **Add Postgres**: New → Database → Add PostgreSQL. Railway sets
   `DATABASE_URL` on that service; reference it from your app service's
   variables as `${{Postgres.DATABASE_URL}}` (Railway's variable
   reference syntax) so both stay in sync.
3. **Add a Volume** (for uploaded documents — container disk is
   ephemeral otherwise): Settings → Volumes → New Volume, mount path
   e.g. `/data/uploads`. Set the app's `STORAGE_DIR` env var to that
   same path.
4. **Set environment variables** on the app service:
   - `DATABASE_URL` — reference to the Postgres service (step 2)
   - `SESSION_SECRET` — `openssl rand -base64 32`
   - `ADMIN_EMAIL`, `ADMIN_NAME` — your real admin login
   - `ADMIN_PASSWORD` — optional; a strong one is generated into the
     deploy logs if you omit it (check `railway logs` after first deploy)
   - `STORAGE_DIR` — the volume mount path from step 3
   - `RESEND_API_KEY`, `RESEND_FROM_EMAIL` — optional, for real
     "forgot password" emails instead of just server logs
5. **Deploy**. `npm run start` (see `package.json`) runs
   `prisma migrate deploy` before `next start` on every deploy, so
   schema changes apply automatically. The admin account is *not*
   created automatically — after the first deploy, run once:
   ```bash
   railway run npx prisma db seed
   ```
   (`railway run` executes locally against your Railway service's env
   vars — it's the standard way to run one-off commands like this.)
6. Sign in at your Railway-provided domain with the admin account from
   step 4, then use **New client** / **New matter** from the staff
   dashboard to onboard real clients.

`railway.json` in this repo pins the Nixpacks builder and a health check
on `/login`; no further Railway-side config should be needed.

## Architecture

```
src/
  app/
    login/, signup/, forgot-password/   auth pages (shared by staff + clients)
    portal/                              client-facing routes (role: CLIENT)
      matters/[id]/                       overview, documents (+ evidence upload), invoices, messages
    staff/                                staff-facing routes (role: STAFF | ADMIN)
      clients/new/, matters/new/          onboard clients and matters
      matters/[id]/                       manage access, uploads, retainer, messaging
    documents/[versionId]/                authenticated document download (checked per-request)
  actions/                               server actions (auth, clients, matters)
  lib/
    session.ts    dal.ts    prisma.ts    storage.ts    mail.ts    password.ts
  proxy.ts
prisma/
  schema.prisma
  seed.ts          production-safe: bootstraps one admin from env vars
  seed-demo.ts      dev-only: demo firm, clients, matters, documents, invoices
```

Every protected page re-verifies access via the DAL — `proxy.ts` only
does a cheap optimistic redirect on the session cookie.

## What's not built yet

- **Invoice creation UI**: invoices/lines can be created via Prisma
  today; there's no staff UI for it yet (only a read-only list).
- **E-signature, payments, calendar sync**: not implemented.
- **Task/event visibility toggles**: seeded/created with `visibleToClient`
  set correctly, but no staff UI to change it after creation (unlike
  documents, which do have a toggle).
- `npm audit` currently flags 4 high-severity advisories, all in
  Prisma's own CLI tooling dependencies (`mysql2`, `deepmerge-ts` via
  `@prisma/config`) — irrelevant to this Postgres-only app's runtime
  path, but worth re-checking against a future Prisma patch release.

## Commands

```bash
npm run dev      # start dev server (Turbopack)
npm run build    # production build
npm run lint     # eslint
npx prisma studio          # browse the database
npx prisma migrate dev     # create/apply a migration after schema changes
npx prisma db seed         # bootstrap/update the admin account
npx tsx prisma/seed-demo.ts  # local-only demo data
```
