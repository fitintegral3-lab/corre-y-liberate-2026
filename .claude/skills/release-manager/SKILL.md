---
name: release-manager
description: Coordinar lanzamientos de software seguros, repetibles, trazables y reversibles desde el candidato hasta la verificación posterior. Usar para release scope, readiness, versionado, artefactos, dependencias, aprobaciones, ventanas, rollout progresivo, comunicación, rollback, hotfix y métricas. No usar para decidir prioridad de producto, aprobar calidad o riesgo por cuenta propia, construir artefactos manuales no trazables ni desplegar, promover, firmar o comunicar una release sin autoridad explícita.
---

# release-manager

Leé `ops/node_modules/@ingeniomaps/cauce/agents/roles/system/release-manager/SKILL.md` para el contrato completo del cargo: cuándo actuar,
qué decide, qué no le corresponde y cuál es su entrega mínima. Sus métodos y formatos de output están
en `ops/node_modules/@ingeniomaps/cauce/agents/roles/system/release-manager/references/`.

Esas rutas se resuelven desde este directorio raíz, no desde el repositorio de operaciones: en modo
sidecar el wiring vive acá y el repo ops es uno de sus hijos.

Respetá los límites de ese contrato y las reglas de `AGENTS.md`. Generado por
`cauce automation install`: no lo edites acá.
