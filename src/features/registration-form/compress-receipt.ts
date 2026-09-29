/**
 * Achica la foto del comprobante en el navegador antes de subirla.
 *
 * Una foto de celular pesa 3-5 MB y la funcion de Vercel que la recibe tiene
 * un tope de 4,5 MB; ademas, 400 fotos sin comprimir ocuparian mas de 1 GB.
 * Con 2000 px de lado mayor y WebP al 82 % el texto de un comprobante se sigue
 * leyendo y el archivo queda en unos 300 KB.
 *
 * Si el navegador no sabe codificar WebP (`toBlob` devuelve otro tipo) se usa
 * JPEG. Un PDF, o una imagen que no se pueda decodificar, se manda tal cual:
 * el servidor igual revisa tipo y tamano.
 */
const MAX_SIDE = 2000;
const QUALITY = 0.82;

async function encode(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

export async function compressReceipt(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  if (!context) return file;
  // Fondo blanco: un PNG con transparencia pasado a JPEG quedaria negro.
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let blob = await encode(canvas, 'image/webp');
  if (!blob || blob.type !== 'image/webp') blob = await encode(canvas, 'image/jpeg');
  if (!blob || blob.size >= file.size) return file;

  const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';
  const name = file.name.replace(/\.[^.]+$/, '') || 'comprobante';
  return new File([blob], `${name}.${extension}`, { type: blob.type });
}
