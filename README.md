# OctaveCRM

OctaveCRM is a production-oriented SaaS scaffold for digital media marketing management. It is built for agencies and MSMEs that need multi-tenant campaign planning, AI-assisted content generation, approval workflows, inbox monitoring, integrations, scheduling, and analytics.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS, shadcn-style UI primitives
- PostgreSQL with Prisma
- NextAuth/Auth.js credentials flow and Prisma adapter
- Redis + BullMQ publishing queue scaffold
- Mock Paperclip AI agent adapter
- Mock Composio.dev integration adapter
- Docker and Docker Compose

## Safety Rules Implemented

- Tenant-owned models include `tenantId`.
- API reads and writes resolve tenant context before querying.
- AI agents only generate drafts, suggestions, summaries, and recommendations.
- Publishing verifies content status is `APPROVED` or `SCHEDULED`.
- Email/social sends use approved publishing paths only.
- Audit logs are written for AI generation, approvals, integrations, scheduling, and publishing.
- Secrets are read from environment variables only.

## Run Locally

```bash
npm install
cp .env.example .env
docker compose up -d postgres redis
npm run prisma:push
npm run seed
npm run dev
```

Open http://localhost:3003 locally, or http://38.247.188.228:3003 on the configured server.

Demo login:

- `owner@octavecrm.test`
- `OctaveDemo123!`

## Docker

```bash
docker compose up --build
```

The Compose file publishes the app on port `3003` and defaults `NEXTAUTH_URL` to:

```bash
http://38.247.188.228:3003
```

After the database is healthy, run migrations/seeding inside the app container:

```bash
docker compose exec app npx prisma db push
docker compose exec app npm run seed
```

The app container also runs those two commands automatically on startup. The seed is idempotent and skips once the demo tenant has data.

## Important Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection for BullMQ
- `NEXTAUTH_SECRET` - long random secret
- `PAPERCLIP_ENDPOINT` - external Paperclip agent endpoint when connected
- `LOCAL_LLM_ENDPOINT` - optional external local LLM endpoint
- `COMPOSIO_API_KEY` - Composio API key for real integration work
- `STORAGE_DRIVER` - `local` now, S3-compatible later

## Modules

- Dashboard
- Campaigns
- Content Studio
- Calendar
- Approvals
- Inbox
- Templates
- Analytics
- Clients
- Tasks
- Integrations
- AI Agents
- Settings
- Audit Logs

## Adapter Boundaries

`lib/adapters/paperclip.ts` is the Paperclip AI adapter. Replace mock calls with real Paperclip API calls there.

`lib/adapters/composio.ts` is the Composio integration adapter. Replace mock calls with real Composio SDK/actions there. Keep the approval checks in service code; external writes must not bypass them.

## API Highlights

- `GET /api/campaigns`
- `POST /api/campaigns`
- `GET /api/content`
- `POST /api/content/generate`
- `GET /api/approvals`
- `POST /api/approvals`
- `POST /api/content/schedule`
- `POST /api/publishing`
- `GET /api/inbox`
- `GET /api/integrations`
- `POST /api/composio/connect`
- `GET /api/analytics/mock`
- `GET /api/audit-logs`

## Notes

This is a working scaffold intended to be extended. External API calls are mocked intentionally until credentials, app approvals, and platform permissions are configured.
