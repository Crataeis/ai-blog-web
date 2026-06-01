# AI Daily Blog MVP

Production-minded MVP for an automated daily AI blog. The app ingests AI news and tool sources, deduplicates stories, generates a sourced draft article with OpenAI, inserts affiliate links, and lets an admin review before publishing.

## Stack

- Next.js 14 App Router with TypeScript
- Tailwind CSS
- PostgreSQL with Prisma
- NextAuth credentials login
- OpenAI API for article generation
- RSS/API ingestion plus GitHub trending and Hacker News fetchers
- Markdown rendering with `react-markdown`
- Vitest tests for core text, dedupe, and affiliate utilities

## Core Assumptions

- Generated articles are saved as drafts by default. Set `AUTO_PUBLISH=true` only if you are comfortable publishing automatically.
- The automation refuses to create an article when there are no source items.
- The OpenAI prompt instructs the model to use only collected source material. Admin review is still required for editorial quality.
- Product Hunt-style sources are modeled as RSS/custom sources for the MVP. If you have Product Hunt API credentials, add a dedicated fetcher in `lib/automation/fetchers.ts`.
- Semantic dedupe uses normalized title and token similarity locally. For higher recall, add embeddings and store vectors in PostgreSQL with pgvector.
- Sample affiliate URLs are placeholders. Replace them with approved affiliate or sponsor URLs before launch.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env`:

```bash
cp .env.example .env
```

3. Fill in:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/ai_daily_blog?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-long-random-secret"
OPENAI_API_KEY="sk-..."
CRON_SECRET="generate-a-long-random-token"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-me"
SITE_URL="http://localhost:3000"
AUTO_PUBLISH="false"
```

4. Create database tables and seed sample data:

```bash
npm run prisma:migrate -- --name init
npm run db:seed
```

5. Start local development:

```bash
npm run dev
```

Open `http://localhost:3000/admin` and log in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

## Daily Automation

Manual run from the dashboard:

- Go to `/admin`
- Click `Run now`
- Review the draft in `/admin/posts`

Cron endpoint:

```bash
curl -X POST http://localhost:3000/api/cron/daily \
  -H "Authorization: Bearer $CRON_SECRET"
```

Workflow:

1. Fetch active sources.
2. Deduplicate by URL, content hash, normalized title, and token similarity.
3. Generate a daily article from 5-10 source items.
4. Insert affiliate links for matching product mentions.
5. Append affiliate disclosure.
6. Save as draft, or publish if `AUTO_PUBLISH=true`.
7. Log the automation run.

## Admin Features

- `/admin` dashboard with metrics and manual automation run
- `/admin/posts` generated articles and statuses
- `/admin/posts/[id]` approve, edit, publish, or reject
- `/admin/affiliates` affiliate link manager
- `/admin/sources` content source manager
- `/admin/history` publishing and automation history

## Public Pages

- `/` homepage with latest posts
- `/blog` blog index
- `/blog/[slug]` article page
- `/tags/[tag]` tag pages
- `/affiliate-disclosure`
- `/privacy`
- `/contact`
- `/sitemap.xml`
- `/robots.txt`

## Quality and Safety

- Zod validation for admin forms and newsletter signup.
- Rate limiting on the cron API route.
- NextAuth protects admin pages.
- Server-side publish guard prevents publishing articles with no source items.
- OpenAI fallback creates a review-required draft when `OPENAI_API_KEY` is missing.
- Tests cover dedupe, similarity, and affiliate insertion.

Run checks:

```bash
npm run test
npm run lint
npm run build
```

## Vercel Deployment

1. Create a managed PostgreSQL database through Vercel Postgres, Neon, Supabase, or Railway.
2. Add the environment variables from `.env.example` in Vercel project settings.
3. Deploy the repo to Vercel.
4. Run Prisma migration against production:

```bash
npx prisma migrate deploy
npm run db:seed
```

5. Add a Vercel Cron Job that sends a daily `POST` to `/api/cron/daily` with:

```text
Authorization: Bearer <CRON_SECRET>
```

Vercel cron requests cannot set custom headers directly in every plan/config style. If needed, create a small secured scheduler service or adjust the endpoint to also accept a secret query parameter from Vercel cron.

## Next Steps

- Add pgvector embeddings for deeper semantic dedupe.
- Add Product Hunt API integration.
- Add editorial preview diffing and source confidence scoring.
- Add email provider integration for newsletter delivery.
- Add image generation or OG image generation for richer article sharing.
