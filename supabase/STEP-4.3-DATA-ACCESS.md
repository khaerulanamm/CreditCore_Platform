# Step 4.3 — Server-Side Data Access

## Executed

CreditCore now includes:

- `drizzle-orm` for typed SQL/data mapping;
- `postgres` (`postgres-js`) as the PostgreSQL driver;
- `drizzle-kit` for schema/migration tooling;
- a server-only lazy database client;
- typed Drizzle table definitions matching the Step 4.2 SQL migration;
- a repository contract that isolates persistence from business logic.

## Why this approach

CreditCore already owns its business logic in TypeScript. Drizzle is used only as a persistence/data-access layer. The scoring engine is not moved into the ORM or database.

The database connection is lazy so the existing build/test baseline does not suddenly require a live Supabase database merely because the DB module exists.

`prepare: false` is intentional for compatibility with Supabase transaction pooler configurations.

## Frozen behavior

This step does **not** activate PostgreSQL persistence yet. Existing API routes still use the previously validated in-memory behavior. Activation occurs only after the PostgreSQL repository is implemented and regression-tested.

## Next

Step 4.4: configure `DATABASE_URL` locally and verify a secure connection to the user's Supabase project.
