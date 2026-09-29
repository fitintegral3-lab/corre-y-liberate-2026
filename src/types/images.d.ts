// Tipos de los `import x from './imagen.webp'` (los QR con descuento en
// src/lib/registration/payment-config.ts). Next los declara en next-env.d.ts,
// pero ese archivo se genera al correr dev o build y esta en .gitignore: el CI
// corre `tsc` sin generarlo y fallaba con TS2307. Esta referencia trae las
// mismas declaraciones desde el paquete de Next, sin depender del generado.
/// <reference types="next/image-types/global" />
