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

export const CHEESE_FAMILIES = [
  { value: 'Blauwschimmelkaas', label: 'Blauwschimmelkaas' },
  { value: 'Gewassenkorstkaas', label: 'Gewassenkorstkaas' },
  { value: 'Harde kaas', label: 'Harde kaas' },
  { value: 'Halfharde kaas', label: 'Halfharde kaas' },
  { value: 'Verse kaas', label: 'Verse kaas' },
  { value: 'Witschimmelkaas', label: 'Witschimmelkaas' },
  { value: 'Zachte kaas', label: 'Zachte kaas' },
  { value: 'Geitenkaas', label: 'Geitenkaas' },
  { value: 'Schapenkaas', label: 'Schapenkaas' },
  { value: 'Feta', label: 'Feta' },
  { value: 'Mozzarella', label: 'Mozzarella' },
  { value: 'Parmezaantype', label: 'Parmezaantype' },
  { value: 'Cheddartype', label: 'Cheddartype' },
  { value: 'Goudatype', label: 'Goudatype' },
] as const;

// Standard Dutch/Belgian aging scale
export const AGING_PERIODS = [
  { value: 'Vers', label: 'Vers (0–2 weken)' },
  { value: 'Jong', label: 'Jong (4–8 weken)' },
  { value: 'Jong belegen', label: 'Jong belegen (2–4 mnd)' },
  { value: 'Belegen', label: 'Belegen (4–7 mnd)' },
  { value: 'Extra belegen', label: 'Extra belegen (7–10 mnd)' },
  { value: 'Oud', label: 'Oud (10–12 mnd)' },
  { value: 'Extra oud', label: 'Extra oud (12–18 mnd)' },
  { value: 'Overjarig', label: 'Overjarig (18+ mnd)' },
] as const;

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
