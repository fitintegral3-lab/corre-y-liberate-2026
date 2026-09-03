import { AwardCardData, PresaleRow, RunnerKitItem, DistanceInfo } from '../types/event';

export const EVENT_DATA = {
  name: "Corre y Libérate",
  year: "2026",
  edition: "2ª EDICIÓN",
  slogan: "CADA KILÓMETRO PROTEGE, INSPIRA Y TRANSFORMA",
  dateFull: "Domingo 22 de noviembre de 2026",
  dateShort: "22 NOV 2026",
  dateIso: "2026-11-22T06:00:00-05:00",
  venue: "Estadio El Cacique",
  address: "Km 2 Vía Chipaya, Alfaguara",
  city: "Jamundí, Valle del Cauca",
  openingTime: "5:00 A.M.",
  openingText: "Llega con tiempo, ubica tu corral y disfruta de las experiencias y stands antes de la salida.",
  registrationUrl: "https://cronometrajeinstantaneo.com/inscripciones/corre-y-liberate",
  mapsUrl: "https://share.google/VDmYIqfv4StJiX6wc",
  whatsappUrl: "https://wa.me/573000000000?text=Hola,%20deseo%20información%20sobre%20Corre%20y%20Libérate%202026",
  instagramUrl: "https://instagram.com/correyliberate",
  facebookUrl: "https://facebook.com/correyliberate",
};

export const DISTANCES: DistanceInfo[] = [
  { id: '5k', label: '5K', name: '5K Recreativa', distanceKm: 5, time: '6:20 am', isCompetitive: true },
  { id: '7k', label: '7K', name: '7K Desafío', distanceKm: 7, time: '6:10 am', isCompetitive: true },
  { id: '10k', label: '10K', name: '10K Competitiva Pro', distanceKm: 10, time: '6:00 am', isCompetitive: true },
  { id: '3k', label: '3K', name: '3K Infantil & Familiar', distanceKm: 3.5, time: '6:30 am', categoryDesc: '7 a 12 años', isCompetitive: false },
];

export const AWARDS: AwardCardData[] = [
  {
    distance: '5k',
    label: '5K',
    bgColor: 'bg-[#3B233D]',
    textColor: 'text-white',
    glowColor: 'rgba(122, 34, 200, 0.4)',
    positions: [
      { place: '1.° LUGAR', womenAmount: '$250.000', menAmount: '$250.000' },
      { place: '2.° LUGAR', womenAmount: '$100.000', menAmount: '$100.000' },
      { place: '3.° LUGAR', womenAmount: '$50.000', menAmount: '$50.000' },
    ],
    totalPerGender: '$400.000',
  },
  {
    distance: '7k',
    label: '7K',
    bgColor: 'bg-[#FCE6D2]',
    textColor: 'text-[#111111]',
    glowColor: 'rgba(255, 122, 0, 0.35)',
    positions: [
      { place: '1.° LUGAR', womenAmount: '$350.000', menAmount: '$350.000' },
      { place: '2.° LUGAR', womenAmount: '$150.000', menAmount: '$150.000' },
      { place: '3.° LUGAR', womenAmount: '$100.000', menAmount: '$100.000' },
    ],
    totalPerGender: '$600.000',
  },
  {
    distance: '10k',
    label: '10K',
    bgColor: 'bg-[#141215]',
    textColor: 'text-white',
    badge: 'Distancia Reina',
    glowColor: 'rgba(255, 77, 0, 0.5)',
    positions: [
      { place: '1.° LUGAR', womenAmount: '$800.000', menAmount: '$800.000' },
      { place: '2.° LUGAR', womenAmount: '$450.000', menAmount: '$450.000' },
      { place: '3.° LUGAR', womenAmount: '$250.000', menAmount: '$250.000' },
    ],
    totalPerGender: '$1.500.000',
  },
];

export const PRESALES: PresaleRow[] = [
  {
    distanceKey: '5k',
    label: '5K',
    subtitle: '5 kilómetros',
    presale1: '$100.000',
    presale2: '$120.000',
    presale3: '$140.000',
  },
  {
    distanceKey: '7k',
    label: '7K',
    subtitle: '7 kilómetros',
    presale1: '$120.000',
    presale2: '$140.000',
    presale3: '$160.000',
  },
  {
    distanceKey: '10k',
    label: '10K',
    subtitle: '10 kilómetros',
    presale1: '$140.000',
    presale2: '$160.000',
    presale3: '$180.000',
  },
  {
    distanceKey: '3k',
    label: '3K INFANTIL',
    subtitle: '(7 a 12 años)',
    presale1: '$90.000',
    presale2: '$90.000',
    presale3: '$90.000',
  },
];

export const RUNNER_KIT_ITEMS: RunnerKitItem[] = [
  { id: 'camiseta', name: 'Camiseta', iconSrc: '/icons/camiseta.png' },
  { id: 'medalla', name: 'Medalla', iconSrc: '/icons/medalla.png' },
  { id: 'dorsal', name: 'Dorsal', iconSrc: '/icons/dorsal.png' },
  { id: 'chip', name: 'Chip', iconSrc: '/icons/chip.png' },
  { id: 'tula', name: 'Tula', iconSrc: '/icons/tula.png' },
  { id: 'hidratacion', name: 'Hidratación', iconSrc: '/icons/hidratacion.png' },
];

export const PILLARS = [
  {
    number: '01',
    title: 'PROTEGE',
    description: 'Cuida tu cuerpo, tu mente y tu bienestar.',
  },
  {
    number: '02',
    title: 'INSPIRA',
    description: 'Tu decisión de empezar puede motivar a alguien más.',
  },
  {
    number: '03',
    title: 'TRANSFORMA',
    description: 'Haz que cada paso genere algo positivo más allá de ti.',
  },
];
