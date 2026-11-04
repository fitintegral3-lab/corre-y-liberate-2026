-- Aplicar ANTES de desplegar la lógica de inventario.
-- Saldos finales VERDES confirmados el 2026-11-03: mujer 100, hombre 52.
-- Ya incluyen el descuento histórico: NO volver a restar las inscripciones.
begin;
lock table public.registrations in share row exclusive mode;

create table public.shirt_inventory (
  edition smallint not null,
  gender text not null check (gender in ('femenino', 'masculino')),
  shirt_size text not null check (shirt_size in (
    'Extra Small (XS)', 'Small (S)', 'Medium (M)', 'Large (L)',
    'Extra Large (XL)', 'Extra Extra Large (XXL)'
  )),
  total integer not null check (total >= 0),
  initial_available integer not null check (initial_available >= 0),
  reserved integer not null default 0 check (reserved >= 0),
  primary key (edition, gender, shirt_size)
);
alter table public.shirt_inventory enable row level security;

create table public.shirt_stock_alerts (
  id uuid primary key default gen_random_uuid(),
  edition smallint not null,
  gender text not null,
  shirt_size text not null,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  cancelled_at timestamptz,
  claimed_until timestamptz,
  claim_token uuid,
  foreign key (edition, gender, shirt_size)
    references public.shirt_inventory (edition, gender, shirt_size)
);
alter table public.shirt_stock_alerts enable row level security;
create unique index shirt_stock_alerts_pending_idx
  on public.shirt_stock_alerts (edition, gender, shirt_size)
  where sent_at is null and cancelled_at is null;

insert into public.shirt_inventory (edition, gender, shirt_size, total, initial_available)
select 2, gender, size, available, available from (values
  ('femenino', 'Extra Small (XS)', 1),
  ('femenino', 'Small (S)', 18),
  ('femenino', 'Medium (M)', 56),
  ('femenino', 'Large (L)', 18),
  ('femenino', 'Extra Large (XL)', 7),
  ('femenino', 'Extra Extra Large (XXL)', 0),
  ('masculino', 'Extra Small (XS)', 0),
  ('masculino', 'Small (S)', 0),
  ('masculino', 'Medium (M)', 15),
  ('masculino', 'Large (L)', 26),
  ('masculino', 'Extra Large (XL)', 9),
  ('masculino', 'Extra Extra Large (XXL)', 2)
) as stock(gender, size, available);

-- Base contable = saldo verde + reservas de los registros que ya existen.
-- Así total - reserved conserva EXACTAMENTE el saldo verde al activar.
update public.shirt_inventory i set reserved = (
  select count(*) from public.registrations r
  where r.edition = i.edition and r.gender = i.gender and r.shirt_size = i.shirt_size
    and r.payment_status in ('pendiente', 'aprobado')
);
update public.shirt_inventory set total = initial_available + reserved;

-- Reservas externas: estas personas aún NO están inscritas. Se asignan por cédula.
-- Sus inscripciones no consumen el saldo verde (confirmado por la organización).
create table public.shirt_reservations (
  id uuid primary key default gen_random_uuid(),
  edition smallint not null,
  gender text not null,
  shirt_size text not null,
  cedula text check (cedula ~ '^[0-9A-Z]{5,15}$'),
  unique (edition, cedula),
  foreign key (edition, gender, shirt_size)
    references public.shirt_inventory (edition, gender, shirt_size)
);
alter table public.shirt_reservations enable row level security;
insert into public.shirt_reservations (edition, gender, shirt_size)
select 2, gender, size from (values
  ('femenino', 'Extra Small (XS)', 2),
  ('femenino', 'Small (S)', 3),
  ('femenino', 'Medium (M)', 7),
  ('femenino', 'Large (L)', 1),
  ('femenino', 'Extra Large (XL)', 1),
  ('masculino', 'Large (L)', 2),
  ('masculino', 'Extra Large (XL)', 2),
  ('masculino', 'Extra Extra Large (XXL)', 2)
) as holds(gender, size, quantity)
cross join lateral generate_series(1, quantity);
alter table public.registrations add column shirt_reservation_id uuid unique
  references public.shirt_reservations (id);

