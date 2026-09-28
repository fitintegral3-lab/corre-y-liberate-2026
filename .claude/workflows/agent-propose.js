// Convierte la recomendación de los informes en el cambio concreto que una persona puede aprobar.
//
// `learn --proposal` consolida qué recomendaron los informes de investigación, pero deja «Cambio
// propuesto: por definir». Eso no es aprobable: nadie firma una intención. Este recorrido escribe el
// texto exacto que habría que agregar, archivo por archivo, y lo contrasta contra los casos
// adversariales vigentes antes de proponerlo.
//
// Nunca aplica nada, y no es una formalidad: la sección «Aprobación humana» la firma una persona, y
// hasta que esté firmada `/agent-promote` se niega a tocar el cargo.
export const meta = {
  name: 'agent-propose',
  description: 'Escribe el cambio concreto de una propuesta mensual y lo contrasta con los casos',
  whenToUse: 'Después de que el ciclo consolide una propuesta, para dejarla en estado aprobable.',
  phases: [
    { title: 'Contexto', detail: 'Contrato, fuentes, conductas y casos vigentes' },
    { title: 'Proponer', detail: 'El cambio exacto, sus riesgos y su evaluación' },
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
const AGENT = String((typeof args === 'string' ? args : (args || {}).agent) || '').trim()
const PERIOD = String((args || {}).period || '').trim()

const CONTEXT = {
  type: 'object', additionalProperties: false, required: ['dir', 'proposal', 'cases'],
  properties: {
    dir: { type: 'string' },
    proposal: { type: 'string' },
    cases: { type: 'integer' },
    hasChange: { type: 'boolean' },
  },
}

const RESULT = {
  type: 'object', additionalProperties: false, required: ['completed', 'files'],
  properties: {
    completed: { type: 'boolean' },
    files: { type: 'array', items: { type: 'string' } },
    newCase: { type: 'string' },
    risks: { type: 'integer' },
    summary: { type: 'string' },
  },
}

// Cierre del recorrido. El runtime no trae un helper de cierre —el valor devuelto por el script ya es
// el resultado—, y darlo por sentado hacía reventar el archivo justo al terminar: después de gastar
// cada etapa, en la línea que las cerraba.
function finish(result) {
  log(`Fin: ${JSON.stringify(result)}`)
  return result
}

const stop = (reason, detail = '') => {
  log(`Checkpoint: ${reason}${detail ? ` — ${detail}` : ''}`)
  return finish({ stopped: true, reason, detail })
}

if (!AGENT) return stop('sin-cargo', 'pasá el slug del cargo')

phase('Contexto')

const context = await agent(
  `From ${ROOT}, run "node tools/ops.js agents list --json" and take the path it printed for ${AGENT}. ` +
  `Set dir to "${ROOT}/<path>": that command prints paths relative to ${ROOT} and the next agent runs ` +
  `from elsewhere, so the prefix is not optional.\n\n` +
  `Then find the newest file under <dir>/learning/proposals/ named AAAA-MM.md` +
  `${PERIOD ? `, preferring ${PERIOD}.md` : ''}. Set proposal to its full path. Read it and set ` +
  `hasChange to true only if its "Cambio propuesto" section already carries a concrete change —if it ` +
  `still says "por definir", it is false.\n\n` +
  `Finally run "node tools/ops.js evaluate ${AGENT} --cases" and set cases to how many it listed. ` +
  `Report only what the commands printed.`,
  { schema: CONTEXT, label: 'context' },
)
if (!context) return stop('sin-contexto', `no se pudo ubicar el cargo ${AGENT}`)
if (context.hasChange) {
  return stop('ya-propuesta', `${context.proposal} ya tiene un cambio concreto; revisalo o borralo antes`)
}
log(`${context.proposal} · ${context.cases} caso(s) vigentes`)

phase('Proponer')

const proposal = await agent(
  `Sos quien mantiene el cargo ${AGENT}. La propuesta ${context.proposal} consolidó lo que ` +
  `recomendaron los informes de investigación, pero le falta lo único que una persona puede aprobar: el ` +
  `cambio concreto.\n\n` +
  `Leé los informes citados en su sección «Hallazgos», el SKILL.md del cargo, ` +
  `${context.dir}/learning/sources.yaml, ${context.dir}/evaluations/expected-behaviors.yaml y sus ` +
  `casos en ${context.dir}/evaluations/cases/. Después completá **sólo** estas tres secciones de la ` +
  `propuesta, sin tocar ninguna otra ni el frontmatter:\n\n` +
  `**Cambio propuesto**: el texto exacto a agregar o reemplazar, archivo por archivo, citando la ` +
  `sección o la línea que se toca. Que se pueda aplicar leyéndolo, sin volver al informe. Preferí ` +
  `agregar sobre reescribir: el núcleo del contrato no está en discusión. Si una fuente no se pudo ` +
  `corroborar, dejalo escrito en el propio texto en vez de afirmarla.\n\n` +
  `**Riesgos y regresiones**: qué caso adversarial existente podría empezar a fallar y qué parte del ` +
  `contrato podría contradecirse. Si dos reglas quedan en tensión aparente, resolvela en el texto ` +
  `propuesto, no la dejes para quien aplique.\n\n` +
  `**Evaluación**: contrastá el cambio contra los ${context.cases} casos vigentes, uno por uno, y ` +
  `decí si cada uno sigue pasando. Si una conducta prohibida nueva no tiene caso que la distinga de ` +
  `las que ya están, escribí el enunciado del caso que haría falta —con **cuatro** comportamientos ` +
  `esperados, como todos los del catálogo— y **no crees el archivo**: cambiar el denominador de la ` +
  `evaluación es parte de lo que se aprueba.\n\n` +
  `No modifiques SKILL.md, sources.yaml, expected-behaviors.yaml ni los casos: esto es una propuesta, ` +
  `no su aplicación. No toques «Aprobación humana»: esa la firma una persona. No hagas commit ni push. ` +
  `El único archivo que escribís es la propuesta.\n\n` +
  `Devolvé qué archivos tocaría el cambio, el enunciado del caso nuevo si lo hay, cuántos riesgos ` +
  `identificaste y un resumen en una frase.`,
  { schema: RESULT, label: `propone:${AGENT}` },
)
if (!proposal) return stop('sin-propuesta', 'el agente no devolvió resultado')

log(`Tocaría: ${(proposal.files || []).join(', ')}`)
return finish({
  agent: AGENT,
  proposal: context.proposal,
  files: proposal.files || [],
  risks: proposal.risks || 0,
  newCase: proposal.newCase || '',
  next: 'firmá «Aprobación humana» y corré /agent-promote',
})
