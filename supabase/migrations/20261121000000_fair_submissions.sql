begin;

create table public.fair_submissions (
  submission_id uuid primary key,
  created_at timestamptz not null default now(),

  full_name varchar(160) not null,
  identification varchar(32) not null,
  age smallint not null check (age between 1 and 120),
  phone varchar(32) not null,
  email varchar(254) not null,
  neighborhood varchar(160) not null,
  head_of_household text not null check (head_of_household in ('Sí', 'No')),

  business_name varchar(160) not null,
  products varchar(1200) not null,
  activities text[] not null check (cardinality(activities) between 1 and 9),
  other_activity varchar(160),
  operating_time text not null check (
    operating_time in (
      'Menos de 1 año', 'Entre 1 y 3 años', 'Entre 3 y 5 años', 'Más de 5 años'
    )
  ),
  team_size integer not null check (team_size between 0 and 99999),
  formalization text not null check (formalization in ('Sí', 'No', 'En proceso')),

  instagram varchar(254),
  facebook varchar(254),
  whatsapp varchar(254),
  notes varchar(1800),
  consent_version text not null,

  check (
    'Otro' <> all (activities)
    or nullif(btrim(other_activity), '') is not null
  )
);

alter table public.fair_submissions enable row level security;

revoke all on table public.fair_submissions
  from public, anon, authenticated, service_role;

grant select, insert on table public.fair_submissions to service_role;

commit;
