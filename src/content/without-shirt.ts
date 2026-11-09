/** Tarifas base sin camiseta y sin código; los QR con código viven solo en el servidor. */
export const withoutShirtPrices = { '5k': 100_000, '10k': 130_000 } as const;

export function supportsWithoutShirt(
  distanceId: string,
): distanceId is keyof typeof withoutShirtPrices {
  return Object.hasOwn(withoutShirtPrices, distanceId);
}
