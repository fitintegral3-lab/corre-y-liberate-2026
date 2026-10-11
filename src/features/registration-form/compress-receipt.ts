/**
 * Achica la foto del comprobante en el navegador antes de subirla.
 *
 * Una foto de celular pesa 3-5 MB y la funcion de Vercel que la recibe tiene
 * un tope de 4,5 MB; ademas, 400 fotos sin comprimir ocuparian mas de 1 GB.
 * Con 2000 px de lado mayor y WebP al 82 % el texto de un comprobante se sigue
 * leyendo y el archivo queda en unos 300 KB.
 *
 * Si el navegador no sabe codificar WebP (`toBlob` devuelve otro tipo) se usa
 * JPEG. Un PDF, o una imagen que no se pueda optimizar, se manda tal cual:
 * el servidor igual revisa tipo y tamano.
 */
const MAX_SIDE = 2000;
const QUALITY = 0.82;

async function encode(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

async function decode(file: File): Promise<{
  image: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
}> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        image: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      };
    } catch {
      // Algunos navegadores tienen la API pero no decodifican todos los formatos.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('image-decode'));
      image.src = url;
    });
    return {
      image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

export async function compressReceipt(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) return file;
  let decoded: Awaited<ReturnType<typeof decode>> | undefined;
  try {
    decoded = await decode(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(decoded.width, decoded.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(decoded.width * scale);
    canvas.height = Math.round(decoded.height * scale);
    const context = canvas.getContext('2d');
    if (!context || typeof canvas.toBlob !== 'function') return file;
    // Fondo blanco: un PNG con transparencia pasado a JPEG quedaria negro.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(decoded.image, 0, 0, canvas.width, canvas.height);

    let blob = await encode(canvas, 'image/webp');
    if (!blob || blob.type !== 'image/webp') blob = await encode(canvas, 'image/jpeg');
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  } finally {
    decoded?.release();
  }
}
