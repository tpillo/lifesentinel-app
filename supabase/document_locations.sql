-- Run this in the Supabase SQL editor.

create table if not exists document_locations (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  readiness_document_id uuid references readiness_documents(id) on delete set null,
  document_type         text not null,
  location_description  text not null,
  access_instructions   text,
  contact_person        text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Index for the common query pattern
create index if not exists document_locations_user_id_idx
  on document_locations (user_id);

create index if not exists document_locations_readiness_doc_idx
  on document_locations (readiness_document_id)
  where readiness_document_id is not null;

-- RLS: owner full access
alter table document_locations enable row level security;

create policy "Owner full access to document_locations"
  on document_locations
  for all
  to authenticated
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Guardian read access: allow read when a valid, non-revoked, non-expired
-- guardian_link exists for the owner.  Guardian routes use supabaseAdmin
-- (service role) and enforce ownership at the application layer, so this
-- policy is a belt-and-suspenders guard for any future RLS-based guardian
-- queries.
create policy "Guardian read access to document_locations"
  on document_locations
  for select
  to authenticated
  using (
    exists (
      select 1
      from   guardian_links gl
      where  gl.owner_user_id = document_locations.user_id
        and  gl.revoked_at    is null
        and  gl.expires_at    > now()
    )
  );
