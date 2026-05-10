# Invoice Service

Small service that accepts invoice data, stores the request, builds a PDF invoice, and emails it to a customer.

## Stack

- Node.js + TypeScript
- PostgreSQL
- Redis + BullMQ
- SMTP (Moosend or local Mailhog)
- PDF via html-pdf-node
- OpenAPI via Swagger UI

## Getting started

### Prerequisites (Windows)

- Install Docker Desktop and make sure it is running.
- Use **Linux containers** (this project uses Linux base images).

If you see this error:

```
failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine
```

it means Docker Desktop is not running or it is not exposing the Linux engine.
Try:

1. Start Docker Desktop.
2. Docker Desktop tray icon → **Switch to Linux containers…** (if available).
3. Verify engine connectivity:

```bash
docker info
```

### Run everything in Docker

This repo includes a `docker-compose.yml` that starts the full stack:

- API (Swagger UI on `/docs`)
- PDF + Email workers (BullMQ)
- PostgreSQL + Redis
- Mailhog (SMTP + UI)

```bash
docker compose up -d --build
```

PostgreSQL schema is automatically applied on the first start (via `sql/schema.sql`).
If you already have an existing `postgres_data` volume, the init script will not re-run.
In that case you can either apply the schema manually or recreate the volume.

### Run locally (without Docker)

1. Start infrastructure

```bash
docker compose up -d postgres redis mailhog
```

2. Create tables

```bash
psql "postgresql://invoice_user:invoice_pass@localhost:5432/invoices" -f sql/schema.sql
```

3. Install deps

```bash
npm install
```

4. Configure env

```bash
copy .env.example .env
```

5. Run API

```bash
npm run dev
```

6. Run workers (in another terminal)

```bash
npm run start:workers
```

Swagger UI is available at http://localhost:3000/docs
Mailhog UI is available at http://localhost:8025

## Example request

```bash
curl -X POST http://localhost:3000/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.com",
    "items": [
      {"description": "Design work", "amount": 1500},
      {"description": "Development", "amount": 2500}
    ]
  }'
```

## Notes

- For local tests, keep Mailhog running and set `SMTP_HOST=localhost`, `SMTP_PORT=1025`.
- For Moosend (or any SMTP provider), fill `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` from the provider dashboard.

## Suggested seed data

Insert a client and company before testing:

```sql
INSERT INTO companies (name, address, city, country, tax_id)
VALUES ('Acme LLC', '100 Market St', 'Springfield', 'US', 'TAX-001');

INSERT INTO clients (email, first_name, last_name, company_id)
VALUES ('client@example.com', 'Alice', 'Smith', 1);
```
