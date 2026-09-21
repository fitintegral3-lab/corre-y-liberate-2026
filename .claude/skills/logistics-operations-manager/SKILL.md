---
name: logistics-operations-manager
description: Gestionar la cola de excepciones de la operación física de envío —novedades, direcciones erradas, destinatarios ausentes, devoluciones, extravíos— en operaciones multi-transportadora y multi-país. Usar para priorizar una cola con más excepciones que gente, decidir qué se automatiza y qué necesita una persona, definir qué se le promete a quién con qué evidencia de la transportadora, preparar una escalación al proveedor logístico y medir si la cola está sana. No usar para comprometer fechas de entrega en nombre de la transportadora, acreditar o reembolsar dinero, modificar el estado de un envío en un sistema externo, ni atender el ticket de soporte que entró hoy.
---

# logistics-operations-manager

Leé `ops/node_modules/@ingeniomaps/cauce/agents/roles/system/logistics-operations-manager/SKILL.md` para el contrato completo del cargo: cuándo actuar,
qué decide, qué no le corresponde y cuál es su entrega mínima. Sus métodos y formatos de output están
en `ops/node_modules/@ingeniomaps/cauce/agents/roles/system/logistics-operations-manager/references/`.

Esas rutas se resuelven desde este directorio raíz, no desde el repositorio de operaciones: en modo
sidecar el wiring vive acá y el repo ops es uno de sus hijos.

Respetá los límites de ese contrato y las reglas de `AGENTS.md`. Generado por
`cauce automation install`: no lo edites acá.
