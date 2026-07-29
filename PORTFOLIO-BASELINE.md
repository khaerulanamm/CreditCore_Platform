# CreditCore Platform — Portfolio Baseline

This repository baseline was prepared from the finalized CreditCore v2.4 source.

## Baseline status

- TanStack Start / TypeScript application
- Credit scoring business logic aligned
- Assessment lifecycle aligned
- API versioning, idempotency, rate limiting, observability and documentation retained
- No local `.env`, build output, `node_modules`, or Git metadata included
- Package identity normalized to `creditcore-platform`

## Next portfolio phases

1. EN / ID language switcher — implemented in this build
2. Supabase PostgreSQL persistence
3. Authentication and RBAC
4. Automated tests and reliability validation
5. CI/CD and deployment
6. Portfolio polish

## Run locally

```bash
npm install
npm run dev
```

Before production deployment, run the project's build/test scripts available in `package.json`.
