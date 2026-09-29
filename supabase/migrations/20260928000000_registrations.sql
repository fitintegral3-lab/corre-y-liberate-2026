-- Inscripciones de Corre y Liberate y comprobantes de pago.
--
-- Se corre una sola vez en Supabase > SQL Editor. Es idempotente en el bucket;
-- la tabla falla si ya existe, a proposito, para no pisar datos.
--
-- Seguridad: la tabla tiene RLS activado y NINGUNA politica. Eso significa que
-- la llave publicable no puede leer ni escribir nada: solo la llave secreta
-- (rol service_role, que salta RLS) desde el servidor de Next. Los datos son
-- sensibles (cedula, EPS, grupo sanguineo, enfermedades) y no deben quedar
-- expuestos a quien tenga la llave publica del sitio.

create table public.registrations (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  edition            smallint    not null,

  -- Revision del pago: la hace una persona mirando el comprobante.
  payment_status     text        not null default 'pendiente'
                     check (payment_status in ('pendiente', 'aprobado', 'rechazado')),
  bib_number         integer,

  distance_id        text        not null,
  category           text        not null,
  gender             text        not null check (gender in ('femenino', 'masculino')),
  first_name         text        not null,
  last_name          text        not null,
  email              text        not null,
  city               text,
  birth_date         date        not null,
  cedula             text        not null,
  phone              text        not null,
  eps                text        not null,
  blood_type         text        not null,
  team               text,
  shirt_size         text        not null,
  emergency_name     text        not null,
  emergency_phone    text        not null,
  recent_competition boolean     not null,
  has_illness        boolean     not null,
  medical_condition  text,
  observation        text,

  accepted_terms_at  timestamptz not null,
  terms_version      text        not null,

  phase_id           text        not null,
  referral_code      text,
  base_price         integer     not null,
  total              integer     not null,
  receipt_path       text        not null,

  -- La cedula es "dato unico entre todos los participantes", por edicion.
  unique (edition, cedula)
);

alter table public.registrations enable row level security;

create index registrations_created_at_idx on public.registrations (created_at);
create index registrations_referral_code_idx on public.registrations (referral_code);

-- Bucket privado para los comprobantes. El limite de 5 MB y los tipos
-- permitidos los aplica Supabase al subir, no solo el formulario.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'comprobantes',
  'comprobantes',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;
