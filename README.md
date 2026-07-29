# CreditCore — Deterministic Credit Policy & Decisioning Platform

CreditCore is a portfolio-grade deterministic credit policy and decisioning platform built to demonstrate explainable rule-based scoring, policy enforcement, assessment lifecycle management, API reliability patterns, and end-to-end observability in a simulated lending environment.

> **Scope:** CreditCore v1 is intentionally a deterministic decisioning system, not a Machine Learning credit-risk model. ML-based probability-of-default modeling is a future architecture extension and is not presented as a current capability.

## 1. Domain Context & Decisioning Pipeline

Credit decisions in lending systems often combine explicit policy constraints, explainable scoring criteria, human review, and auditable system behavior. CreditCore models that first-pass decisioning layer using deterministic rules.

```text
Input Assessment
      ↓
SLIK OJK Hard Gate
      ↓
Variable Normalization (0–100)
      ↓
Weighted Scoring (40 / 30 / 20 / 10)
      ↓
Credit Score (300–850)
      ↓
Decision Policy
 ┌───────────┼─────────────────┐
 ↓           ↓                 ↓
APPROVED  MANUAL_REVIEW     REJECTED
              ↓
         Risk Analyst
          ↙       ↘
     APPROVED   REJECTED
              ↓
      Audit / Observability
```

The platform is designed for **simulation and engineering demonstration**. It does not claim production lending outcomes, NPL reduction, or production-grade model accuracy.

## 2. Business Logic & Policy Engine

### SLIK OJK hard gate

- **Kolektibilitas 1:** sub-score 100; proceeds to weighted scoring.
- **Kolektibilitas 2:** sub-score 50; proceeds to weighted scoring.
- **Kolektibilitas 3–5:** hard reject, final score `300`, decision `REJECTED`, reason code `RC-OJK-COL3-5`.

### Variable normalization and weights

| Variable | Normalization | Weight |
| --- | --- | ---: |
| SLIK OJK Status | K1 = 100, K2 = 50, K3–5 = 0 | 40% |
| Monthly Income | capped at Rp50,000,000 = 100 | 30% |
| Employment Length | capped at 60 months = 100 | 20% |
| Number of Dependents | `100 - (dependents × 20)`, floor 0 | 10% |

The production engine computes:

```text
Credit Score =
300 + 5.5 × (
  0.40 × S_SLIK +
  0.30 × S_Income +
  0.20 × S_Employment +
  0.10 × S_Dependents
)
```

The result is bounded to `300–850`.

### Decision thresholds

| Credit Score | Risk Grade | Decision |
| ---: | --- | --- |
| 750–850 | Low | `APPROVED` |
| 600–749 | Medium | `MANUAL_REVIEW` |
| 300–599 | High | `REJECTED` |

`MANUAL_REVIEW` is non-final and can subsequently be updated to `APPROVED` or `REJECTED`.

## 3. Operational Personas

CreditCore models three operational personas:

- **Loan Officer** — submits assessments and reviews preliminary decision results.
- **Risk Analyst** — reviews explainability information and resolves manual-review cases.
- **Operations Administrator** — monitors API health, observability logs, runtime behavior, and operational controls.

Persona-aware UI behavior is a portfolio simulation of access boundaries; production authentication and server-enforced RBAC remain roadmap items until implemented and validated.

## 4. API & Reliability Engineering

The primary API contract is versioned under `/api/v1`.

Engineering patterns represented in the project include:

- REST/JSON API contracts.
- Request ID and Correlation ID propagation.
- Standardized success/error envelopes.
- Idempotency support for assessment creation.
- Rate limiting and controlled error simulation.
- Lightweight health probing.
- Structured observability logs.
- Runtime latency instrumentation through response metadata and `Server-Timing`.
- OpenAPI specification and Postman verification collection.

Legacy unversioned routes may remain for backward compatibility, while product-facing clients and current documentation target `/api/v1`.

## 5. Automated Testing

Executable Bun tests call the **actual production scoring/store implementation** in `src/lib/server/store.server.ts`; the tests do not duplicate or reimplement the scoring algorithm.

Current test coverage includes:

- locked scoring weights `40/30/20/10`;
- score bounds `300–850`;
- SLIK Kolektibilitas 3–5 hard gate;
- `APPROVED`, `MANUAL_REVIEW`, and `REJECTED` threshold routing;
- normalization boundary behavior;
- `MANUAL_REVIEW → APPROVED`;
- `MANUAL_REVIEW → REJECTED`;
- unknown-assessment lifecycle handling.

Run:

```bash
bun test
```

**Validation status:** the test suite is included and executable with Bun. Test execution must pass in the target development/CI environment before a release is tagged.

## 6. Performance & Claims Policy

Runtime latency is measured through API instrumentation and pre-deployment validation.

CreditCore deliberately makes **no unsupported production-performance claims**. In particular, this repository does not claim:

- production NPL reduction;
- sub-millisecond production latency;
- 100% production reliability or availability;
- 100% auditability under real banking workloads;
- ML model accuracy.

Performance statements should be derived from repeatable measurements after runtime stabilization and deployment.

## 7. Technology Stack

- **Frontend:** React, Tailwind CSS, shadcn/ui components.
- **Application routing/runtime:** TanStack Router / TanStack Start, Vite, TypeScript.
- **API & decision engine:** TypeScript server runtime.
- **Testing:** Bun test.
- **API documentation:** OpenAPI 3.0 and Postman.
- **Workflow integration:** n8n.
- **Containerization:** Docker / Docker Compose.

Current persistence is intentionally in-memory and therefore resets with the application process.

## 8. Current Status & Roadmap

### Implemented

- Deterministic policy/scoring engine.
- SLIK OJK hard gate.
- Weighted scoring and explainability breakdown.
- Assessment lifecycle and manual-review resolution.
- `/api/v1` contract.
- Idempotency and rate-limiting patterns.
- Health and observability surfaces.
- OpenAPI, Postman, n8n, and containerization artifacts.
- Executable production-engine test suite in this release candidate.

### Release gates in progress

- Runtime latency stabilization and repeated API verification.
- Full automated test execution in the target environment.
- PostgreSQL persistence through Supabase.
- Authentication and server-enforced RBAC.
- CI/CD and production deployment validation.

### Future architecture — not a v1 blocker

A future version may introduce a separate Python risk-model service (for example FastAPI + scikit-learn/LightGBM/XGBoost), model versioning, explainability such as SHAP, and drift monitoring. Those capabilities are roadmap items and are not represented as implemented functionality today.

## 9. Local Development

```bash
git clone https://github.com/khaerulanamm/CreditCore_Platform.git
cd CreditCore_Platform

# Install dependencies
npm install

# Start local development
npm run dev
```

The current local development configuration serves CreditCore on:

```text
http://localhost:8080
```

Health endpoint:

```text
GET http://localhost:8080/api/v1/health
```

For Bun-based automated tests:

```bash
bun test
```

## 10. Pre-Deployment Release Gate

Before deployment, verify all of the following:

```text
npm run build                         PASS
GET /api/v1/health                    stable across repeated probes
Business API Postman folder           PASS
Infrastructure API Postman folder     PASS
Manual Review → Approved              PASS
Manual Review → Rejected              PASS
Browser console                       no blocking errors
Bun automated tests                   PASS
Runtime latency                       measured and acceptable
```

Only after these checks pass should the release be tagged as deployment-ready.

---

**CreditCore is a portfolio engineering project using simulated lending data and deterministic policy rules. It is not a production banking system or a deployed credit-risk model.**
