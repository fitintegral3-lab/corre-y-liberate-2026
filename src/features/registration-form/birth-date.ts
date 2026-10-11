/** Conserva el contrato ISO del servidor sin depender del calendario del teléfono. */
export function birthDateFromParts(day: string, month: string, year: string): string {
  if (!/^\d{1,2}$/.test(day) || !/^\d{1,2}$/.test(month) || !/^\d{4}$/.test(year.trim())) {
    return '';
  }
  return `${year.trim()}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
