import type { RatingLevel } from './types';

export const Colors = {
  background: '#FFF8E7',
  surface: '#FFFFFF',
  primary: '#F6A623',
  primaryDark: '#D4891A',
  text: '#4A2C0A',
  textSecondary: '#8B6340',
  textMuted: '#B89070',
  border: '#EDD9B0',
  shadow: 'rgba(74, 44, 10, 0.12)',
  rating: {
    vies: '#E53E3E',
    eetbaar: '#DD6B20',
    lekker: '#68D391',
    heerlijk: '#276749',
  } satisfies Record<RatingLevel, string>,
};

export const Fonts = {
  heading: 'Fraunces_700Bold',
  headingRegular: 'Fraunces_400Regular',
  body: 'Nunito_400Regular',
  bodyBold: 'Nunito_700Bold',
  bodySemiBold: 'Nunito_600SemiBold',
};

export const Radius = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 999,
};

export const Shadow = {
  card: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
};
