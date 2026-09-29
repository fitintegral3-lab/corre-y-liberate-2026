import { describe, expect, it } from 'vitest';

import { categoryFor, registrationSchema } from '@/domain/registration/schema';

const valid = {
  email: '  Runner@Example.com ',
  firstName: 'Ana',
  lastName: 'Pérez',
  city: 'Jamundí',
  gender: 'femenino',
  distanceId: '5k',
  birthDate: '1990-05-10',
  shirtSize: 'Small (S)',
  cedula: '1.144.135.260',
  phone: '+57 300 123 4567',
  eps: 'Sura',
  bloodType: 'A+',
  team: '',
  emergencyName: 'Luis Pérez',
  emergencyPhone: '310 765 4321',
  recentCompetition: 'NO',
  hasIllness: 'NO',
  medicalCondition: '',
  observation: '',
  referralCode: ' valecorre ',
  acceptedTerms: true,
  receiptPath: 'pendientes/0b0f8c9e-1d2a-4c3b-9e8f-7a6b5c4d3e2f.jpg',
};

const errorsOf = (input: object) => {
  const result = registrationSchema.safeParse(input);
  return result.success
    ? {}
    : Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message]));
};

describe('registrationSchema', () => {
  it('normaliza cedula, celulares, correo, codigo y opcionales vacios', () => {
    const result = registrationSchema.parse(valid);
    expect(result).toMatchObject({
      email: 'runner@example.com',
      cedula: '1144135260',
      phone: '3001234567',
      emergencyPhone: '3107654321',
      referralCode: 'VALECORRE',
      recentCompetition: false,
      team: null,
      medicalCondition: null,
    });
  });

  it('acepta como vacios los opcionales que el formulario no mostro', () => {
    // Con "No" en la enfermedad, el campo de la condicion no se muestra y
    // FormData lo manda como null.
    const result = registrationSchema.safeParse({
      ...valid,
      medicalCondition: null,
      team: null,
      city: null,
      observation: null,
    });
    expect(result.success).toBe(true);
  });

  it('exige aceptar el reglamento', () => {
    expect(errorsOf({ ...valid, acceptedTerms: false })).toHaveProperty('acceptedTerms');
  });

  it('pide cual enfermedad cuando dice que padece una', () => {
    expect(errorsOf({ ...valid, hasIllness: 'SI' })).toHaveProperty('medicalCondition');
    expect(errorsOf({ ...valid, hasIllness: 'SI', medicalCondition: 'Asma' })).not.toHaveProperty(
      'medicalCondition',
    );
  });

  it('no acepta al propio corredor como contacto de emergencia', () => {
    expect(errorsOf({ ...valid, emergencyPhone: '3001234567' })).toHaveProperty('emergencyPhone');
  });

  it('rechaza un celular que no es colombiano de 10 digitos', () => {
    expect(errorsOf({ ...valid, phone: '12345' })).toHaveProperty('phone');
  });

  it('rechaza una fecha de nacimiento futura', () => {
    expect(errorsOf({ ...valid, birthDate: '2999-01-01' })).toHaveProperty('birthDate');
  });

  it('solo acepta comprobantes en la carpeta de pendientes, con nombre generado', () => {
    expect(errorsOf({ ...valid, receiptPath: '../otro-bucket/x.jpg' })).toHaveProperty(
      'receiptPath',
    );
  });
});

describe('categoryFor', () => {
  it('arma la categoria como la muestra cronometraje', () => {
    expect(categoryFor('5K', 'femenino')).toBe('5K ( FEMENINO )');
  });
});
