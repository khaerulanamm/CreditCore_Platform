-- CreditCore Platform
-- Step 4.2: PostgreSQL persistence schema
-- Scope: persistence only. Business rules remain in the frozen TypeScript scoring engine.

create extension if not exists pgcrypto;

create table if not exists public.assessments (
  assessment_id text primary key,
  account_id text not null,
  borrower_name text not null,
  requested_amount bigint not null check (requested_amount >= 0),
  monthly_income bigint not null check (monthly_income >= 0),
  employment_length_months integer not null check (employment_length_months >= 0),
  purpose_of_loan text not null,
  number_of_dependents integer not null check (number_of_dependents >= 0),
  slik_status text not null check (
    slik_status in (
      'Kolektibilitas 1','Kolektibilitas 2','Kolektibilitas 3',
      'Kolektibilitas 4','Kolektibilitas 5'
    )
  ),
  status text not null check (
    status in ('SUBMITTED','SCORING','MANUAL_REVIEW','APPROVED','REJECTED','FAILED')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_scores (
  assessment_id text primary key references public.assessments(assessment_id) on delete cascade,
  credit_score integer not null check (credit_score between 300 and 850),
  risk_grade text not null check (risk_grade in ('Low','Medium','High')),
  slik_status text not null,
  decision text not null check (decision in ('APPROVED','MANUAL_REVIEW','REJECTED')),
  probability_of_default double precision not null check (probability_of_default between 0 and 1),
  reason_code text not null check (
    reason_code in ('RC-001','RC-002','RC-003','RC-OJK-COL3-5')
  ),
  reason text not null,
  hard_gate_applied boolean not null default false,
  breakdown jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  request_id text not null,
  correlation_id text not null,
  timestamp timestamptz not null default now(),
  method text not null,
  path text not null,
  status integer not null check (status between 100 and 599),
  latency_ms integer not null check (latency_ms >= 0),
  source text not null,
  client_type text not null,
  user_agent text not null default '',
  response_type text not null default 'json',
  request_headers jsonb not null default '{}'::jsonb,
  request_body jsonb,
  response_headers jsonb not null default '{}'::jsonb,
  response_body jsonb,
  error_message text
);

create table if not exists public.idempotency_keys (
  idempotency_key text primary key,
  assessment_id text not null references public.assessments(assessment_id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Simulation is operational configuration, not business assessment data.
create table if not exists public.runtime_simulation (
  singleton boolean primary key default true check (singleton = true),
  status_override text not null default 'none'
    check (status_override in ('none','400','401','404','429','500','503')),
  source text not null default 'Web Server',
  updated_at timestamptz not null default now()
);

insert into public.runtime_simulation (singleton, status_override, source)
values (true, 'none', 'Web Server')
on conflict (singleton) do nothing;

-- Query paths used by dashboard, assessment lookup, observability and troubleshooting.
create index if not exists idx_assessments_account_id on public.assessments(account_id);
create index if not exists idx_assessments_status on public.assessments(status);
create index if not exists idx_assessments_created_at on public.assessments(created_at desc);
create index if not exists idx_credit_scores_decision on public.credit_scores(decision);
create index if not exists idx_credit_scores_risk_grade on public.credit_scores(risk_grade);
create index if not exists idx_audit_logs_timestamp on public.audit_logs(timestamp desc);
create index if not exists idx_audit_logs_correlation_id on public.audit_logs(correlation_id);
create index if not exists idx_audit_logs_request_id on public.audit_logs(request_id);
create index if not exists idx_audit_logs_status on public.audit_logs(status);

comment on table public.assessments is 'Credit application assessment and lifecycle state.';
comment on table public.credit_scores is 'Immutable-at-creation scoring result plus explainability breakdown; lifecycle review status remains on assessments.';
comment on table public.audit_logs is 'Operational API audit and observability events.';
comment on table public.idempotency_keys is 'Server-side idempotency mapping for assessment creation.';
