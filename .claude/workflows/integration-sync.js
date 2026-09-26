// Sincronización remota → staging para cualquier proveedor registrado. Nunca escribe en el sistema remoto.
export const meta = {
  name: 'integration-sync',
  description: 'Valida, sincroniza y comprueba staging preservando la curación local.',
  whenToUse: 'Refrescar trabajo remoto antes de revisarlo y promoverlo a planning.',
  // Una sola: el recorrido es un agente que encadena check → sync → check. Declarar «Sync» y
  // «Validate» aparte pintaba dos grupos vacíos en el progreso, porque nunca se entraba a ellos.
  phases: [
    { title: 'Preflight', detail: 'Resolver proveedor, sincronizar y revalidar staging.' },
  ],
}

// La raíz la completa `automation install`. No puede venir del entorno: el runtime de workflows no
// expone `process`, así que leerlo de ahí reventaba el archivo entero en su primera línea. Viaja escrita.
//
// Y viaja **absoluta**. Lo fue relativa hasta 0.89.0, anclada a la carpeta donde se abre la herramienta
// «que es el cwd de los agentes» — y esa segunda mitad es la que no se cumple: cada consigna dicta «corré
// X desde Y» con las dos rutas relativas, así que coinciden sólo si la sesión abrió exactamente donde el
// instalador supuso. Abierta en la instancia, el tramo se duplica y el comando contesta que el planning
// no existe (caso 139). Absoluta no hay dónde pararse mal.
//
// El costo de escribirla —y por qué se paga acá— lo declara `engine/automation/runners.js` junto al
// marcador.
//
// Sin instalar queda vacía y vale `.`: el toolkit no se consume a sí mismo y sus recorridos se ejercitan
// desde su propia carpeta.
const ROOT = '/Users/santiago.abadia/Documents/Private/running/corre-y-liberate-2026/ops'.replace(/\/+$/, '') || '.'
// `/integration-sync jira` o `{"provider": "jira"}`: sin entorno, el argumento es la única entrada.
const input = typeof args === 'string' ? { provider: args } : (args || {})
const REQUESTED = String(input.provider || '').trim()
const RESULT = {
  type: 'object', additionalProperties: false, required: ['passed', 'provider', 'details'],
  properties: {
    passed: { type: 'boolean' }, provider: { type: 'string' }, details: { type: 'string' },
    total: { type: 'integer' }, created: { type: 'integer' },
    refreshed: { type: 'integer' }, preserved: { type: 'integer' },
  },
}

phase('Preflight')
const result = await agent(
  `Read ${ROOT}/integrations/README.md, ${ROOT}/integrations/config.json and ${ROOT}/planning/PROTOCOL.md. ` +
  `The requested provider is ${JSON.stringify(REQUESTED)}; if empty, continue only when exactly ` +
  `one provider is enabled. Run "node tools/ops.js integration check ${ROOT} <provider>" and read its exit code. ` +
  `Do not edit config and do not call a remote write operation.\n\n` +
  `If green, enter Sync and run "node tools/ops.js integration sync ${ROOT} <provider>". The registered adapter owns ` +
  `pagination and normalization. Never edit remote.json or sync-state.json manually; preserve curated draft.md.\n\n` +
  `Finally enter Validate, repeat integration check and run "node tools/ops.js check ${ROOT}/planning". passed=true ` +
  `requires real exit 0 from every command. Never promote candidates as a side effect of sync.`,
  { label: 'integration:sync', schema: RESULT },
)
log(result && result.passed
  ? `Integration ${result.provider} staging green: ${result.details}`
  : `Integration sync failed: ${(result && result.details) || 'no result'}`)
return result
