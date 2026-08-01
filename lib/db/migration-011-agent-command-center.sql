-- Hutchrok Agent Command Center
-- Additive production migration: agent registry + task ledger.
-- No existing application table or policy is modified by this migration,
-- except fixing the search_path on the existing timestamp trigger function.

begin;

create table if not exists public.agent_definitions (
  agent_type text primary key,
  display_name text not null,
  description text not null,
  enabled boolean not null default false,
  default_model text not null default 'gpt-4.1-mini',
  agent_version text not null default '2026.08.01',
  requires_human_approval boolean not null default true,
  trigger_mode text not null default 'operator'
    check (trigger_mode in ('automatic', 'operator', 'scheduled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_tasks (
  id uuid primary key default gen_random_uuid(),
  agent_type text not null references public.agent_definitions(agent_type),
  subject_type text not null,
  subject_id uuid,
  idempotency_key text,
  status text not null default 'queued'
    check (status in (
      'queued',
      'running',
      'completed',
      'failed',
      'waiting_approval',
      'approved',
      'rejected',
      'cancelled'
    )),
  priority text not null default 'p2'
    check (priority in ('p0', 'p1', 'p2', 'p3')),
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  requires_approval boolean not null default true,
  approval_status text not null default 'pending'
    check (approval_status in ('not_required', 'pending', 'approved', 'rejected')),
  requested_by text not null default 'system',
  model text,
  agent_version text,
  trace_id text,
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  error_code text,
  error_message text,
  redaction_applied boolean not null default true,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_agent_tasks_idempotency
  on public.agent_tasks (agent_type, idempotency_key)
  where idempotency_key is not null;

create index if not exists idx_agent_tasks_status_created
  on public.agent_tasks (status, created_at desc);

create index if not exists idx_agent_tasks_subject
  on public.agent_tasks (subject_type, subject_id, created_at desc);

create index if not exists idx_agent_tasks_agent_created
  on public.agent_tasks (agent_type, created_at desc);

-- Pin the timestamp helper search path so callers cannot alter name resolution
-- through a mutable session search_path.
do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'update_updated_at_column'
      and pg_get_function_identity_arguments(p.oid) = ''
  ) then
    execute 'alter function public.update_updated_at_column() set search_path = public, pg_temp';
  end if;
end
$$;

drop trigger if exists set_agent_definitions_updated_at on public.agent_definitions;
create trigger set_agent_definitions_updated_at
before update on public.agent_definitions
for each row execute function public.update_updated_at_column();

drop trigger if exists set_agent_tasks_updated_at on public.agent_tasks;
create trigger set_agent_tasks_updated_at
before update on public.agent_tasks
for each row execute function public.update_updated_at_column();

insert into public.agent_definitions (
  agent_type,
  display_name,
  description,
  enabled,
  default_model,
  agent_version,
  requires_human_approval,
  trigger_mode
)
values
  (
    'intake_triage',
    'Intake Triage Agent',
    'Reviews veteran filing intakes for concrete readiness and eligibility risks.',
    true,
    'gpt-4.1-mini',
    '2026.08.01',
    false,
    'automatic'
  ),
  (
    'case_action_planner',
    'Case Action Planner',
    'Creates a recommendation-only operator plan for a filing case.',
    true,
    'gpt-4.1-mini',
    '2026.08.01',
    true,
    'operator'
  ),
  (
    'service_router',
    'Service Routing Agent',
    'Routes paid-service and consulting requests to the correct Hutchrok division.',
    true,
    'gpt-4.1-mini',
    '2026.08.01',
    true,
    'operator'
  ),
  (
    'compliance_review',
    'Compliance Review Agent',
    'Flags record conflicts, expirations, and missing corporate credentials for human review.',
    false,
    'gpt-4.1-mini',
    '2026.08.01',
    true,
    'scheduled'
  ),
  (
    'client_success_draft',
    'Client Success Drafting Agent',
    'Drafts factual client updates that require operator approval before sending.',
    false,
    'gpt-4.1-mini',
    '2026.08.01',
    true,
    'operator'
  ),
  (
    'executive_brief',
    'Executive Briefing Agent',
    'Summarizes verified pipeline facts, operational blockers, and recommended executive actions.',
    false,
    'gpt-4.1-mini',
    '2026.08.01',
    true,
    'scheduled'
  )
on conflict (agent_type) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  default_model = excluded.default_model,
  agent_version = excluded.agent_version,
  requires_human_approval = excluded.requires_human_approval,
  trigger_mode = excluded.trigger_mode,
  updated_at = now();

alter table public.agent_definitions enable row level security;
alter table public.agent_tasks enable row level security;

-- Server-only ledger. No anon/authenticated policy is intentionally created.
revoke all on table public.agent_definitions from public, anon, authenticated;
revoke all on table public.agent_tasks from public, anon, authenticated;
grant all on table public.agent_definitions to service_role;
grant all on table public.agent_tasks to service_role;

comment on table public.agent_definitions is
  'Hutchrok server-side registry for agent capabilities and approval boundaries.';
comment on table public.agent_tasks is
  'Hutchrok append-oriented agent task ledger. Inputs must be minimized/redacted; outputs are recommendations unless approved by a human.';
comment on column public.agent_tasks.input is
  'Minimized/redacted operational input. Never store API keys, bank data, full government identifiers, or raw private documents.';
comment on column public.agent_tasks.output is
  'Structured agent result. This is not an irreversible action or legal conclusion.';

commit;
