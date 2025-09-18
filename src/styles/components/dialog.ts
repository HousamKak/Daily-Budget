import { paperStyles, paperTheme } from '../themes/paper-theme';

export const dialogStyles = {
  // Paper dialog container
  paperDialog: paperStyles.paperCard,

  // Paper texture overlay
  paperTexture: paperStyles.paperTexture,

  // Yellow tape effect
  yellowTape: paperStyles.yellowTape,

  // Torn edge effect
  tornEdge: paperStyles.tornEdge,

  // Dialog content wrapper
  contentWrapper: 'relative z-10',

  // Dialog header
  header: {
    container: 'text-center pb-4 pt-2',
    title: `text-xl sm:text-2xl font-bold ${paperTheme.colors.text.secondary} flex items-center justify-center gap-2 ${paperTheme.fonts.handwriting} leading-relaxed py-3 min-h-[3rem]`,
    subtitle: `text-xs sm:text-sm ${paperTheme.colors.text.muted} mt-1 ${paperTheme.fonts.handwriting}`,
  },

  // Form container
  form: {
    container: 'space-y-4',
    fieldContainer: 'space-y-2',
    inputWrapper: 'relative',
    input: `bg-white/80 ${paperTheme.colors.borders.amber} focus:border-amber-400 focus:ring-amber-200 ${paperTheme.radius.md}`,
    inputWithIcon: `pl-10 bg-white/80 ${paperTheme.colors.borders.amber} focus:border-amber-400 focus:ring-amber-200 ${paperTheme.radius.md}`,
    iconContainer: `absolute left-3 top-1/2 -translate-y-1/2 ${paperTheme.colors.text.muted}`,
    label: `${paperTheme.colors.text.secondary} font-medium`,
  },

  // Form section with background
  formSection: `${paperTheme.colors.background.whiteTransparent} ${paperTheme.radius.md} ${paperTheme.spacing.padding.dialog} ${paperTheme.colors.borders.amber} ${paperTheme.spacing.margin.section}`,

  // Buttons
  buttons: {
    container: 'flex justify-end gap-2',
    primary: `${paperStyles.primaryButton} ${paperTheme.fonts.handwriting}`,
    secondary: `cursor-pointer ${paperTheme.radius.md} bg-white/80 hover:bg-stone-100 border-stone-300 hover:border-stone-400 ${paperTheme.colors.text.secondary} hover:text-stone-900 ${paperTheme.effects.shadow.sm} ${paperTheme.animations.hover} ${paperTheme.fonts.handwriting}`,
    ghost: `w-full ${paperTheme.colors.text.muted} hover:text-stone-800 cursor-pointer h-10 text-sm ${paperTheme.fonts.handwriting}`,
  },

  // Status messages
  messages: {
    error: `${paperTheme.colors.text.secondary} text-sm bg-red-50 border border-red-200 ${paperTheme.radius.sm} p-3`,
    success: `text-green-700 text-sm bg-green-50 border border-green-200 ${paperTheme.radius.sm} p-3`,
  },

  // Footer section
  footer: `space-y-2 pt-2 border-t ${paperTheme.colors.borders.amber}`,
} as const;