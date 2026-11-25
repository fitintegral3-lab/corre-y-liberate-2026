begin;

-- Una respuesta por inscripción: solo la llena quien se inscribió en la edición.
create table public.experience_survey_responses (
  submission_id uuid primary key,
  created_at timestamptz not null default now(),
  registration_id uuid not null unique references public.registrations (id),

  overall smallint not null check (overall between 1 and 5),
  organization smallint not null check (organization between 1 and 5),
  route smallint not null check (route between 1 and 5),
  hydration smallint not null check (hydration between 1 and 5),
  finish_area smallint not null check (finish_area between 1 and 5),

  liked_most varchar(1200) not null,
  improve varchar(1200) not null,
  return_intent text not null check (
    return_intent in ('Sí, definitivamente', 'Probablemente sí', 'No estoy seguro/a', 'No')
  ),
  recommend smallint check (recommend between 0 and 10),
  survey_version text not null
);

alter table public.experience_survey_responses enable row level security;

revoke all on table public.experience_survey_responses
  from public, anon, authenticated, service_role;

grant select, insert on table public.experience_survey_responses to service_role;

commit;
