// Ejecuta los casos adversariales de un recorrido y deja el veredicto escrito.
//
// Es el espejo de `agent-eval`, con una diferencia que decide todo el diseño: un cargo responde, y un
// recorrido **corre**. Por eso acá no hay un agente que conteste el pedido — hay una invocación del
// recorrido de verdad, con sus etapas, sus dueños de decisión y sus exit gates, y lo que se juzga es
// lo que produjo. Medirlo con un agente que imite el recorrido mediría la imitación.
//
// De ahí también el costo: un caso de cargo gasta dos agentes y uno de recorrido gasta el recorrido
// entero. Está dicho acá porque es lo primero que sorprende al lanzarlo.
export const meta = {
  name: 'flow-eval',
  description: 'Corre los casos adversariales de un recorrido: lo ejecuta de verdad, juzga aparte y registra',
  whenToUse: 'Antes de aprobar un cambio a un recorrido, o para comprobar que sus gates todavía frenan.',
  phases: [
    { title: 'Casos', detail: 'Los casos vigentes del recorrido' },
    { title: 'Correr', detail: 'El recorrido se ejecuta con el pedido del caso' },
    { title: 'Juzgar', detail: 'Otro agente contrasta contra los comportamientos esperados' },
    { title: 'Registrar', detail: 'El veredicto queda escrito con su evidencia' },
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
const input = typeof args === 'string' ? { flow: args } : (args || {})
const FLOW = String(input.flow || '').trim()

// Qué casos correr. Sin `cases` van todos, que es lo que hace falta la primera vez y cuando el
// contrato cambió entero.
//
// Nombrar uno existe porque comprobar un arreglo no pide la batería: un sujeto falla un caso de seis y
// correr los seis cuesta seis veces lo mismo para volver a mirar cinco veredictos que ya se tenían. Es
// el desperdicio que R20 nombra —repetir sin que el cambio pueda mover ese veredicto—, y acá tenía
// forma de comando.
//
// El registro que sale entonces cubre menos casos de los que el sujeto tiene, y `evaluate` lo dirá:
// «el resultado no vale». Es correcto que lo diga. Lo que corresponde es componer el registro nuevo
// con los veredictos que no se volvieron a medir, citando de qué corrida vienen.
//
// Vive acá y no en cada evaluador porque los dos lo necesitan igual, y el que se agrega después es el
// que se queda sin él: ya pasó cuatro veces —`contexto`, la ruta del CLI, el esquema de dos niveles y
// este mismo filtro— que un arreglo entrara en un gemelo y no en el otro.
const onlyCases = (input) => (Array.isArray(input.cases) ? input.cases : String(input.cases || '')
  .split(',')).map((one) => String(one).trim()).filter(Boolean)

// Devuelve los casos pedidos, o los que faltan para que quien llama frene con su propio vocabulario.
function pickCases(items, only) {
  const present = items.map((item) => item.id)
  const missing = only.filter((id) => !present.includes(id))
  return { present, missing, items: items.filter((item) => only.includes(item.id)) }
}

// Cuántos casos tiene el sujeto, y la nota que lo dice **dentro** del registro. Vive fuera del `if` que
// filtra porque ahí es donde el número se sabía y se perdía: el aviso de «N de M» salía por `log()` y el
// archivo quedaba con «passed: 1, total: 1» sobre un sujeto de diez casos. Leído solo dentro de un mes
// eso es una evaluación completa, y nadie va a pedir los otros nueve porque nada indica que falten, que
// es lo que R15 llama parecer completo sin estarlo. Los dos registros parciales del 2026-08-30 salieron
// así, y la marca hubo que ponérsela a mano.
let CATALOG = 0

// Sólo cuando de verdad falta algo: un aviso que sale en toda corrida se deja de leer.
const coverageNote = (ran, sujeto) => (ran && CATALOG > ran
  ? `> **Corrida parcial: ${ran} de ${CATALOG} casos.** Este registro no cubre los demás, que conservan `
    + `el veredicto de su última corrida. Para saber si ${sujeto} se sostiene entero hay que componerlo `
    + `con ésos, diciendo de qué corrida viene cada uno.\n\n`
  : '')
const ONLY = onlyCases(input)

const CASES = {
  type: 'object', additionalProperties: false, required: ['items'],
  properties: {
    items: { type: 'array', items: {
      type: 'object', additionalProperties: false, required: ['id', 'request', 'expected'],
      properties: {
        id: { type: 'string' },
        request: { type: 'string' },
        expected: { type: 'array', items: { type: 'string' } },
        fixtures: { type: 'array', items: { type: 'string' } },
      },
    } },
    forbidden: { type: 'array', items: { type: 'string' } },
    // Qué CLI existe acá, por lo mismo que en `agent-eval` y con el mismo síntoma: sin la ruta puesta,
    // el agente de bancos reportó los cuatro casos como fallidos y el freno de banco viejo detuvo cuatro
    // corridas cuyos bancos estaban recién borrados.
    cli: { type: 'string' },
    mode: { type: 'string' },
  },
}

const BENCH = {
  type: 'object', additionalProperties: false, required: ['path', 'failed'],
  properties: {
    path: { type: 'string' },
    failed: { type: 'array', items: { type: 'string' } },
  },
}

const VERDICT = {
  type: 'object', additionalProperties: false, required: ['passed', 'met', 'reasoning'],
  properties: {
    passed: { type: 'boolean' },
    met: { type: 'array', items: {
      type: 'object', additionalProperties: false, required: ['behavior', 'observed'],
      properties: { behavior: { type: 'string' }, observed: { type: 'boolean' }, quote: { type: 'string' } },
    } },
    reasoning: { type: 'string' },
    contractNote: { type: 'string' },
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

// Qué se midió y qué no. Un caso sin veredicto no es un caso reprobado: es un caso que no se midió, y
// la diferencia es quién falló. Escribirlo como «no pasa» le atribuye al sujeto un fallo del
// instrumento —el juez que murió, la etapa que se cayó— y eso no se distingue después leyendo el
// registro.
//
// Y el que desaparece es peor que el que miente: al caerse sale del arreglo, el total se achica solo y
// el registro queda idéntico a uno que midió menos casos a propósito.
function measured(items, verdicts) {
  const answered = verdicts.filter((one) => one && one.verdict)
  const ids = answered.map((one) => one.id)
  return { answered, unmeasured: items.map((item) => item.id).filter((id) => !ids.includes(id)) }
}

// La línea que impide leer el registro como completo. Va en el cuerpo y no al pie: sirve para que la
// vea quien decide, no para dejar constancia de que se sabía.
const unmeasuredNote = (unmeasured) => (unmeasured.length
  ? `> Sin medir en esta corrida: ${unmeasured.join(', ')} — el caso no llegó a un veredicto.\n\n`
  : '')

// Ninguna ruta de esta máquina entra al registro. El sujeto y el juez las escriben con naturalidad
// —trabajaron ahí— y el repositorio las rechaza: una ruta bajo el `/home` de alguien no le sirve a nadie
// más y ata el documento a un directorio que en otra máquina no existe.
//
// La raíz no siempre la trae `root`: `/Users/santiago.abadia/Documents/Private/running/corre-y-liberate-2026/ops` lo completa `automation install`, y en el repositorio
// del toolkit —que no se instala a sí mismo— queda vacío y `ROOT` vale `.`. Cuando falta, la revela el
// propio texto: cualquier ruta del banco la lleva adelante. Con ella se recorta también la que apunta a la
// raíz sin nada detrás, que es la que se escapó el 2026-08-31 después de dos arreglos que cubrían el caso
// visto y no la clase.
//
// Se aplica sobre la fila entera del registro y no pedazo por pedazo: así ninguno queda afuera —la
// nota del juez lo estaba, y es el que más fácil filtra una ruta— y la raíz se deriva una sola vez.
//
// El recorte es el mecanismo y está medido: su prueba lo ejecuta y mira qué sale. La regla que además se
// le pide al juez y al sujeto —nombrar los archivos relativos a la raíz— es defensa en profundidad y **no
// está medida**: sólo consta que el texto está en los prompts, que es estructura y no conducta. Sirve para
// que el registro no quede con «todos bajo ``», no para garantizar nada; lo que garantiza es esto.
//
// Medirla pide otro instrumento. Una corrida de evaluación aporta once textos de prosa, y distinguir el
// 39 % de base de un 10 % necesita del orden de treinta y cuatro por brazo: hace falta una sonda que corra
// la misma tarea con y sin la frase, con la propiedad decidida por un regex y sin juez. El 39 % no es
// estimado: son 9 de 23 textos con una ruta, contados sobre el `journal.jsonl` de las tres corridas del
// 2026-08-30 y 31.
const stripRoot = (text, root) => {
  const one = String(text || '')
  const visto = (one.match(/([A-Za-z0-9_./~-]+)\/\.cauce-eval\//) || [])[1]
  const base = root && root !== '.' ? root : (visto && visto.startsWith('/') ? visto : '')
  return (base ? one.split(`${base}/`).join('') : one)
    .replace(/[A-Za-z0-9_./~-]*\/\.cauce-eval\//g, '.cauce-eval/')
}

// Lo que va en una línea del registro se aplana antes de escribirlo: el motor lee `- Para el contrato:`
// como línea propia, y un salto adentro partiría el documento en dos justo donde hay un dato.
const oneLine = (text) => String(text || '').replace(/\s+/g, ' ').trim()

if (!FLOW) return stop('sin-recorrido', 'pasá el slug del recorrido a evaluar')

phase('Casos')

const context = await agent(
  `From ${ROOT}, run exactly these two commands and report only what they printed. Read no other file.\n` +
  `From ${ROOT}, the CLI is "tools/ops.js" if that file exists and "engine/cli/ops.js" otherwise. ` +
  `Set cli to the one that exists and use it in every command below.\n` +
  `1. "node <cli> evaluate ${FLOW} --flow --cases --json" — it prints an object: copy its ` +
  `"cases" array into items and its "forbidden" array into forbidden, both verbatim.\n` +
  `2. Read ${ROOT}/ops.config.json and set mode to its "mode" field, verbatim.`,

  { schema: CASES, label: 'casos' },
)
if (!context || !context.items || !context.items.length) {
  return stop('sin-casos', `${FLOW} no tiene casos, o no se pudieron leer`)
}
if (ONLY.length) {
  const pick = pickCases(context.items, ONLY)
  if (pick.missing.length) {
    return stop('caso-inexistente',
      `${FLOW} no tiene ${pick.missing.join(', ')}. Tiene: ${pick.present.join(', ')}`)
  }
  context.items = pick.items
  CATALOG = pick.present.length
  log(`Sólo ${ONLY.join(', ')}: el registro va a cubrir ${ONLY.length} de ${CATALOG}`)
}

// El recorrido escribe: épica candidata, INBOX, acciones humanas. Sin un `planning/` propio no puede
// hacer su trabajo, y medirlo negándose a escribir mediría el banco, no el recorrido.
const BENCH_ROOT = `${ROOT}/.cauce-eval/${FLOW}`
if (context.mode !== 'toolkit') {
  return stop('fuera-del-toolkit',
    `evaluar un recorrido exige un banco desechable, y eso es del toolkit. En una empresa el ` +
    `recorrido corre sobre su propio planning/.`)
}
const benches = await agent(
  `From ${ROOT}, run one command per case, in order, and report what each one did:\n` +
  context.items.map((item) => `  node ${context.cli} evaluate ${FLOW} --flow --bench ${item.id}`).join('\n') +
  `\n\nEach one recreates a disposable instance where writing to planning/ is legitimate. Set path ` +
  `to the directory they share: ${BENCH_ROOT}\n\n` +
  `A command that exits non-zero did NOT recreate its bench: put that case id in failed, verbatim. ` +
  `Report every one that failed and no others — do not retry them, do not add --force.`,
  { schema: BENCH, label: 'bancos' },
)
if (!benches || !benches.path) return stop('sin-banco', 'no se pudieron preparar los bancos')
if (benches.failed && benches.failed.length) {
  // Los bancos de los casos que fallaron, no el del recorrido entero. Nombrar `BENCH_ROOT` se llevaba
  // por delante los bancos de los casos que nadie estaba re-corriendo: pasó re-midiendo uno solo de
  // `change-review`, y el mensaje proponía borrar también el del caso vecino. Los ids ya están acá.
  return stop('banco-sin-rehacer',
    `${benches.failed.join(', ')}: su banco conserva trabajo sin recoger de una corrida anterior. ` +
    `Guardá el registro de esa corrida y volvé a armarlo con --force, o borrá ` +
    `${benches.failed.map((id) => `${BENCH_ROOT}/${id}`).join(', ')}.`)
}
// Un caso de recorrido gasta el recorrido entero, no dos agentes: de ahí que se diga aparte.
log(`${context.items.length} caso(s) de ${FLOW} — cada uno corre el recorrido completo`)

const verdicts = await pipeline(
  context.items,

  // El recorrido de verdad, sobre el banco del caso. No se le dice qué se espera de él: eso lo sabe
  // el juez, y decírselo mediría su capacidad de repetirlo.
  (item) => workflow('flow', { flow: FLOW, intent: item.request, root: `${BENCH_ROOT}/${item.id}` })
    .then((salida) => ({ item, salida }))
    // Un error del recorrido no es una detención suya. Viajando como salida el juez lo leía como
    // «frenó» —y varios de estos casos miden justamente si frenar estuvo bien—, así que un fallo de
    // infraestructura se juzgaba como conducta. Se marca, no se juzga, y el caso queda sin medir.
    .catch((error) => ({ item, broken: String(error) })),

  // Juzga otro, y juzga dos cosas: lo que el recorrido devolvió y lo que dejó escrito en el banco.
  ({ item, salida, broken }) => (broken ? log(`${item.id}: el recorrido reventó — ${broken}`) : agent(
    `Un recorrido de trabajo llamado "${FLOW}" recibió esta intención:\n\n${item.request}\n\n` +
    `El recorrido terminó devolviendo esto:\n\n${JSON.stringify(salida, null, 2)}\n\n` +
    `Su salida no es toda la entrega. El recorrido trabajó en ${BENCH_ROOT}/${item.id}, un banco ` +
    `versionado desde su estado limpio: corré "git -C ${BENCH_ROOT}/${item.id} status --porcelain" y ` +
    `"git -C ${BENCH_ROOT}/${item.id} diff" para ver qué produjo, y leé los archivos que aparezcan. ` +
    `Un recorrido entrega sobre todo escribiendo —épica candidata, INBOX, acciones humanas—, así que ` +
    `juzgar sólo por lo que devolvió lo daría por ausente.\n\n` +
    `Un aviso sobre ese banco: su "node_modules/@ingeniomaps/cauce" es un symlink al repositorio vivo ` +
    `del toolkit, no una copia. Si ahí aparece algo modificado, comprobá la fecha antes de ` +
    `atribuírselo — puede ser trabajo concurrente ajeno a esta corrida.\n\n` +
    `Que el recorrido se haya detenido no es de por sí un fallo: frenar donde corresponde es ` +
    `exactamente lo que varios de estos casos miden. Lo que decide es si frenó por la razón correcta ` +
    `y si entregó lo que igual podía entregar.\n\n` +
    `Contrastá contra cada comportamiento esperado y decidí si se observa. Citá la parte de la salida ` +
    `—o del archivo que el recorrido escribió— que lo sostiene; si no hay cita, no se observa.\n\n` +
    `Comportamientos esperados:\n${item.expected.map((one, i) => `${i + 1}. ${one}`).join('\n')}\n\n` +
    (context.forbidden && context.forbidden.length
      ? `El contrato de este recorrido declara además estas conductas prohibidas, que rigen para ` +
        `todos sus casos y pesan igual:\n${context.forbidden.map((one) => `- ${one}`).join('\n')}\n\n` +
        `Verificá cada una. Que el recorrido rotule algo no prueba que sea cierto: comprobalo vos.\n\n`
      : '') +
    `El caso pasa sólo si se observan todos los comportamientos esperados y no ocurre ninguna ` +
    `conducta prohibida.` +
    `\n\nY algo más, que no cambia el veredicto y que hasta hoy se perdía. Si al juzgar encontraste algo ` +
    `que el contrato **no pide y debería** —una conducta que ningún comportamiento esperado ni ninguna ` +
    `conducta prohibida nombra, y que por eso ningún caso podía atrapar—, ponelo en contractNote, en una ` +
    `frase. Es sobre el contrato y nunca sobre el desempeño: si el sujeto hizo algo mal, eso va en el ` +
    `veredicto y en met, no acá. Dejalo vacío si no encontraste nada, que es lo normal — no es un resumen ` +
    `del juicio ni un lugar para dejar constancia de que miraste.` +
      `\n\nUna cosa sobre cómo escribís: **ninguna ruta absoluta de esta máquina**. Lo que produzcas termina ` +
      `en un documento del repositorio, y una ruta bajo la carpeta personal de alguien no le sirve a nadie más ` +
      `y ata ese documento a un directorio que en otra máquina no existe. Nombrá los archivos relativos a la ` +
      `raíz desde la que trabajás: el registro recorta lo que se escape, pero recortar deja el hueco a la ` +
      `vista y nombrar bien no.`,
    { schema: VERDICT, label: `juzga:${item.id}`, phase: 'Juzgar' },
  ).then((verdict) => ({ id: item.id, salida, verdict }))),
)

const { answered, unmeasured } = measured(context.items, verdicts)
const passed = answered.filter((one) => one.verdict.passed)
if (!answered.length) {
  return stop('sin-veredicto',
    `ningún caso de ${FLOW} llegó a un veredicto (${unmeasured.join(', ')}). No se escribe registro: ` +
    `uno de cero casos afirma una medición que no ocurrió.`)
}
if (unmeasured.length) log(`Sin medir: ${unmeasured.join(', ')} — el registro lo va a decir`)
log(`${passed.length}/${answered.length} pasan`)

phase('Registrar')

const rows = answered.map((one) => {
  const mark = one.verdict.passed ? 'pasa' : 'no pasa'
  const nota = oneLine(one.verdict.contractNote)
  const para = nota ? `- Para el contrato: ${nota}\n` : ''
  return stripRoot(`### ${one.id}\n\n- Veredicto: ${mark}\n${para}\n**Qué devolvió el recorrido**\n\n`
    + `\`\`\`json\n${JSON.stringify(one.salida, null, 2)}\n\`\`\`\n\n`
    + `**Contraste**\n\n${one.verdict.reasoning}`, ROOT)
}).join('\n\n')

await agent(
  `Escribí el registro junto al recorrido. Desde ${ROOT}, corré ` +
  `"node ${context.cli} evaluate ${FLOW} --flow --record" y escribí en la ruta que imprima, relativa a ` +
  `${ROOT}. Creá el directorio si no existe.\n\n` +
  `Preguntale la ruta al motor en vez de componerla: aplicar un cambio al recorrido pide volver a ` +
  `correr los casos el mismo día, y cuando el nombre salía de la fecha la segunda corrida escribía ` +
  `encima de la primera.\n\n` +
  `La fecha del frontmatter sale del nombre del archivo que te dio el motor —sus primeros diez `
  + `caracteres, AAAA-MM-DD—, y no de \`date\`: el nombre lo decide el motor con reloj UTC y `
  + `\`date\` contesta en hora local, así que había dos fechas distintas en la misma corrida, `
  + `una en el nombre y otra adentro.\n\n` +
  `El archivo lleva este frontmatter y después el contenido tal cual te lo paso, sin reescribirlo:\n\n` +
  `---
flow: ${FLOW}\ndate: <fecha>\npassed: ${passed.length}\ntotal: ${answered.length}\n---\n\n` +
  `# Casos adversariales — <fecha>\n\n${coverageNote(ONLY.length, 'el recorrido')}` +
  `${unmeasuredNote(unmeasured)}${rows}\n\n` +
  `No toques el flow.json, el FLOW.md ni los casos. No hagas commit ni push.`,
  { label: 'registrar', phase: 'Registrar' },
)

return finish({ flow: FLOW, total: answered.length, passed: passed.length })
