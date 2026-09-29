'use client';

import { Download, Maximize2, X } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';

import { formatCop } from '@/lib/format';

interface QrPaymentProps {
  qrImage: string;
  distanceId: string;
  total: number;
  basePrice: number;
  discount: number;
  code: string | null;
}

/**
 * QR de pago Bre-B, con un modal para verlo grande.
 *
 * Quien se inscribe desde el celular no puede escanear la pantalla que esta
 * mirando: el modal le muestra el QR en grande para tomarle captura (o
 * descargarlo) y cargarlo desde la galeria de su app, y le recuerda guardar
 * el comprobante, que es lo que despues sube al formulario.
 */
export function QrPayment({
  qrImage,
  distanceId,
  total,
  basePrice,
  discount,
  code,
}: QrPaymentProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const alt = `QR Bre-B para pagar ${formatCop(total)}`;
  const download = (
    <a
      href={qrImage}
      download={`qr-bre-b-corre-y-liberate-${distanceId}.webp`}
      className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-neutral-900 px-4 py-2 font-athletic-bold text-xs tracking-wider text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      DESCARGAR QR
    </a>
  );

  return (
    <div className="grid items-center gap-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:grid-cols-[auto_1fr]">
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-haspopup="dialog"
        className="group relative mx-auto cursor-zoom-in rounded-xl bg-white p-3 shadow-sm"
      >
        <Image src={qrImage} alt={alt} width={200} height={200} unoptimized />
        <span className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-neutral-600 group-hover:text-brand-orange">
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
          Toca para ampliar
        </span>
      </button>

      <div className="space-y-2 text-sm">
        <p className="font-athletic-bold text-xs tracking-widest text-brand-orange">
          PAGA CON QR BRE-B
        </p>
        {discount > 0 && code && (
          <p className="text-neutral-500">
            <span className="line-through">{formatCop(basePrice)}</span>{' '}
            <span className="font-semibold text-green-700">
              −{formatCop(discount)} con {code}
            </span>
          </p>
        )}
        <p className="font-athletic text-4xl text-neutral-950">{formatCop(total)}</p>
        <p className="text-neutral-600">
          Escanea el QR desde la app de tu banco o billetera. El valor ya viene cargado: paga
          exactamente ese monto y guarda el comprobante para subirlo abajo.
        </p>
        {download}
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="qr-dialog-title"
        // Un clic en el propio <dialog> y no en su contenido es un clic en el fondo.
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-center text-ink shadow-2xl backdrop:bg-black/80 backdrop:backdrop-blur-sm"
      >
        <div className="relative p-6 sm:p-8">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Cerrar"
            className="absolute top-3 right-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          <p className="font-athletic-bold text-xs tracking-widest text-brand-orange">
            PAGO CON QR BRE-B
          </p>
          <h3 id="qr-dialog-title" className="mt-1 font-athletic text-4xl text-neutral-950">
            {formatCop(total)}
          </h3>

          <div className="mx-auto mt-4 w-full max-w-80">
            <Image
              src={qrImage}
              alt={alt}
              width={320}
              height={320}
              unoptimized
              className="h-auto w-full"
            />
          </div>

          <ol className="mt-5 space-y-2 text-left text-sm text-neutral-700">
            <li>
              <strong>1.</strong> Tómale captura a este QR (o descárgalo).
            </li>
            <li>
              <strong>2.</strong> Escanéalo con la app de tu banco o billetera y paga{' '}
              {formatCop(total)}.
            </li>
            <li>
              <strong>3.</strong> Recuerda guardar el comprobante de pago: lo vas a añadir en el
              formulario.
            </li>
          </ol>

          <div className="mt-5 flex justify-center">{download}</div>
        </div>
      </dialog>
    </div>
  );
}