-- No convertir retroactivamente una inscripción existente en reserva externa.
-- Tampoco cambiar la reserva de una persona que ya se inscribió.
create function public.protect_shirt_reservation() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op <> 'INSERT' and exists (
    select 1 from public.registrations where shirt_reservation_id = old.id
  ) then
    raise exception 'shirt-reservation-already-registered';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  if new.cedula is not null and exists (
    select 1 from public.registrations where edition = new.edition and cedula = new.cedula
  ) then
    raise exception 'shirt-reservation-already-registered';
  end if;
  return new;
end;
$$;
create trigger protect_shirt_reservation before insert or update or delete
  on public.shirt_reservations for each row execute function public.protect_shirt_reservation();

-- Un aviso por agotamiento. Si se repone y vuelve a agotarse, habrá otro aviso.
create function public.queue_shirt_stock_alert() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.reserved < new.total then
    update public.shirt_stock_alerts set cancelled_at = now()
      where edition = new.edition and gender = new.gender and shirt_size = new.shirt_size
        and sent_at is null and cancelled_at is null;
  elsif old.reserved < old.total then
    insert into public.shirt_stock_alerts (edition, gender, shirt_size)
      values (new.edition, new.gender, new.shirt_size)
      on conflict do nothing;
  end if;
  return new;
end;
$$;
create trigger shirt_inventory_alert after update on public.shirt_inventory
  for each row execute function public.queue_shirt_stock_alert();

-- Incluye tallas que ya estaban agotadas por inscripciones anteriores.
-- Las tallas sin existencias desde el principio se muestran agotadas sin aviso.
insert into public.shirt_stock_alerts (edition, gender, shirt_size)
  select edition, gender, shirt_size from public.shirt_inventory
  where reserved >= total and (total > 0 or reserved > 0);

create function public.reserve_registration_shirt() returns trigger
language plpgsql set search_path = '' as $$
declare
  release_old boolean := false;
  reserve_new boolean := false;
begin
  if tg_op <> 'INSERT' then
    release_old := old.shirt_size <> 'Sin camiseta'
      and old.shirt_reservation_id is null
      and old.payment_status in ('pendiente', 'aprobado');
  end if;
  if tg_op <> 'DELETE' then
    -- Siempre se determina en la base: el cliente no puede inventarse una excepción.
    select id into new.shirt_reservation_id from public.shirt_reservations
      where edition = new.edition and cedula = new.cedula
        and gender = new.gender and shirt_size = new.shirt_size
      for update;
    reserve_new := new.shirt_size <> 'Sin camiseta'
      and new.shirt_reservation_id is null
      and new.payment_status in ('pendiente', 'aprobado');
  end if;
  if tg_op = 'UPDATE' and release_old = reserve_new
    and (old.edition, old.gender, old.shirt_size) = (new.edition, new.gender, new.shirt_size) then
    return new;
  end if;
  if release_old then
    update public.shirt_inventory set reserved = reserved - 1
      where edition = old.edition and gender = old.gender and shirt_size = old.shirt_size;
  end if;
  if reserve_new then
    -- El UPDATE bloquea la fila: dos personas no pueden llevarse la última camiseta.
    update public.shirt_inventory set reserved = reserved + 1
      where edition = new.edition and gender = new.gender and shirt_size = new.shirt_size
        and reserved < total;
    if not found then
      raise exception using errcode = 'P0001', message = 'shirt-sold-out';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
create trigger registrations_shirt_stock before insert or update or delete
  on public.registrations for each row execute function public.reserve_registration_shirt();

-- Arrendamiento para que dos funciones no manden el mismo aviso a la vez.
create function public.claim_shirt_stock_alerts(p_edition smallint)
returns setof public.shirt_stock_alerts
language sql set search_path = '' as $$
  update public.shirt_stock_alerts set
    claimed_until = now() + interval '5 minutes', claim_token = gen_random_uuid()
  where id in (
    select id from public.shirt_stock_alerts
    where edition = p_edition and sent_at is null and cancelled_at is null
      and (claimed_until is null or claimed_until < now())
    order by created_at limit 12 for update skip locked
  ) returning *;
$$;

revoke all on function public.queue_shirt_stock_alert() from public;
revoke all on function public.reserve_registration_shirt() from public;
revoke all on function public.protect_shirt_reservation() from public;
revoke all on function public.claim_shirt_stock_alerts(smallint) from public;
grant execute on function public.claim_shirt_stock_alerts(smallint) to service_role;
grant all on public.shirt_inventory, public.shirt_stock_alerts, public.shirt_reservations to service_role;
commit;
