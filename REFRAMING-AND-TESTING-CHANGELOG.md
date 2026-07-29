# Reframing & Testing Changelog

This release candidate:

- Reframes CreditCore as a **Deterministic Credit Policy & Decisioning Platform**.
- Removes unsupported claims about NPL reduction, sub-millisecond performance, production reliability, and production auditability.
- Documents the actual production scoring variables and weights: SLIK 40%, income 30%, employment 20%, dependents 10%.
- Documents the actual SLIK 3–5 hard gate and `RC-OJK-COL3-5`.
- Documents actual thresholds: 750+ approved, 600–749 manual review, below 600 rejected.
- Uses the actual personas: Loan Officer, Risk Analyst, Operations Administrator.
- Adds Bun tests that import the production scoring/store functions rather than duplicating the algorithm inside the test.
- Adds lifecycle tests for Manual Review → Approved and Manual Review → Rejected.
- Keeps PostgreSQL/Supabase, authentication/RBAC, CI/CD, deployment, and ML service work clearly marked as release gates/roadmap rather than completed capabilities.

Runtime caveat: Bun could not be executed inside the file-generation environment, so the tests are included as executable source but are not falsely marked as passing. They must pass locally/CI before release tagging.
