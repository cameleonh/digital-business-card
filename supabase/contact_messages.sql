create extension if not exists pgcrypto;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  source text not null default 'digital-business-card',
  user_agent text,
  referrer text,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_submitted_at_idx
  on public.contact_messages (submitted_at desc);

alter table public.contact_messages enable row level security;
