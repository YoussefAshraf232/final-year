# Inflow

Inflow is a Next.js frontend with a Spring Boot 4 backend for warehouse / inventory management.

## Quick Start With Docker

Copy `.env.example` to `.env`, replace `INFLOW_JWT_SECRET` with a generated secret, then run:

```bash
openssl rand -base64 48
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:9090`
- Postgres: `localhost:5432`

The first backend start runs Flyway and seeds `admin@inflow.local` / `Admin@12345`. Rotate that password before any shared demo or deployment.

## Prerequisites

- Node.js 20+
- Java 21
- PostgreSQL 15+
- Maven (the bundled wrapper works: `mvnw` / `mvnw.cmd`)

## Environment

Frontend `.env.local` (root of repo):

```bash
NEXT_PUBLIC_API_URL=http://localhost:9090
NEXT_PUBLIC_ENABLE_GUEST_MODE=false
```

Backend environment (export these before `mvnw spring-boot:run`):

```bash
INFLOW_DB_URL=jdbc:postgresql://localhost:5433/inflow_db
INFLOW_DB_USERNAME=postgres
INFLOW_DB_PASSWORD=123456
INFLOW_JWT_SECRET=<generate, see below>
INFLOW_ALLOWED_ORIGINS=http://localhost:3000
```

`INFLOW_JWT_SECRET` is **required**. It must be a strong HMAC secret of at least 32 bytes. Generate one:

```bash
# any of these is fine
openssl rand -base64 48
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

## Database setup

Create an empty database, then let Flyway populate it on first run:

```bash
createdb -p 5433 -U postgres inflow_db
```

Flyway migrations under `inflow-backend/src/main/resources/db/migration/` will:

- `V1__init_schema.sql` — create all tables
- `V2__seed_roles_and_admin.sql` — seed three canonical roles (`SYSTEM_ADMIN`, `OPERATIONAL_MANAGER`, `WAREHOUSE_MANAGER`) and a default admin user

**Default admin credentials (rotate before any deployment):**

- email: `admin@inflow.local`
- password: `Admin@12345`

To rotate, generate a new bcrypt hash and replace it in the migration:

```bash
python3 -c "import bcrypt; print(bcrypt.hashpw(b'<new-password>', bcrypt.gensalt(rounds=12)).decode())"
```

## Run

Backend:

```bash
cd inflow-backend
./mvnw spring-boot:run     # macOS/Linux
.\mvnw.cmd spring-boot:run # Windows
```

Frontend:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and sign in as `admin@inflow.local` / `Admin@12345`.

## Verify

```bash
npm run lint
npm run typecheck
npm run test
npm run build

cd inflow-backend
./mvnw test
./mvnw clean install
```

## Troubleshooting

- **Login returns 401 on a fresh DB.** The seed migration didn't run. Confirm `flyway_schema_history` contains rows for V1 and V2.
- **"INFLOW_JWT_SECRET must be configured".** Set the env var (see above) — the backend refuses to start without it.
- **Port mismatch.** Backend defaults to `5432` but `application-dev.properties` overrides to `5433`. The active profile is `dev`. Match `INFLOW_DB_URL` to whichever Postgres you are running.
- **CORS error in browser console.** Add your frontend origin to `INFLOW_ALLOWED_ORIGINS` (comma-separated for multiple).

## Production checklist

See `SECURITY.md`. In particular:

- [ ] Rotate the seed admin password and the bcrypt hash in `V2__seed_roles_and_admin.sql`
- [ ] Generate a fresh `INFLOW_JWT_SECRET`
- [ ] Set `NEXT_PUBLIC_ENABLE_GUEST_MODE=false`
- [ ] Set `INFLOW_ALLOWED_ORIGINS` to your real frontend host(s) only
- [ ] Terminate HTTPS at the reverse proxy

## Production Notes

Run the containers behind Nginx, Caddy, or a managed platform router. Terminate HTTPS at that proxy, enable HSTS, and forward `X-Forwarded-*` headers to the backend.

Set production env vars explicitly:

```bash
INFLOW_DB_URL=jdbc:postgresql://<db-host>:5432/inflow_db
INFLOW_DB_USERNAME=<user>
INFLOW_DB_PASSWORD=<password>
INFLOW_JWT_SECRET=<fresh 32+ byte secret>
INFLOW_ALLOWED_ORIGINS=https://your-frontend.example
NEXT_PUBLIC_API_URL=https://your-api.example
NEXT_PUBLIC_ENABLE_GUEST_MODE=false
```

For a simple database backup during defense demos:

```bash
docker compose exec db pg_dump -U postgres inflow_db > inflow_backup.sql
```
