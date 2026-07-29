# QA Correction — Full i18n & Platform Branding

Corrections applied after UI review:

- Removed Lovable Dashboard from the Architecture client layer.
- Removed Lovable preview/error-reporting branding from application source and metadata.
- Client layer now identifies the CreditCore Web Dashboard, Postman, n8n, and external clients.
- EN/ID switching now applies to page body copy, labels, descriptions, cards, tables, error states, navigation, and major operational text—not only page titles.
- Technical protocol identifiers remain unchanged intentionally: endpoint paths, JSON keys, HTTP codes, APPROVED/MANUAL_REVIEW/REJECTED, Request ID, Correlation ID, reason codes, and formulas.
- Portfolio-facing About/footer naming no longer presents the application as a UAS/course application.

Note: the build tool dependency inherited from the original generator may still exist in package tooling if required by the current Vite configuration. It is not exposed as a client/product layer.
