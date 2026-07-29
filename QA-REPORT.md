# CreditCore Platform — QA Handoff

## Completed checks

- Project structure and package metadata validated.
- EN/ID global language switcher present with persisted language preference.
- Portfolio identity normalized to CreditCore Platform on product surfaces.
- Scoring source-of-truth statically verified: SLIK 40%, income 30%, employment 20%, dependents 10%, thresholds 750/600, SLIK 3–5 hard gate.
- Versioned `/api/v1` routes verified in generated route tree.
- Idempotency 24-hour record and rate-limit implementation retained.
- Postman artifacts rebuilt and renamed for CreditCore Platform; JSON validated.
- Postman collection includes health, dashboard, assessment CRUD/read, score, lifecycle status, approved/manual-review/hard-gate cases, observability, simulation, 400 and 404 error contract checks.
- n8n workflow renamed to CreditCore Platform; JSON validated.
- Local secret `.env`, node_modules, build outputs and old Git metadata excluded from deliverable.

## Environment limitation

Dependency installation (`npm ci` / `npm install`) could not complete inside the hosted execution environment because the package installation process timed out. Therefore a successful runtime/build test is NOT claimed in this report. Run `npm install`, `npm run build`, and `npm run dev` on a normal networked local machine before deployment.
