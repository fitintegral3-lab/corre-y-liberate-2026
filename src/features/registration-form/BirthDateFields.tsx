import styles from './RegistrationForm.module.css';

const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function BirthDateFields({ error }: { error?: string }) {
  return (
    <fieldset className={styles.birthDate} aria-describedby={error ? 'birthDate-error' : undefined}>
      <legend className="text-sm font-semibold text-neutral-800">Fecha de nacimiento *</legend>
      <div className={styles.dateParts}>
        <label>
          Día
          <select
            name="birthDay"
            autoComplete="bday-day"
            defaultValue=""
            aria-invalid={Boolean(error)}
          >
            <option value="" disabled>
              Día
            </option>
            {Array.from({ length: 31 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
        </label>
        <label>
          Mes
          <select
            name="birthMonth"
            autoComplete="bday-month"
            defaultValue=""
            aria-invalid={Boolean(error)}
          >
            <option value="" disabled>
              Mes
            </option>
            {months.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </label>
        <label>
          Año
          <input
            name="birthYear"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            placeholder="1990"
            autoComplete="bday-year"
            aria-invalid={Boolean(error)}
          />
        </label>
      </div>
      {error && (
        <p id="birthDate-error" className="mt-1 text-xs font-semibold text-red-700">
          {error}
        </p>
      )}
    </fieldset>
  );
}
