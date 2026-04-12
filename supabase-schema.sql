-- ══════════════════════════════════════════════════════════════════════════════
--  CTA Logistics — Supabase Schema
--  Run this in your Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════════════════

create table if not exists public.missions (
  id                  bigserial primary key,
  mission_id          text        not null unique,
  client_id           text        not null,

  -- Itinéraire
  depart              text        not null,
  arrivee             text        not null,
  depart_dept         text,
  arrivee_dept        text,
  distance            integer,
  duree               integer,

  -- Sécurité
  pin_hash            text,
  pin_required        boolean     default false,

  -- Planning
  collecte_date       date,
  collecte_slot       text,
  livraison_date      date,
  livraison_slot      text,

  -- Actif
  asset_value         numeric(12,2),
  asset_description   text,

  -- Contacts
  contact_expediteur  text,
  contact_destinataire text,
  notes               text,

  -- Options
  options_labels      text[],

  -- Tarification
  tarif_base          numeric(10,2),
  tarif_ht            numeric(10,2),
  tarif_tva           numeric(10,2),
  tarif_ttc           numeric(10,2),
  is_idf              boolean     default true,
  garantie            text,

  -- État
  step                integer     default 1,
  pin_verified        boolean     default false,
  photo_chargement    text,         -- base64 or URL
  photo_remise        text,

  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- Row Level Security
alter table public.missions enable row level security;

-- Policy : clients can read their own missions
create policy "Client read own missions"
  on public.missions for select
  using (true);  -- Adjust with auth.uid() if using Supabase Auth

-- Policy : anyone can insert (adjust for production)
create policy "Insert missions"
  on public.missions for insert
  with check (true);

-- Policy : update by mission_id
create policy "Update missions"
  on public.missions for update
  using (true);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger missions_updated_at
  before update on public.missions
  for each row execute function update_updated_at();

-- Index for fast client lookups
create index if not exists idx_missions_client_id on public.missions (client_id);
create index if not exists idx_missions_mission_id on public.missions (mission_id);
