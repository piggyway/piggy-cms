# Deploy piggy-cms (Directus) to Cloudflare Containers

## Why Containers

Directus is a long-running Node process with WebSockets. It cannot run as a pure Worker. Cloudflare Containers run the existing Dockerfile behind a thin Worker router.

## Prerequisites

1. Docker Desktop (or compatible) running for image build on deploy
2. Neon (or other) Postgres reachable from the public internet / Hyperdrive is not used here - container talks to DB directly
3. `npx wrangler login`
4. Cloudflare account with Containers beta access

## Critical: uploads persistence

Container disk is **ephemeral**. Do not rely on `/directus/uploads` in production.

**Production uses Cloudflare R2** (S3-compatible driver):

Bucket: `piggy-cms-media`  
Public custom domain: `https://cdn.piggyway.com.au/{object-key}`  
Public r2.dev base (dev only): `https://pub-2853d48b8508467bbc376285288edbf1.r2.dev`

```
STORAGE_LOCATIONS=r2
STORAGE_R2_DRIVER=s3
STORAGE_R2_KEY=<R2 Access Key ID>
STORAGE_R2_SECRET=<R2 Secret Access Key>
STORAGE_R2_BUCKET=piggy-cms-media
STORAGE_R2_REGION=auto
STORAGE_R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
STORAGE_R2_FORCE_PATH_STYLE=true
```

Create R2 API token: Cloudflare Dashboard → R2 → Manage R2 API Tokens → Create API token  
(Object Read & Write on `piggy-cms-media`).

## 1. Install Worker deps

```bash
npm install
```

## 2. Configure database and secrets

Set container environment (Dashboard → Workers → piggy-cms → Settings / Containers), including:

| Variable | Example |
|----------|---------|
| `DB_CLIENT` | `pg` |
| `DB_HOST` | Neon host |
| `DB_PORT` | `5432` |
| `DB_DATABASE` | `neondb` |
| `DB_USER` | ... |
| `DB_PASSWORD` | ... |
| `DB_SSL` | `{"rejectUnauthorized":false}` |
| `SECRET` | long random |
| `ADMIN_EMAIL` | admin@... |
| `ADMIN_PASSWORD` | ... |
| `PUBLIC_URL` | `https://cms.piggyway.com.au` |
| `WEBSOCKETS_ENABLED` | `true` |

You can also extend `DirectusContainer.envVars` in `src/index.ts` for non-secrets.

## 3. Deploy

```bash
npm run deploy
# first deploy may take several minutes (image push + provision)
npx wrangler containers list
```

## 4. Custom domain

Attach `cms.piggyway.com.au` to the Worker.

`cdn.piggyway.com.au` is bound to the `piggy-cms-media` R2 bucket, not this Worker.
Do not add it back as a Worker custom domain or the next deploy will steal the hostname from R2.

Point Directus webhooks (boarding status) at the new backend URL with `DIRECTUS_WEBHOOK_TOKEN`.

## 5. Local Docker still works

```bash
docker compose up -d
```

Containers deploy is production path; compose remains for local CMS development.

## Limits / ops notes

- Containers are beta (no SLA)
- Cold start after `sleepAfter` (default 30m idle) is multi-second
- `max_instances = 2` in wrangler.toml - raise if needed
- Singleton name `main` keeps one primary Directus process
