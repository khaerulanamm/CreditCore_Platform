# Step 4.8 — Lifecycle Status Persistence Activation

Activated durable persistence for the assessment lifecycle-status transition
on the versioned business API. This closes the gap called out in Step 4.7
("PATCH lifecycle persistence" — previously deferred).

## Activated

- `PATCH /api/v1/assessments/:assessmentId/status`
  - current status is read from PostgreSQL (with current-process fallback),
    matching the existing `GET /api/v1/assessments/:assessmentId` pattern;
  - the lifecycle transition is validated before any write;
  - on success, the new status and `updated_at` are persisted to the
    existing `assessments` table via `persistAssessmentStatus` (already
    implemented in `postgres.server.ts` since Step 4.6/4.7 — this step
    wires it into the route);
  - the existing HTTP response contract (`200` body shape) is preserved;
  - no schema changes; no new tables; no migrations.

## Business rule enforced

```
MANUAL_REVIEW ──► APPROVED
MANUAL_REVIEW ──► REJECTED
```

`APPROVED` and `REJECTED` are terminal: a request to move a terminal
assessment to a different status now returns `409 Conflict`
(`INVALID_STATUS_TRANSITION`). Re-submitting the same terminal status is
treated as an idempotent replay and still returns `200`.

## Not changed

- Scoring engine (40/30/20/10 weighting, SLIK hard gate)
- OpenAPI spec, Postman collection, README
- Docker/observability/health
- UI behavior (the UI does not call this endpoint)
- The legacy, non-versioned `/api/assessments/:assessmentId/status` route —
  left on its original frozen in-memory-only behavior, unchanged.

## Acceptance test

1. `POST /api/v1/assessments` → resulting status is `MANUAL_REVIEW`.
2. `PATCH .../status` with `APPROVED` → `200`, status updated in Supabase.
3. Restart the server.
4. `GET /api/v1/assessments/:assessmentId` → status is still `APPROVED`.
5. `PATCH .../status` with `REJECTED` on the now-`APPROVED` assessment →
   `409 Conflict`.
