import { colors } from '../theme';
import { ServiceCategory } from '../types/serviceRequest';

export interface ServiceCategoryMeta {
  value: ServiceCategory;
  label: string;
  emoji: string;
  description: string;
  gradientColors: [string, string];
}

export interface ServiceSearchAlias {
  id: string;
  label: string;
  serviceCategory: ServiceCategory;
  keywords: string[];
}

export const SERVICE_CATEGORY_OPTIONS: ServiceCategoryMeta[] = [
  {
    value: 'plumbing',
    label: 'Plumbing',
    emoji: '🔧',
    description: 'Pipes & water',
    gradientColors: [colors.primary[500], colors.primary[700]],
  },
  {
    value: 'electrical',
    label: 'Electrical',
    emoji: '⚡',
    description: 'Wiring & power',
    gradientColors: [colors.accent.mustard, '#F59500'],
  },
  {
    value: 'cleaning',
    label: 'Cleaning',
    emoji: '🧹',
    description: 'Home cleaning',
    gradientColors: [colors.accent.cyan, colors.primary[600]],
  },
  {
    value: 'gardening',
    label: 'Gardening',
    emoji: '🌿',
    description: 'Garden & lawn',
    gradientColors: ['#22C55E', '#16A34A'],
  },
  {
    value: 'painting',
    label: 'Painting',
    emoji: '🎨',
    description: 'Walls & surfaces',
    gradientColors: [colors.accent.coral, '#C0331F'],
  },
  {
    value: 'carpentry',
    label: 'Carpentry',
    emoji: '🪚',
    description: 'Wood & furniture',
    gradientColors: ['#A16207', '#78420A'],
  },
  {
    value: 'moving',
    label: 'Moving',
    emoji: '📦',
    description: 'Relocation help',
    gradientColors: [colors.primary[400], colors.primary[700]],
  },
  {
    value: 'other',
    label: 'Other',
    emoji: '⚙️',
    description: 'Other services',
    gradientColors: [colors.neutral[500], colors.neutral[700]],
  },
];

export const VISIBLE_SERVICE_CATEGORY_OPTIONS = SERVICE_CATEGORY_OPTIONS.filter(
  (category) => category.value !== 'other'
);

export const SERVICE_CATEGORY_ROWS = [
  VISIBLE_SERVICE_CATEGORY_OPTIONS.slice(0, 2),
  VISIBLE_SERVICE_CATEGORY_OPTIONS.slice(2, 4),
  VISIBLE_SERVICE_CATEGORY_OPTIONS.slice(4, 6),
  VISIBLE_SERVICE_CATEGORY_OPTIONS.slice(6, 8),
];

export const SERVICE_SEARCH_ALIASES: ServiceSearchAlias[] = [
  {
    id: 'alias-electrician',
    label: 'Electrician',
    serviceCategory: 'electrical',
    keywords: ['electric', 'electrician', 'wiring', 'power', 'lights'],
  },
  {
    id: 'alias-plumber',
    label: 'Plumber',
    serviceCategory: 'plumbing',
    keywords: ['plumb', 'plumber', 'pipes', 'water', 'leak'],
  },
  {
    id: 'alias-house-cleaner',
    label: 'House Cleaner',
    serviceCategory: 'cleaning',
    keywords: ['clean', 'cleaner', 'house cleaner', 'maid', 'home cleaning'],
  },
  {
    id: 'alias-gardener',
    label: 'Gardener',
    serviceCategory: 'gardening',
    keywords: ['garden', 'gardener', 'lawn', 'plants', 'yard'],
  },
  {
    id: 'alias-painter',
    label: 'Painter',
    serviceCategory: 'painting',
    keywords: ['paint', 'painter', 'walls', 'surfaces'],
  },
  {
    id: 'alias-carpenter',
    label: 'Carpenter',
    serviceCategory: 'carpentry',
    keywords: ['carpenter', 'wood', 'furniture', 'cabinet'],
  },
  {
    id: 'alias-mover',
    label: 'Mover',
    serviceCategory: 'moving',
    keywords: ['move', 'mover', 'relocation', 'boxes', 'transport'],
  },
];

export const SERVICE_CATEGORY_MAP = Object.fromEntries(
  SERVICE_CATEGORY_OPTIONS.map((category) => [category.value, category])
) as Record<ServiceCategory, ServiceCategoryMeta>;

export function getServiceCategoryMeta(category: ServiceCategory): ServiceCategoryMeta {
  return SERVICE_CATEGORY_MAP[category] ?? SERVICE_CATEGORY_MAP.other;
}

export function getServiceCategoryLabel(category: ServiceCategory): string {
  return getServiceCategoryMeta(category).label;
}

export function getServiceSearchSuggestions(query: string): ServiceSearchAlias[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  return SERVICE_SEARCH_ALIASES.filter((alias) =>
    [alias.label, ...alias.keywords].some((term) => term.toLowerCase().startsWith(normalizedQuery))
  );
}
