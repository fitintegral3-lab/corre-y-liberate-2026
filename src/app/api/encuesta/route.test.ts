import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { POST as checkAccess } from '@/app/api/encuesta/acceso/route';
import { POST } from '@/app/api/encuesta/route';
import { event } from '@/content';

const payload = {
  submissionId: '8d3c1f0e-6a2b-4c5d-9e7f-0a1b2c3d4e5f',
  identifier: '1.144.135.260',
  overall: '5',
  organization: '4',
  route: '3',
  hydration: '2',
  finishArea: '1',
  likedMost: 'El ambiente en la llegada',
  improve: 'Más puntos de hidratación',
  returnIntent: 'Probablemente sí',
  recommend: '9',
};

const first = '11111111-1111-4111-8111-111111111111';
const second = '22222222-2222-4222-8222-222222222222';

interface Answered {
  registration_id: string;
  submission_id: string;
}

/**
 * Supabase se habla por HTTP: este `fetch` falso responde por tabla, así que
 * ninguna prueba toca una base real. Los filtros no se aplican acá; las
 * pruebas que los cuidan leen la consulta que se pidió.
 */
const db = {
  registrations: [] as { id: string }[],
  responses: [] as Answered[],
  insertError: null as { code: string } | null,
  fetch: vi.fn<typeof fetch>(),
};

function calls(table: string) {
  return db.fetch.mock.calls.filter(([url]) => new URL(String(url)).pathname.endsWith(table));
}

function inserts() {
  return calls('/experience_survey_responses').filter(([, init]) => init?.method === 'POST');
}

function registrationQuery() {
  return decodeURIComponent(new URL(String(calls('/registrations')[0][0])).search);
}

function request(body: unknown, path = '/api/encuesta') {
  return new Request(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  db.registrations = [{ id: first }];
  db.responses = [];
  db.insertError = null;
  db.fetch.mockImplementation(async (url, init) => {
    const path = new URL(String(url)).pathname;
    if (path.endsWith('/registrations')) return Response.json(db.registrations);
    if (init?.method === 'POST') {
      return db.insertError
        ? Response.json({ ...db.insertError, message: 'error' }, { status: 409 })
        : new Response(null, { status: 201 });
    }
    return Response.json(db.responses);
  });
  vi.stubEnv('SUPABASE_URL', 'https://testproject.supabase.co');
  vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_test');
  vi.stubGlobal('fetch', db.fetch);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('encuesta de experiencia', () => {
  it('guarda la respuesta ligada a la inscripción encontrada', async () => {
    expect((await POST(request(payload))).status).toBe(201);
    expect(inserts()).toHaveLength(1);
    expect(JSON.parse(String(inserts()[0][1]?.body))).toEqual({
      submission_id: payload.submissionId,
      registration_id: first,
      overall: 5,
      organization: 4,
      route: 3,
      hydration: 2,
      finish_area: 1,
      liked_most: payload.likedMost,
      improve: payload.improve,
      return_intent: 'Probablemente sí',
      recommend: 9,
      survey_version: 'encuesta-experiencia-2026-v1',
    });
  });

  it.each(['1.144.135.260', '1144135260', '1 144 135 260'])(
    'busca la cédula %s como 1144135260',
    async (identifier) => {
      expect((await POST(request({ ...payload, identifier }))).status).toBe(201);
      expect(registrationQuery()).toContain('cedula.eq.1144135260');
    },
  );

  it('busca solo en esta edición y sin las rechazadas', async () => {
    await POST(request(payload));
    const query = registrationQuery();
    expect(query).toContain(`edition=eq.${event.edition}`);
    expect(query).toContain('payment_status=neq.rechazado');
  });

  it('también encuentra la inscripción por el WhatsApp, con o sin +57', async () => {
    await POST(request({ ...payload, identifier: '+57 300 123 4567' }));
    expect(registrationQuery()).toContain('phone.eq.3001234567');
  });

  it('acepta la encuesta sin la pregunta opcional de recomendación', async () => {
    const { recommend: _omitted, ...withoutRecommend } = payload;
    expect((await POST(request(withoutRecommend))).status).toBe(201);
    expect(JSON.parse(String(inserts()[0][1]?.body)).recommend).toBeNull();
  });

  it('no guarda nada si el número no está inscrito', async () => {
    db.registrations = [];
    expect((await POST(request(payload))).status).toBe(404);
    expect(inserts()).toHaveLength(0);
  });

  it('usa la siguiente inscripción pendiente cuando un WhatsApp tiene varias', async () => {
    db.registrations = [{ id: first }, { id: second }];
    db.responses = [{ registration_id: first, submission_id: crypto.randomUUID() }];
    expect((await POST(request(payload))).status).toBe(201);
    expect(JSON.parse(String(inserts()[0][1]?.body)).registration_id).toBe(second);
  });

  it('no deja responder dos veces la misma inscripción', async () => {
    db.responses = [{ registration_id: first, submission_id: crypto.randomUUID() }];
    expect((await POST(request(payload))).status).toBe(409);
    expect(inserts()).toHaveLength(0);
  });

  it('confirma un reintento de una respuesta ya guardada sin volver a insertar', async () => {
    db.responses = [{ registration_id: first, submission_id: payload.submissionId }];
    expect((await POST(request(payload))).status).toBe(200);
    expect(inserts()).toHaveLength(0);
  });

  it('responde que ya respondió si otro envío ganó la inscripción al guardar', async () => {
    db.insertError = { code: '23505' };
    expect((await POST(request(payload))).status).toBe(409);
  });

  it.each([
    ['una calificación fuera de escala', { overall: '6' }],
    ['una recomendación fuera de 0 a 10', { recommend: '11' }],
    ['una respuesta abierta vacía', { improve: '   ' }],
    ['una opción de regreso que no existe', { returnIntent: 'Tal vez' }],
    ['un identificador que no es cédula ni celular', { identifier: 'ab' }],
  ])('rechaza %s sin guardar', async (_case, change) => {
    expect((await POST(request({ ...payload, ...change }))).status).toBe(422);
    expect(inserts()).toHaveLength(0);
  });

  it('devuelve un error recuperable si Supabase no puede guardar', async () => {
    db.insertError = { code: '42P01' };
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect((await POST(request(payload))).status).toBe(503);
    } finally {
      log.mockRestore();
    }
  });
});

describe('acceso a la encuesta', () => {
  const access = (identifier: string) =>
    checkAccess(request({ identifier }, '/api/encuesta/acceso'));

  it('abre la encuesta a una inscripción pendiente sin devolver sus datos', async () => {
    const response = await access('3001234567');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it('no abre la encuesta a quien no está inscrito', async () => {
    db.registrations = [];
    expect((await access('3001234567')).status).toBe(404);
  });

  it('avisa cuando la inscripción ya respondió', async () => {
    db.responses = [{ registration_id: first, submission_id: crypto.randomUUID() }];
    expect((await access('3001234567')).status).toBe(409);
  });
});
