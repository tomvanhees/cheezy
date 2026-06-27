export const TEXTURES = [
  { value: 'vers', label: 'Vers' },
  { value: 'zacht', label: 'Zacht' },
  { value: 'halfzacht', label: 'Halfzacht' },
  { value: 'halfhard', label: 'Halfhard' },
  { value: 'hard', label: 'Hard' },
] as const;

export const MILK_TYPES = [
  { value: 'koe', label: 'Koe' },
  { value: 'geit', label: 'Geit' },
  { value: 'schaap', label: 'Schaap' },
  { value: 'buffel', label: 'Buffel' },
  { value: 'gemengd', label: 'Gemengd' },
] as const;

export interface OriginCountry {
  country: string;
  regions: string[];
}

export const ORIGINS: OriginCountry[] = [
  {
    country: 'België',
    regions: ['Ardennen', 'Brabant', 'Luik', 'Vlaanderen'],
  },
  {
    country: 'Danmark',
    regions: ['Jutland'],
  },
  {
    country: 'Duitsland',
    regions: ['Allgäu', 'Bayern', 'Beieren'],
  },
  {
    country: 'Frankrijk',
    regions: [
      'Alsace',
      'Auvergne',
      'Bourgogne',
      'Bretagne',
      'Île-de-France',
      'Normandie',
      'Périgord',
      'Provence',
      'Savoie',
    ],
  },
  {
    country: 'Griekenland',
    regions: ['Kreta', 'Macedonië', 'Thessalië'],
  },
  {
    country: 'Ierland',
    regions: ['County Cork', 'County Tipperary'],
  },
  {
    country: 'Italië',
    regions: [
      'Campania',
      'Emilia-Romagna',
      'Lombardia',
      'Piemonte',
      'Sardegna',
      'Toscana',
      'Veneto',
    ],
  },
  {
    country: 'Nederland',
    regions: ['Edam', 'Friesland', 'Gouda', 'Noord-Holland', 'Zuid-Holland'],
  },
  {
    country: 'Oostenrijk',
    regions: ['Tirol', 'Vorarlberg'],
  },
  {
    country: 'Portugal',
    regions: ['Alentejo', 'Serra da Estrela', 'Trás-os-Montes'],
  },
  {
    country: 'Spanje',
    regions: [
      'Asturië',
      'Baskenland',
      'Cantabrië',
      'Castilië-La Mancha',
      'Extremadura',
      'Galicië',
    ],
  },
  {
    country: 'Verenigd Koninkrijk',
    regions: ['Cheshire', 'Lancashire', 'Schotland', 'Somerset', 'Wiltshire', 'Yorkshire'],
  },
  {
    country: 'Zwitserland',
    regions: ['Appenzell', 'Bern', 'Fribourg', 'Graubünden'],
  },
];

export const USER_COLORS = [
  '#E57373',
  '#64B5F6',
  '#81C784',
  '#FFB74D',
  '#BA68C8',
  '#4DB6AC',
  '#F06292',
  '#7986CB',
];
