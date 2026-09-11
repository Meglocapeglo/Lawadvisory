# Lawadvisory Client Portal

A secure client portal for a law firm: clients sign in to see their own
matters, shared documents, invoices, and secure messages with staff; staff
sign in to manage matters, control what's visible to clients, upload
documents, and grant/revoke portal access per client.

## Origin

This was built from scratch on a modern stack rather than forking an
existing project directly, after evaluating [OpenLawOffice](https://github.com/NodineLegal/OpenLawOffice)
(Apache-2.0): its Matters/Contacts/Documents/Billing domain model was a
useful reference, but the codebase itself is unmaintained since 2016
(.NET Framework 4.5) and has no client-facing portal at all — only
internal case management. The Prisma schema here (`prisma/schema.prisma`)
is informed by that domain model, redesigned client-portal-first:
- Matter access is **opt-in per contact** (`MatterContact.portalAccess`),
  not implied by being listed on a matter.
- Documents, tasks, and events each carry an explicit `visibleToClient`
  flag — nothing is shared with a client by default.

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **Prisma 7** + PostgreSQL (via `@prisma/adapter-pg`)
- **Auth**: custom stateless sessions (signed JWT cookie via `jose`),
  following the [official Next.js authentication guide](https://nextjs.org/docs/app/guides/authentication) —
  no third-party auth library, matter access enforced in a Data Access
  Layer (`src/lib/dal.ts`), optimistic redirects in `src/proxy.ts`
  (Next 16 renamed `middleware.ts` to `proxy.ts`)
- **Tailwind CSS 4**
- Local filesystem document storage (`src/lib/storage.ts`) — swap for
  S3/R2 before handling real client documents in production; the
  interface (`saveFile` / `readStoredFile`, key in → buffer out) is
  deliberately storage-agnostic.

## Getting started

```bash
npm install

# Postgres running locally, then:
cp .env.example .env   # fill in DATABASE_URL and SESSION_SECRET
npx prisma migrate dev
npx prisma db seed

npm run dev
```

Generate a real `SESSION_SECRET` with `openssl rand -base64 32` — the
`.env.example` value is a placeholder only.

### Demo accounts (password: `password123`)

| Role | Email |
|---|---|
| Admin | admin@lawadvisory.test |
| Attorney (staff) | attorney@lawadvisory.test |
| Paralegal (staff) | paralegal@lawadvisory.test |
| Client | client@lawadvisory.test |
| Client (second matter) | client2@lawadvisory.test |

Staff and clients sign in at the same `/login` and land on `/staff` or
`/portal` respectively.

## Architecture

```
src/
  app/
    login/                    sign-in (shared by staff + clients)
    portal/                   client-facing routes (role: CLIENT)
      matters/[id]/            per-matter tabs: overview, documents, invoices, messages
    staff/                     staff-facing routes (role: STAFF | ADMIN)
      matters/[id]/            matter management: access grants, uploads, messaging
    documents/[versionId]/     authenticated document download (checked per-request)
  actions/                    server actions (login/logout, matter management)
  lib/
    session.ts                 JWT session encrypt/decrypt, cookie set/clear
    dal.ts                     verifySession / getCurrentUser / requireRole / requireMatterAccess
    prisma.ts                  Prisma client singleton (driver adapter)
    storage.ts                 file storage abstraction
  proxy.ts                    optimistic route redirects (real checks live in dal.ts)
prisma/
  schema.prisma                domain model
  seed.ts                      demo firm/staff/clients/matters/documents/invoices/messages
```

Every protected page re-verifies access via the DAL — `proxy.ts` only
does a cheap optimistic redirect on the session cookie, per Next.js's
own guidance not to rely on it as the only authorization check.

## What's not built yet

This is a working starting point, not a finished product. Before using
it with real client data:

- **Document storage**: swap `src/lib/storage.ts` for S3/R2 (interface
  is already storage-agnostic).
- **Invoice creation UI**: invoices/lines can be created via Prisma today;
  there's no staff UI for it yet (only a read-only list).
- **Password reset / account provisioning**: staff currently have no UI
  to create client logins; accounts are seeded directly.
- **E-signature, payments, calendar sync**: not implemented.
- **Task/event visibility toggles**: seeded with `visibleToClient` set
  correctly, but there's no staff UI to change it after creation (unlike
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
npx prisma studio         # browse the database
npx prisma migrate dev    # create/apply a migration after schema changes
```
