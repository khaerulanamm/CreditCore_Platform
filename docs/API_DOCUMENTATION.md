# CreditCore — API contract reference

All paths are relative to `API_BASE_URL` (see `.env`).
Every response uses the standard envelope:

```json
{
  "success": true,
  "data": { "...": "..." },
  "error": null,
  "meta": {
    "requestId": "uuid",
    "correlationId": "uuid",
    "timestamp": "ISO-8601",
    "latencyMs": 12,
    "path": "/api/assessments",
    "method": "POST",
    "source": "Postman"
  }
}
```

Error responses set `success: false`, `data: null`, and populate `error`:

```json
{
  "success": false,
  "data": null,
  "error": { "code": "DATA_CONTRACT_VIOLATION", "message": "…", "details": null },
  "meta": { "...": "..." }
}
```

Every response also sets `X-Request-Id` and `X-Correlation-Id` headers.
When the client provides `X-Correlation-Id` (Postman, n8n, curl, browser
fetch) the same value is echoed back and stamped on the audit log — that
is the trace ID used across systems.

## Business API

### POST /api/assessments — 201 Created

Request body (flat, camelCase, no nested objects, no `apiVersion`, no `metadata`):

```json
{
  "accountId": "ACC-2026-0042",
  "borrowerName": "Anam Setiawan",
  "requestedAmount": 10000000,
  "monthlyIncome": 15000000,
  "employmentLengthMonths": 24,
  "purposeOfLoan": "Business Venture",
  "numberOfDependents": 2,
  "slikStatus": "Kolektibilitas 1"
}
```

`purposeOfLoan ∈ { Education, Business Venture, Home Renovation, Consumer Goods }`.

Response `data`:

```json
{
  "assessmentId": "ASM-2026-0013",
  "status": "Pending",
  "createdAt": "2026-07-11T09:12:03.412Z",
  "resource": "/api/assessments/ASM-2026-0013",
  "scoreResource": "/api/credit-scores/ASM-2026-0013"
}
```

### GET /api/assessments/:assessmentId — 200 OK

Returns the full assessment record including the computed score.

### GET /api/credit-scores/:assessmentId — 200 OK

```json
{
  "assessmentId": "ASM-2026-0013",
  "accountId": "ACC-2026-0042",
  "borrowerName": "Anam Setiawan",
  "assessmentStatus": "Completed",
  "assessmentTimestamp": "2026-07-11T09:12:03.412Z",
  "creditScore": 782,
  "riskGrade": "Low",
  "slikStatus": "Kolektibilitas 1",
  "decision": "Approved",
  "probabilityOfDefault": 0.04
}
```

### PATCH /api/assessments/:assessmentId/status — 200 OK

Body: `{ "status": "Pending" | "Scored" | "Completed" | "Failed" }`.

## Infrastructure API

- `GET  /api/health` → `{ status: "UP", service: "credit-scoring-engine", version, uptimeSince }`.
- `GET  /api/dashboard` → live metrics (see OpenAPI schema `DashboardEnvelope`).
- `GET  /api/observability/logs` → the immutable audit trail.
- `DELETE /api/observability/logs` → clear the audit trail (dev / demo).
- `GET  /api/simulation` → current `{ statusOverride, source }`.
- `PUT  /api/simulation` → mutate simulation. Body accepts either or both fields.

## Simulated failures

| Status | Code                      | Trigger                                                                    |
| ------ | ------------------------- | -------------------------------------------------------------------------- |
| 400    | `DATA_CONTRACT_VIOLATION` | Missing field, wrong type, nested object, or forbidden field.              |
| 401    | `UNAUTHORIZED`            | `statusOverride=401` on the simulation, or `X-Simulate-Status: 401`.       |
| 404    | `RESOURCE_NOT_FOUND`      | Unknown assessment ID, unknown `/api/*` path, or simulation override.      |
| 429    | `RATE_LIMIT_EXCEEDED`     | 9+ business requests within a rolling 10 s window, or simulation override. |
| 500    | `SYSTEM_FAILURE`          | Simulation override or per-request header.                                 |
| 503    | `SERVICE_UNAVAILABLE`     | Simulation override or per-request header.                                 |

`X-Simulate-Status: <code>` on a single request overrides the global setting
for that call only (useful in Postman / curl scripts).
