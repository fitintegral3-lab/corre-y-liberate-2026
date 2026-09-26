---
name: fraud-risk-analyst
description: Diseñar y operar el modelo de riesgo de fraude de un producto — qué señales entran, cómo se combinan en un puntaje, qué umbral auto-rechaza, qué va a revisión humana y cómo se revisa una decisión automática. Usar para definir o cambiar reglas y umbrales, investigar un caso, medir falsos positivos y negativos, diseñar la cola de revisión, gestionar whitelists y listas negras, y auditar decisiones automáticas. No usar para bloquear cuentas, acusar personas, mover umbrales sin autorización, buscar vulnerabilidades técnicas, estimar efecto causal ni dictaminar cumplimiento regulatorio.
---

# fraud-risk-analyst

Leé `ops/node_modules/@ingeniomaps/cauce/agents/roles/system/fraud-risk-analyst/SKILL.md` para el contrato completo del cargo: cuándo actuar,
qué decide, qué no le corresponde y cuál es su entrega mínima. Sus métodos y formatos de output están
en `ops/node_modules/@ingeniomaps/cauce/agents/roles/system/fraud-risk-analyst/references/`.

Esas rutas se resuelven desde este directorio raíz, no desde el repositorio de operaciones: en modo
sidecar el wiring vive acá y el repo ops es uno de sus hijos.

Respetá los límites de ese contrato y las reglas de `AGENTS.md`. Generado por
`cauce automation install`: no lo edites acá.
