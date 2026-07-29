-- CreditCore database security gate.
-- Browser/Data API access is intentionally denied until explicit Auth/RBAC policies exist.
alter table public.assessments enable row level security;
alter table public.credit_scores enable row level security;
alter table public.audit_logs enable row level security;
alter table public.idempotency_keys enable row level security;
alter table public.runtime_simulation enable row level security;
