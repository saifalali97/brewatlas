-- Contact form inbox: persisted server-side via service role (no public PostgREST access).

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index contact_messages_email_idx on public.contact_messages (email);

alter table public.contact_messages enable row level security;

create policy "Admins can read contact messages"
  on public.contact_messages
  for select
  using (public.is_admin());
