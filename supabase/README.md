# CreditCore Supabase Persistence

## Step 4.2 — Schema Design

This folder contains the PostgreSQL schema for CreditCore persistence.

### Tables

- `assessments` — application data and lifecycle state.
- `credit_scores` — deterministic score result and explainability breakdown.
- `audit_logs` — Request ID / Correlation ID operational audit events.
- `idempotency_keys` — durable idempotency state.
- `runtime_simulation` — singleton operational simulation configuration.

### Design boundary

The database does **not** calculate the credit score. The frozen TypeScript production engine remains the single source of truth for:

- SLIK hard gate;
- 40/30/20/10 weighting;
- 300–850 score mapping;
- risk grade;
- decision thresholds;
- reason codes.

PostgreSQL persists the resulting state.

### Why `credit_scores` is separate

Assessment lifecycle can change after scoring (for example `MANUAL_REVIEW → APPROVED`) while the deterministic score that caused manual review should remain independently traceable.

### Why JSONB for `breakdown`

The explainability structure is naturally nested. JSONB preserves the exact scoring breakdown without spreading stable business entities across many low-value tables.

### Security note

No database password or service-role key belongs in Git. Secrets will be provided through environment variables in the connection step.
