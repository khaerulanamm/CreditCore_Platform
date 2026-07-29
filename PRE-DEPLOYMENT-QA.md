# CreditCore Platform — Pre-Deployment QA

## Fixed in this revision
- Health page uses the canonical `getHealth()` client -> `GET /api/v1/health`.
- Health status card no longer renders duplicated `HTTP` text. It now shows `Status code: 200 OK`.
- Health probe auto-refresh remains 15 seconds and reports network/API errors explicitly.
- Postman is consolidated into one collection covering both Business API and Infrastructure API.
- Postman uses one local environment with `baseUrl=http://localhost:8080`.
- Split Business/Infrastructure environment files were removed to prevent environment mismatch.
- Postman JSON artifacts parse successfully.

## Static verification
- Canonical UI/API client calls `/api/v1/health`.
- No stale `/api/health` client call remains; the legacy server route is retained only for backward compatibility.
- Postman collection and environment are valid JSON.
- Local secrets and `node_modules` are excluded from the handoff archive.

## Runtime verification status
Dependency installation (`npm ci`) could not complete inside the sandbox because the package install timed out. Therefore a fresh build/runtime suite could not be honestly certified here. Before deployment, run locally:

```bash
npm ci
npm run build
npm run dev
```

Then run the complete Postman collection using `CreditCore Platform — Local` and confirm all tests pass before deployment.
