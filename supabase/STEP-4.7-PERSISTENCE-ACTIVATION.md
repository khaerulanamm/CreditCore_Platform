# Step 4.7 — Assessment Persistence Activation

Activated durable persistence for the versioned business API.

## Activated

- `POST /api/v1/assessments`
  - scoring remains in the existing deterministic engine;
  - assessment + credit score are persisted transactionally to PostgreSQL;
  - the existing HTTP response contract is preserved.
- `GET /api/v1/assessments`
  - reads durable assessments from PostgreSQL.
- `GET /api/v1/assessments/:assessmentId`
  - reads PostgreSQL first, with current-process fallback.
- `GET /api/v1/credit-scores/:assessmentId`
  - reads the durable assessment + score.
- `x-idempotency-key`
  - mapping is persisted after the assessment transaction succeeds.

## Still intentionally deferred

- PATCH lifecycle persistence
- audit-log persistence activation
- runtime-simulation persistence activation
- Auth/RBAC policies

These are separate regression gates.

## Acceptance test

1. Start CreditCore with the validated `.env.local`.
2. POST one assessment through Postman.
3. Confirm one row appears in `assessments` and one row in `credit_scores`.
4. GET the returned assessment and credit-score endpoints.
5. Stop and restart the app.
6. Repeat both GETs. They must still return the same persisted record.
