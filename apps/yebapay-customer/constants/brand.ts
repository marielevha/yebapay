export const Brand = {
  name: 'YebaPay',
  slogan: "Scanne. Paye. C'est regle.",
  productLine: 'Le wallet QR du quotidien.',
  positioning:
    "Une experience de paiement QR plus simple, plus claire et plus moderne que les parcours mobile money traditionnels.",
} as const;

export const BrandColors = {
  ink: '#12312E',
  palm: '#1E6B5B',
  sand: '#F4E8D1',
  mist: '#EEF5F1',
  sun: '#D79A2B',
  clay: '#D85C34',
  cloud: '#FAFAF7',
  slate: '#667874',
  white: '#FFFFFF',
  black: '#0E1513',
} as const;

export const BrandGradients = {
  hero: ['#12312E', '#1E6B5B'],
  warm: ['#F4E8D1', '#FAFAF7'],
  accent: ['#D79A2B', '#D85C34'],
} as const;

export const BrandRadii = {
  card: 24,
  button: 18,
  pill: 999,
} as const;

export const BrandShadow = {
  card: {
    shadowColor: '#12312E',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
} as const;

export const BrandCopy = {
  quickActions: ['Scanner', 'Transferer', 'Demander', 'Mon QR'],
  trustPillars: ['Frais visibles', 'Paiement rapide', 'Historique clair'],
} as const;
