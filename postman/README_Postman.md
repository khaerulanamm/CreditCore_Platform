# CreditCore Platform — Postman

Use **one collection** and **one local environment** for the complete API surface.

- Collection: `postman/CreditCore_Platform.postman_collection.json`
- Environment: `postman/CreditCore_Local.postman_environment.json`
- Local `baseUrl`: `http://localhost:8080`

The collection is organized into Business API and Infrastructure API folders while sharing the same environment and `baseUrl`.

## Business API
- `POST /api/v1/assessments`
- `GET /api/v1/assessments`
- `GET /api/v1/assessments/:assessmentId`
- `GET /api/v1/credit-scores/:assessmentId`
- `PATCH /api/v1/assessments/:assessmentId/status`
- scoring cases: APPROVED, MANUAL_REVIEW, and SLIK hard-gate REJECTED

## Infrastructure API
- `GET /api/v1/health`
- `GET /api/v1/dashboard`
- `GET /api/v1/observability/logs`
- `GET /api/v1/simulation`
- `PUT /api/v1/simulation`

The collection also includes 400/404 contract checks. Start CreditCore with `npm run dev`, select **CreditCore Platform — Local**, then run the collection.
