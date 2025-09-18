import { paperTheme } from '../themes/paper-theme';

export const summaryCardStyles = {
  // Base card
  base: `${paperTheme.radius.lg} border-2 ${paperTheme.effects.shadow.sm} px-3 py-2 bg-white/80`,

  // Variants
  variants: {
    default: paperTheme.colors.borders.amber,
    highlight: 'border-emerald-400 bg-emerald-50/80',
    red: 'border-red-300 bg-red-50/80',
  },

  // Text styles
  title: 'text-xs opacity-70 font-medium',
  value: `text-lg font-bold tracking-wide ${paperTheme.fonts.handwriting}`,
  valueRed: 'text-red-600',
} as const;