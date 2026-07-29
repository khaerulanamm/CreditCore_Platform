# CreditCore Platform — Pre-Deployment Engineering Review

## Fixed
- Health probe uses the canonical `/api/v1/health` client and has an 8-second timeout.
- Health polling prevents overlapping requests and reports HEALTHY / UNHEALTHY / PROBING states.
- Removed the MutationObserver-based DOM translation mechanism that caused duplicated UI text.
- Observability Endpoint Playground now displays `/api/v1` on all business and infrastructure endpoint labels.
- Postman remains one collection and one local environment, organized into Business API, Infrastructure API, and cross-cutting verification folders.
- Added `Manual Review → Rejected` lifecycle request to complement `Manual Review → Approved`.
- Postman local `baseUrl` remains `http://localhost:8080`.

## Compatibility
Legacy unversioned server routes remain available only for backward compatibility. Product UI, API client, playground, documentation tests, and Postman target `/api/v1`.

## Required local release gate
1. `npm ci`
2. `npm run build`
3. `npm run dev`
4. Direct GET `http://localhost:8080/api/v1/health` must return promptly.
5. Leave Health page open for at least 60 seconds; multiple 15-second probes must remain stable.
6. Run the full Postman collection with `CreditCore Platform — Local`.
7. Browser console must contain no blocking runtime errors.
