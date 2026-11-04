// Postgres aislado: nunca lee .env ni se conecta a Supabase.
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { setTimeout } from 'node:timers/promises';

const container = `corre-shirt-test-${process.pid}`;
function docker(args, input) {
  const result = spawnSync('docker', args, { input, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || String(result.error));
  return result.stdout.trim();
}
const sqlArgs = [
  'exec',
  '-i',
  container,
  'psql',
  '-U',
  'postgres',
  '-qAt',
  '-v',
  'ON_ERROR_STOP=1',
];
const sql = (query) => docker(sqlArgs, query);
function parallelSql(query) {
  return new Promise((resolve) => {
    const child = spawn('docker', sqlArgs);
    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.stdout.resume();
    child.on('close', (status) => resolve({ status, stderr }));
    child.stdin.end(query);
  });
}
const reserved = (gender, size) =>
  Number(
    sql(
      `select reserved from shirt_inventory where gender = '${gender}' and shirt_size = '${size}' and edition = 2;`,
    ),
  );
const available = (gender, size) =>
  Number(
    sql(
      `select total - reserved from shirt_inventory where edition = 2 and gender = '${gender}' and shirt_size = '${size}'`,
    ),
  );
const pending = (gender, size) =>
  Number(
    sql(
      `select count(*) from shirt_stock_alerts where gender = '${gender}' and shirt_size = '${size}' and sent_at is null and cancelled_at is null;`,
    ),
  );

try {
  docker([
    'run',
    '--detach',
    '--rm',
    '--name',
    container,
    '-e',
    'POSTGRES_PASSWORD=test-only',
    'postgres:16-alpine',
  ]);
  for (let attempt = 0; ; attempt++) {
    try {
      docker(['exec', container, 'pg_isready', '-h', '127.0.0.1', '-U', 'postgres']);
      break;
    } catch (error) {
      if (attempt >= 100) throw error;
      await setTimeout(100);
    }
  }
  sql(`create role service_role;
    create schema storage;
    create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);`);
  sql(
    readFileSync(
      new URL('../supabase/migrations/20260928000000_registrations.sql', import.meta.url),
      'utf8',
    ),
  );
  sql(`create function fixture(c text, g text default 'femenino', s text default 'Small (S)', p text default 'pendiente', e smallint default 2)
    returns void language sql as $$
    insert into registrations (edition, distance_id, category, gender, first_name, last_name, email, birth_date, cedula, phone, eps, blood_type, shirt_size, emergency_name, emergency_phone, recent_competition, has_illness, accepted_terms_at, terms_version, phase_id, base_price, total, receipt_path, payment_status)
    values (e, '5k', '5K', g, 'Prueba', 'Inventario', 'test@example.com', '1990-01-01', c, '3000000000', 'EPS', 'O+', s, 'Contacto', '3111111111', false, false, now(), 'v1', 'p2', 120000, 120000, 'test.jpg', p);
    $$;
    select fixture('pending'); select fixture('approved', 'femenino', 'Small (S)', 'aprobado');
    select fixture('rejected', 'femenino', 'Small (S)', 'rechazado');
    select fixture('noshirt', 'femenino', 'Sin camiseta');
    select fixture('male', 'masculino'); select fixture('other', 'femenino', 'Small (S)', 'pendiente', 1::smallint);
    select fixture('over-' || n, 'femenino', 'Extra Small (XS)') from generate_series(1,6) n;
    select fixture('existing-' || n, 'masculino', 'Extra Extra Large (XXL)') from generate_series(1,3) n;
    select fixture('zero', 'femenino', 'Extra Extra Large (XXL)');`);
  sql(
    readFileSync(
      new URL('../supabase/migrations/20261104000000_shirt_inventory.sql', import.meta.url),
      'utf8',
    ),
  );
  const expected = [
    ['femenino', 'Extra Small (XS)', 1],
    ['femenino', 'Small (S)', 18],
    ['femenino', 'Medium (M)', 56],
    ['femenino', 'Large (L)', 18],
    ['femenino', 'Extra Large (XL)', 7],
    ['femenino', 'Extra Extra Large (XXL)', 0],
    ['masculino', 'Extra Small (XS)', 0],
    ['masculino', 'Small (S)', 0],
    ['masculino', 'Medium (M)', 15],
    ['masculino', 'Large (L)', 26],
    ['masculino', 'Extra Large (XL)', 9],
    ['masculino', 'Extra Extra Large (XXL)', 2],
  ];
  for (const [gender, size, count] of expected) assert.equal(available(gender, size), count);
  assert.equal(Number(sql('select sum(total - reserved) from shirt_inventory')), 152);
  assert.equal(Number(sql('select sum(initial_available) from shirt_inventory')), 152);
  assert.equal(Number(sql('select count(*) from shirt_reservations')), 20);
  assert.equal(Number(sql('select count(*) from shirt_reservations where cedula is not null')), 0);
  assert.equal(reserved('femenino', 'Small (S)'), 2);
  assert.equal(reserved('masculino', 'Small (S)'), 1);
  assert.equal(reserved('femenino', 'Extra Small (XS)'), 6, 'conserva los registros históricos');
  assert.equal(pending('femenino', 'Extra Small (XS)'), 0);
  assert.equal(pending('masculino', 'Extra Extra Large (XXL)'), 0);
  assert.equal(pending('femenino', 'Extra Extra Large (XXL)'), 1);
  assert.equal(pending('masculino', 'Extra Small (XS)'), 0);
  process.stdout.write(
    '✓ Los doce saldos verdes suman 152 sin restar otra vez el histórico; 20 reservas separadas\n',
  );

  sql("update registrations set payment_status = 'aprobado' where cedula = 'pending';");
  assert.equal(reserved('femenino', 'Small (S)'), 2, 'aprobar no descuenta dos veces');
  sql("update registrations set payment_status = 'rechazado' where cedula = 'pending';");
  assert.equal(reserved('femenino', 'Small (S)'), 1);
  sql("update registrations set payment_status = 'pendiente' where cedula = 'pending';");
  assert.equal(reserved('femenino', 'Small (S)'), 2);
  sql("update registrations set payment_status = 'aprobado' where cedula = 'over-1';");
  assert.equal(reserved('femenino', 'Extra Small (XS)'), 6);
  process.stdout.write('✓ Rechazar libera y reactivar reserva; aprobar conserva la reserva\n');

  sql(
    "update shirt_inventory set total = total + 1 where gender = 'masculino' and shirt_size = 'Small (S)';",
  );
  const concurrent = await Promise.all([
    parallelSql("begin; select fixture('race-1', 'masculino'); select pg_sleep(0.2); commit;"),
    parallelSql("begin; select fixture('race-2', 'masculino'); select pg_sleep(0.2); commit;"),
  ]);
  assert.equal(concurrent.filter((r) => r.status === 0).length, 1);
  assert.match(concurrent.find((r) => r.status !== 0).stderr, /shirt-sold-out/);
  assert.equal(reserved('masculino', 'Small (S)'), 2);
  assert.equal(pending('masculino', 'Small (S)'), 1);
  sql("update registrations set observation = 'sin cambio de talla' where cedula = 'male';");
  assert.equal(pending('masculino', 'Small (S)'), 1);
  sql("select fixture('male-rejected', 'masculino', 'Small (S)', 'rechazado');");
  assert.throws(
    () =>
      sql("update registrations set payment_status = 'aprobado' where cedula = 'male-rejected';"),
    /shirt-sold-out/,
  );
  assert.equal(
    sql("select payment_status from registrations where cedula = 'male-rejected'"),
    'rechazado',
  );
  process.stdout.write(
    '✓ Dos inscripciones compiten por la última: solo una reserva; reactivación agotada revierte\n',
  );

  sql("update registrations set shirt_size = 'Sin camiseta' where cedula = 'male';");
  assert.equal(reserved('masculino', 'Small (S)'), 1);
  assert.equal(pending('masculino', 'Small (S)'), 0);
  sql("update registrations set shirt_size = 'Small (S)' where cedula = 'male';");
  assert.equal(pending('masculino', 'Small (S)'), 1);
  sql("delete from registrations where cedula = 'male';");
  assert.equal(reserved('masculino', 'Small (S)'), 1);
  assert.equal(pending('masculino', 'Small (S)'), 0);
  sql("select fixture('last-xs', 'femenino', 'Extra Small (XS)');");
  assert.equal(pending('femenino', 'Extra Small (XS)'), 1);
  sql(
    "update shirt_inventory set total = total + 1 where gender = 'femenino' and shirt_size = 'Extra Small (XS)';",
  );
  assert.equal(pending('femenino', 'Extra Small (XS)'), 0);
  sql("select fixture('restocked', 'femenino', 'Extra Small (XS)');");
  assert.equal(pending('femenino', 'Extra Small (XS)'), 1);
  process.stdout.write('✓ Cambios de talla, eliminación, reposición y nuevo agotamiento\n');

  sql(`update shirt_reservations set cedula = '9999901' where id = (
    select id from shirt_reservations where gender = 'masculino' and shirt_size = 'Extra Extra Large (XXL)' limit 1
  );
  select fixture('public-xxl-1', 'masculino', 'Extra Extra Large (XXL)');
  select fixture('public-xxl-2', 'masculino', 'Extra Extra Large (XXL)');`);
  const beforePrivate = reserved('masculino', 'Extra Extra Large (XXL)');
  assert.equal(available('masculino', 'Extra Extra Large (XXL)'), 0);
  sql("select fixture('9999901', 'masculino', 'Extra Extra Large (XXL)');");
  assert.equal(reserved('masculino', 'Extra Extra Large (XXL)'), beforePrivate);
  assert.equal(
    sql("select shirt_reservation_id is not null from registrations where cedula = '9999901'"),
    't',
  );
  assert.throws(
    () => sql("select fixture('9999901', 'masculino', 'Extra Extra Large (XXL)');"),
    /duplicate key/,
  );
  assert.throws(
    () => sql("update shirt_reservations set cedula = '9999903' where cedula = '9999901';"),
    /shirt-reservation-already-registered/,
  );
  assert.throws(
    () => sql("update registrations set gender = 'femenino' where cedula = '9999901';"),
    /shirt-sold-out/,
  );
  sql("update registrations set payment_status = 'rechazado' where cedula = '9999901';");
  assert.equal(
    available('masculino', 'Extra Extra Large (XXL)'),
    0,
    'una reserva externa rechazada no infla el saldo verde',
  );
  sql("update registrations set payment_status = 'aprobado' where cedula = '9999901';");
  assert.equal(reserved('masculino', 'Extra Extra Large (XXL)'), beforePrivate);
  sql("delete from registrations where cedula = '9999901';");
  assert.equal(available('masculino', 'Extra Extra Large (XXL)'), 0);
  sql("select fixture('9999901', 'masculino', 'Extra Extra Large (XXL)');");
  assert.equal(available('masculino', 'Extra Extra Large (XXL)'), 0);
  assert.throws(
    () =>
      sql(
        "update shirt_reservations set cedula = 'pending' where id = (select id from shirt_reservations where cedula is null limit 1);",
      ),
    /shirt-reservation-already-registered/,
  );
  assert.throws(
    () => sql("select fixture('ordinary-no-stock', 'masculino', 'Extra Extra Large (XXL)');"),
    /shirt-sold-out/,
  );
  process.stdout.write(
    '✓ Reserva por cédula se inscribe con stock agotado sin doble descuento; rechazos y duplicados no alteran el saldo\n',
  );

  const claimed = sql('select count(*) from claim_shirt_stock_alerts(2::smallint);');
  assert.ok(Number(claimed) > 0);
  assert.equal(sql('select count(*) from claim_shirt_stock_alerts(2::smallint);'), '0');
  sql(
    "update shirt_stock_alerts set claimed_until = now() - interval '1 second' where sent_at is null;",
  );
  assert.equal(sql('select count(*) from claim_shirt_stock_alerts(2::smallint);'), claimed);
  sql('update shirt_stock_alerts set sent_at = now() where claim_token is not null;');
  assert.equal(sql('select count(*) from claim_shirt_stock_alerts(2::smallint);'), '0');
  process.stdout.write(
    '✓ Avisos con exclusión mutua, reintento tras vencimiento y confirmación de envío\n',
  );
} finally {
  docker(['rm', '--force', container]);
}
