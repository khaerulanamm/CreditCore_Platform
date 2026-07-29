# Runtime Performance QA

## Engineering changes
- `/api/v1/health` is now a lightweight liveness endpoint and no longer depends on the simulation engine, rate limiter, in-memory assessment store, or audit-log pipeline.
- All API responses expose `Server-Timing: app;dur=<ms>` so client/network delay can be separated from application processing time.
- `/api/v1/observability/logs` no longer stores its own complete log-list response body, preventing recursive/ever-growing audit payloads.
- Client requests have bounded timeouts; Health uses 8 seconds.

## Local acceptance gate
With `npm run dev` running on port 8080:

1. `GET http://localhost:8080/api/v1/health`
   - expected HTTP 200
   - expected response in well under 1 second after warm-up
   - `Server-Timing` should normally be a few milliseconds
2. Keep System Health open for 60 seconds.
   - no permanent PROBING state
   - no duplicate text
   - status remains HEALTHY across repeated probes
3. Run the full Postman collection.
   - inspect both Postman response time and `Server-Timing`
   - if Postman reports ~120 s but `Server-Timing` is small, the delay is outside application business logic (client/network/dev-server transport)
4. Verify lifecycle:
   - create Manual Review assessment
   - PATCH Manual Review → Approved
   - create/reset Manual Review assessment
   - PATCH Manual Review → Rejected
5. Verify Observability:
   - `/api/v1` is displayed for all playground endpoints
   - logs remain responsive after repeated refreshes

Do not deploy until these checks pass.
